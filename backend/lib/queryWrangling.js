// Node/Express
const path = require('path');
// Misc
const _ = require('underscore');
// Saltymotion
const atelierQuery = require('./db/atelierQuery');
const auctionQuery = require('./db/auctionQuery');
const reviewerQuery = require('./db/reviewerQuery');
const userQuery = require('./db/userQuery');
const tagQuery = require('./db/tagQuery');
const followerQuery = require('./db/reviewerFollowerQuery');
const atelierReference = require('./atelierStatus');
const activityReference = require('./activity');
const sanityCheck = require('./sanityCheck');
const redisCache = require('./redis/cacheQuery');
const { RedisHashKey } = require('./redis/cacheModel');
const {
  GAME_CATEGORY_LABEL,
  REVIEWER_CATEGORY_LABEL,
  UPLOADER_CATEGORY_LABEL,
  TAG_CATEGORY_LABEL,
  ATELIER_CATEGORY_LABEL,
} = require('./applicationSettings');

const appLogger = require('./log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Merge the atelier description query result and the auction info, keyed on an atelierID
 * Arguments are usually what is returned from `selectAtelierDescriptionForUploader`
 * @param {object} atelierDescriptions - List of objects containing atelier description
 * @param {object} auctions - List of auctions information
 * @return {object}
 */
module.exports.mergeAtelierDescriptionAndAuctionOnAtelierID = (atelierDescriptions, auctions) => {
  const keyedUploads = {};
  // Note that this messes up the original ordering, so we can't just
  // return _.values(keyedUploads);
  _.each(atelierDescriptions, (description) => {
    keyedUploads[description.atelierID] = description;
    keyedUploads[description.atelierID].auctions = [];
  });
  _.each(auctions, (auction) => {
    if (keyedUploads[auction.atelierID] !== undefined) {
      keyedUploads[auction.atelierID].auctions.push(_.omit(auction, 'atelierID'));
    }
  });
  // This revert to original ordering
  return _.map(atelierDescriptions, (description) => keyedUploads[description.atelierID]);
};

/**
 * Return a normalized atelier/review description
 * @param {Object} atelierDescriptions
 * @return {NormalizedAtelierDescription[]}
 */
const normalizeAtelierDescription = (atelierDescriptions) => _.map(atelierDescriptions, (atelierDescription) => ({
  ID: atelierDescription.atelierID,
  s3Key: atelierDescription.originalName,
  description: atelierDescription.description,
  title: atelierDescription.title,
  game: { ID: atelierDescription.gameID, name: atelierDescription.gameName },
  reviewer: { ID: atelierDescription.reviewerID, nickname: atelierDescription.reviewerNickname },
  uploader: { ID: atelierDescription.uploaderID, nickname: atelierDescription.uploaderNickname },
  bounty: atelierDescription.bounty,
  auctions: atelierDescription.auctions,
  tags: atelierDescription.tags,
  isPrivate: atelierDescription.isPrivate,
  stats: { score: atelierDescription.score, nbViews: atelierDescription.nbViews },
  creationTimestamp: atelierDescription.creationTimestamp,
  currentStatus: {
    ID: atelierDescription.currentStatus,
    description: atelierReference.atelierStatusIDToDescription(atelierDescription.currentStatus),
  },
}));
module.exports.normalizeAtelierDescription = normalizeAtelierDescription;

/**
 * Keep only the auction object that fits a reviewer
 * @param {NormalizedAtelierDescription[]} atelierDescriptions
 * @param {number} reviewerID
 * @return {NormalizedAtelierDescription[]}
 */
module.exports.normalizeAtelierDescriptionFilterAuction = (atelierDescriptions, reviewerID = undefined) => {
  const normalizedDescriptions = normalizeAtelierDescription(atelierDescriptions);
  _.each(normalizedDescriptions, (description) => {
    description.auctions = _.filter(description.auctions, (auction) => auction.ID === reviewerID);
  });
  return normalizedDescriptions;
};

/**
 * Return a sequence of atelier description passing some filter criteria
 * @param {string} filterCategory - A category (game, tag, user) on which we filter the atelier section upon
 * @param {string|number} filterValue - ID value for the filter category
 * @param {number} [atelierStatus=undefined]
 * @param {string} partialTitle - If defined, atelier selection is further restricted on partial title fitting this param
 * @param {boolean} isPrivateFilteredOut - Whether private atelier should be filtered out or not
 * @param {boolean} isAuctionFilteredOut - Whether auctions info should be filtered out or not
 * @param {boolean} isTagFilteredOut - Whether tags info should be filtered out or not
 * @param {boolean} isReviewerStatFilteredOut - Whether reviewers stat info should be filtered out or not
 * @param {boolean} [isNbTotalResultsIncluded=false] - Include the nb total results in responses
 * @param {number} [offset=undefined] - Offset to retrieve atelier from when querying the DB
 * @param {number} [limit=undefined] - Max nb of atelier to return
 * @param {string} [sortingColumn=undefined] - If defined, column to sort on
 * @param {boolean} isAsc - Whether the sorting on sortingColumn is ascending or not
 * @return {Promise<{nbRowTotal: number, atelierDescription: [AtelierDescription]}>}
 */
module.exports.buildAtelierDescriptionWithFilter = async ({
  filterCategory,
  filterValue,
  atelierStatus = undefined,
  partialTitle = undefined,
  isPrivateFilteredOut = true,
  isAuctionFilteredOut = true,
  isTagFilteredOut = true,
  isReviewerStatFilteredOut = true,
  isNbTotalResultsIncluded = false,
  offset = undefined,
  limit = undefined,
  sortingColumn = undefined,
  isAsc = undefined,
}) => {
  if (filterCategory === undefined || filterValue === undefined) {
    appLogger.error('Error in buildAtelierDescriptionWithFilter: Missing parameter');
    return undefined;
  }

  if (!sanityCheck.checkIsBrowseCategoryValid(filterCategory)) {
    appLogger.error(`Error in buildAtelierDescriptionWithFilter: Filter category ${filterCategory} is not valid`);
    return undefined;
  }
  const atelierQueryParam = atelierQuery.buildAtelierQueryParameter();
  atelierQueryParam.filter.titleHint = partialTitle !== undefined ? partialTitle.trim() : undefined;
  if (atelierStatus !== undefined) {
    atelierQueryParam.setCurrentStatus(atelierStatus);
  }
  atelierQueryParam.setFilterPrivate(isPrivateFilteredOut);
  switch (filterCategory) {
    case GAME_CATEGORY_LABEL: {
      atelierQueryParam.setGameID(filterValue);
      break;
    }
    case REVIEWER_CATEGORY_LABEL: {
      // TODO use CANDIDATE_LABEL for that case w/o ref to inAuction status ?
      if (atelierStatus === atelierReference.atelierStatus.InAuction) {
        atelierQueryParam.setCandidateReviewerID(filterValue);
      } else {
        atelierQueryParam.setReviewerID(filterValue);
      }
      break;
    }
    case UPLOADER_CATEGORY_LABEL: {
      atelierQueryParam.setUploaderID(filterValue);
      break;
    }
    case TAG_CATEGORY_LABEL: {
      atelierQueryParam.setTagID(filterValue);
      break;
    }
    case ATELIER_CATEGORY_LABEL: {
      atelierQueryParam.setAtelierID(filterValue);
      break;
    }
    default:
      break;
  }
  if (isNbTotalResultsIncluded) {
    atelierQueryParam.setIsNbRowIncluded(true);
  }
  atelierQueryParam.setSorting(sortingColumn, isAsc);
  let { nbRowTotal, atelierDescription } = await atelierQuery.selectAtelier(atelierQueryParam, offset, limit);
  atelierDescription = normalizeAtelierDescription(atelierDescription);

  if (!isAuctionFilteredOut) {
    await Promise.all(_.map(atelierDescription, (atelier) => new Promise((resolve, reject) => {
      auctionQuery.selectAuctionHistoryForAtelier(atelier.ID).then(async (auction) => {
        atelier.auctions = auction;
        if (!isReviewerStatFilteredOut) {
          atelier.auctions = _.map(
            atelier.auctions,
            (auction) => _.extend(auction, { stat: { score: undefined, nbReview: 0 } }),
          );
          const candidateID = _.pluck(atelier.auctions, 'ID');
          try {
            // reviewerID => {reviewerScore, nbReview}, ...
            const scores = await reviewerQuery.selectReviewerScore(candidateID);
            const statsByReviewerID = _.indexBy(scores, 'reviewerID');
            // Merge stats into auction on reviewerID
            _.each(atelier.auctions, (auction) => {
              if (_.has(statsByReviewerID, auction.ID)) {
                auction.stat.nbReview = statsByReviewerID[auction.ID].nbReview;
                auction.stat.score = statsByReviewerID[auction.ID].score;
                if (auction.ID === atelier.reviewer.ID) {
                  atelier.reviewer.stat = auction.stat;
                }
              }
            });
          } catch (e) {
            appLogger.error(`Error in buildAtelierDescriptionWithFilter: ${e}`);
            reject(e);
          }
        }
        resolve();
      }).catch(reject);
    }), atelierDescription));
  }

  if (!isTagFilteredOut) {
    await Promise.all(_.map(atelierDescription, (atelier) => new Promise((resolve, reject) => {
      tagQuery.selectTagsForAtelier(atelier.ID).then((tag) => {
        atelier.tags = tag;
        resolve();
      }).catch(reject);
    })));
  }
  return { nbRowTotal, atelierDescription };
};

/**
 * Normalize atelier numbers wrt. status and category
 * @param {[object]} nbAtelier
 * @return {{total: number, private: number, public: number, inProgress: number, inAuction: number, complete: number}}
 */
module.exports.normalizeAtelierNumber = (nbAtelier) => {
  const categoryStatistics = {
    total: 0, private: 0, public: 0, inAuction: 0, inProgress: 0, complete: 0,
  };
  for (let i = 0; i < nbAtelier.length; i++) {
    if (nbAtelier[i].isPrivate === 1) {
      categoryStatistics.private += nbAtelier[i].nbAtelier;
    } else if (nbAtelier[i].isPrivate === 0) {
      categoryStatistics.public += nbAtelier[i].nbAtelier;
    }
    if (nbAtelier[i].currentStatus === atelierReference.atelierStatus.InAuction) {
      categoryStatistics.inAuction += nbAtelier[i].nbAtelier;
    } else if (nbAtelier[i].currentStatus === atelierReference.atelierStatus.InProgress) {
      categoryStatistics.inProgress += nbAtelier[i].nbAtelier;
    } else if (nbAtelier[i].currentStatus === atelierReference.atelierStatus.Complete) {
      categoryStatistics.complete += nbAtelier[i].nbAtelier;
    }
  }
  categoryStatistics.total = categoryStatistics.private + categoryStatistics.public;
  return categoryStatistics;
};

/**
 * Normalize activity from raw query results
 * @param {[RawActivity]} rawActivity
 * @return {NormalizedActivity[]}
 */
module.exports.normalizeActivityDescription = (rawActivity) => _.map(rawActivity, (activity) => {
  const normalizedDesc = {
    ID: activity.activityID,
    activityRef: {
      ID: activity.activityRefID,
      name: activity.activityName,
    },
    linkedID: activity.linkedID,
    sourceActor: {
      typeID: activity.sourceTypeID,
      user: {
        ID: activity.sourceUserID,
        name: activity.sourceUserNickname,
      },
    },
    targetActor: {
      typeID: activity.targetTypeID,
      user: {
        ID: activity.targetUserID,
        name: activity.targetUserNickname,
      },
    },
    timestamp: activity.createdAt,
    summary: undefined,
    href: undefined,
  };
  const { summary, href } = activityReference.buildActivitySummary(normalizedDesc);
  normalizedDesc.summary = summary;
  normalizedDesc.href = href;
  return normalizedDesc;
});

module.exports.normalizeChargeDescription = (rawCharges) => {
  const result = [];
  _.each(rawCharges, (rawCharge) => {
    if (rawCharge.status === 'succeeded') {
      result.push({
        amount: rawCharge.amount,
        currency: rawCharge.currency,
        timestamp: rawCharge.created * 1000,
      });
    }
  });
  return result;
};

module.exports.normalizeTransferDescription = (rawTransfers) => {
  const result = [];
  _.each(rawTransfers, (rawTransfer) => {
    if (!rawTransfer.reversed) {
      result.push({
        amount: rawTransfer.amount,
        currency: rawTransfer.currency,
        timestamp: rawTransfer.created * 1000,
        atelierID: parseInt(rawTransfer.metadata.atelierID, 10),
      });
    }
  });
  return result;
};

/**
 * Helper to aggregate reviewer profiles on userID, select languages and normalize representation
 * FIXME This is dog shit.... why does a function called normalize does sql queries
 * @async
 * @param {boolean} doFetchLanguages
 * @param {[{ID: number, name:string, twitchName:string, youtubeName:string, twitterName:string,
 *     registrationDate: any, countryCode: string, timezone: string, gamePool: string}]|[{ID: number,
 *     name:string, registrationDate: any, countryCode: string, timezone: string,
 *     gameName: string, gameID: number, minBounty: number, score: number, nbReview: number}]} rawReviewers
 * @param {boolean} isStringifiedGamePool If true then rawReviewers[i].gamePool is a stringified array.
 *     Otherwise, we need to reconstruct the game pool...
 * @param {{ID: number, name: string, nbAtelier: number}[]} rawTags
 * @return {Promise<[Reviewer]>}
 */
async function normalizeReviewer(doFetchLanguages, rawReviewers, isStringifiedGamePool, rawTags = []) {
  // FIXME This is the actually normalize...
  const normalizeReviewerHelper = (reviewer, languages, gamePool, tags) => ({
    ID: reviewer.ID,
    name: reviewer.name,
    selfIntroduction: reviewer.selfIntroduction,
    countryCode: reviewer.countryCode,
    timezone: reviewer.timezone,
    registrationDate: reviewer.registrationDate,
    languages,
    snsAccounts: {
      youtubeName: reviewer.youtubeName || '',
      twitchName: reviewer.twitchName || '',
      twitterName: reviewer.twitterName || '',
    },
    gamePool: gamePool.map((row) => ({
      ID: row.gameID,
      name: row.gameName,
      nbReview: row.nbReview,
      score: row.score,
      minimumBounty: row.minimumBounty,
    })),
    tags: tags.map((tag) => ({
      ID: tag.ID,
      name: tag.name,
      count: tag.nbAtelier,
    })),
  });

  if (isStringifiedGamePool) {
    return Promise.all(
      rawReviewers.map(async (rawReviewerProfile) => {
        const userID = rawReviewerProfile.ID;
        const languages = doFetchLanguages ? await userQuery.selectUserLanguage(userID) : [];
        const gamePool = JSON.parse(rawReviewerProfile.gamePool);
        return normalizeReviewerHelper(rawReviewerProfile, languages, gamePool, rawTags);
      }),
    );
  }
  const profilesByReviewerID = _.groupBy(rawReviewers, 'ID');
  const reviewersID = Object.keys(profilesByReviewerID);
  return Promise.all(
    reviewersID.map(async (userID) => {
      const languages = doFetchLanguages ? await userQuery.selectUserLanguage(userID) : [];
      const reviewerProfile = profilesByReviewerID[userID];
      const gamePool = reviewerProfile.map((row) => ({
        gameID: row.gameID,
        gameName: row.gameName,
        nbReview: row.nbReview,
        score: row.score,
        minimumBounty: row.minimumBounty,
      }));
      return normalizeReviewerHelper(reviewerProfile[0], languages, gamePool, rawTags);
    }),
  );
};

module.exports.normalizeReviewer = normalizeReviewer;

/**
 * Build the set of favorite reviewer profiles for a user
 * @param {string} userID
 * @return {Promise<*[]|Reviewer[]>}
 */
async function getFavoriteReviewersProfile(userID) {
  const favorites = await followerQuery.selectUserFavorite(userID);
  if (favorites.length === 0) {
    return Promise.resolve([]);
  }
  const favoritesID = favorites.map((row) => row.ID);
  const favoriteReviewers = await reviewerQuery.selectReviewersFromID(favoritesID);
  return normalizeReviewer(false, favoriteReviewers, true, []);
}
module.exports.getFavoriteReviewersProfile = getFavoriteReviewersProfile;

async function getRecentReviewsFromFavorite(favoriteReviewersID, offset = 0, limit = undefined) {
  if (favoriteReviewersID.length === 0) {
    return Promise.resolve([]);
  }
  const rawAteliers = await atelierQuery.selectRecommendedAteliersFromReviewers({
    reviewerID: favoriteReviewersID,
    filterOutPrivate: true,
    offset,
    limit,
  });
  return normalizeAtelierDescription(rawAteliers);
}
module.exports.getRecentReviewsFromFavorite = getRecentReviewsFromFavorite;

