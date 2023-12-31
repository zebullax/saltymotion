/* eslint-disable max-len */
const _ = require('underscore');
const {atelierStatus} = require('../atelierStatus.js');
const dbUtil = require('./dbUtil.js');
const sqlPool = require('./sqlConnectionPool.js');
const tagQuery = require('./tagQuery.js');

/**
 * Build an atelier query parameter
 * @return {AtelierQueryParameter}
 */
module.exports.buildAtelierQueryParameter = () => ({
  filter: {
    atelierID: undefined,
    title: undefined,
    titleHint: undefined,
    uploaderID: undefined,
    reviewerID: undefined,
    gameID: undefined,
    tagID: undefined,
    currentStatusID: undefined,
    candidateReviewerID: undefined,
  },
  tweaker: {
    isPrivateFilteredOut: true,
    isTagsFilteredOut: true,
    isNbRowIncluded: false,
    isIdOnly: false,
    isActiveNotificationTagged: false,
    isCandidateReviewIncluded: false,
    requestUserID: undefined,
  },
  sort: {
    field: 'creationTimestamp',
    isAsc: false,
  },
  /**
   * Set candidate ID as filter
   * @param {number} candidateID
   * @return {this}
   */
  setCandidateReviewerID(candidateID) {
    this.filter.candidateReviewerID = candidateID;
    return this;
  },
  /**
   * Set whether or not candidate review should be included
   * @param {boolean} isIncluded
   * @return {this}
   */
  setIncludeCandidateReview(isIncluded) {
    this.tweaker.isCandidateReviewIncluded = isIncluded;
    return this;
  },
  setAtelierID(atelierID) {
    this.filter.atelierID = atelierID;
    return this;
  },
  setGameID(gameID) {
    this.filter.gameID = gameID;
    return this;
  },
  setTitle(title) {
    this.filter.title = title;
    return this;
  },
  setIsNbRowIncluded(isNbRowIncluded) {
    this.tweaker.isNbRowIncluded = isNbRowIncluded;
    return this;
  },
  setCurrentStatus(currentStatusID) {
    this.filter.currentStatusID = currentStatusID;
    return this;
  },
  setTitleHint(titleHint) {
    this.filter.titleHint = titleHint;
    return this;
  },
  setUploaderID(uploaderID) {
    this.filter.uploaderID = uploaderID;
    return this;
  },
  setReviewerID(reviewerID) {
    this.filter.reviewerID = reviewerID;
    return this;
  },
  setTagID(tagID) {
    this.filter.tagID = tagID;
    return this;
  },
  setFilterPrivate(isPrivateFilteredOut) {
    this.tweaker.isPrivateFilteredOut = isPrivateFilteredOut;
    return this;
  },
  setRequestUserID(requestUserID) {
    this.tweaker.requestUserID = requestUserID;
    return this;
  },
  setFilterTag(isTagsFilteredOut) {
    this.tweaker.isTagsFilteredOut = isTagsFilteredOut;
    return this;
  },
  setIdOnly(isIdOnly) {
    this.tweaker.isIdOnly = isIdOnly;
    return this;
  },
  setSorting(fieldName, isAsc) {
    this.sort.field = fieldName;
    this.sort.isAsc = isAsc;
    return this;
  },
});


/**
 * Select atelier latest status
 * @param {number} atelierID -
 * @return {Promise<number>} Fulfilled with the atelier current status
 */
module.exports.selectAtelierStatus = (atelierID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT currentStatus FROM atelier WHERE ID = ?;', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result[0]);
    });
  });
};

/**
 * Select the atelier title
 * @param {number} atelierID - Atelier numerical ID
 * @return {Promise<string>}
 */
const selectAtelierTitle = (atelierID) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('SELECT title FROM atelier WHERE ID = ?;', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result[0].title);
    });
  });
};
module.exports.selectAtelierTitle = selectAtelierTitle;

/**
 * Select the atelier uploader ID from the atelier ID
 * @param {number} atelierID
 * @return {Promise<number>} Fulfilled with atelier uploader ID
 */
module.exports.selectAtelierUploaderID = (atelierID) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('SELECT uploaderID FROM atelier WHERE ID = ?;', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result[0].uploaderID);
    });
  });
};

/**
 * Select the atelier reviewer from the atelier ID
 * @param {number} atelierID -
 * @return {Promise<{reviewerID: number}>} Fulfilled with atelier reviewer ID
 */
module.exports.selectAtelierReviewer = (atelierID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT reviewerID FROM atelier WHERE ID = ?;', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result[0]);
    });
  });
};

/**
 * Select both the atelier reviewer and uploader user ID
 * @param {number} atelierID
 * @return {Promise<{reviewerID: number, uploaderID: number}>}
 */
module.exports.selectAtelierReviewerAndUploader = (atelierID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT reviewerID, uploaderID FROM atelier WHERE ID = ?;', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result[0]);
    });
  });
};

/**
 * Update an atelier current status to cancel (does not actually delete it), update history to reflect that as well
 * @param {number} atelierID - Numeric ID for the atelier to be deleted
 * @return {Promise<Error|undefined>}
 */
module.exports.cancelAtelier = (atelierID) => {
  if (typeof atelierID !== 'number') {
    return Promise.reject(new Error(`Error in cancelAtelier: Type error on atelierID parameter ${atelierID}`));
  }
  return new Promise((resolve, reject) => {
    sqlPool.query('call cancel_atelier(?);', [atelierID], (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(undefined);
    });
  });
};

/**
 * Abort a freshly atelier creation
 * @param {number} atelierID - Numeric ID for the atelier to be deleted
 * @param {number} errorStatusID - Numeric ID for the atelier final error status
 * @return {Promise<Error|undefined>}
 */
module.exports.abortAtelierCreation = (atelierID, errorStatusID) => {
  if (typeof atelierID !== 'number' || typeof errorStatusID !== 'number') {
    return Promise.reject(new Error('Error in abortAtelierCreation: Type error on parameters'));
  }
  return new Promise((resolve, reject) => {
    sqlPool.query('call abort_atelier_creation(?, ?);', [atelierID, errorStatusID], (err) => {
      if (err) {
        console.error(`CRITICAL - Error while aborting atelier ${atelierID}... likely coins haven't been unfrozen !!`);
        return reject(err);
      }
      return resolve(undefined);
    });
  });
};

/**
 * Set an atelier status
 * @deprecated This is garbage, put it in DB stored procedure
 * @param {number} atelierID
 * @param {number} statusID
 * @return {Promise<Error|undefined>}
 */
module.exports.setStatus = ({atelierID, statusID}) => {
  return new Promise((resolve, reject) => {
    sqlPool.getConnection((err, connection) => {
      if (err) {
        console.error(`Error in setStatus: ${err} : ${err.sql}`);
        return reject(err);
      }
      connection.beginTransaction((err) => {
        if (err) {
          console.error(`Error in setStatus: ${err} : ${err.sql}`);
          return reject(err);
        }
        connection.query('UPDATE atelier SET currentStatus = ? where ID = ?;', [statusID, atelierID], (err) => {
          if (err) {
            connection.rollback();
            console.error(`Error in setStatus: ${err} : ${err.sql}`);
            return reject(err);
          }
          connection.query('INSERT INTO atelier_history (atelierID, statusID, timestamp) VALUES (?, ?, now());', [atelierID, statusID], (err) => {
            if (err) {
              connection.rollback();
              console.error(`Error in setStatus: ${err} : ${err.sql}`);
              return reject(err);
            }
            connection.commit((err) => {
              if (err) {
                connection.rollback();
                console.error(`Error in setStatus: ${err} : ${err.sql}`);
                return reject(err);
              }
              return resolve();
            }); // commit
          }); // insert into atelier history
        }); // update atelier status
      }); // begin transaction
    }); // get connection
  }); // promise
};

/**
 * Run tasks bound to review completion (set status, update account balance, etc.)
 * @param {number} atelierID
 * @param {string} reviewerID
 * @return {Promise<undefined|object>}
 */
module.exports.completeReview = function(atelierID, reviewerID) {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('CALL post_review(?, ?);', [atelierID, reviewerID], (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(undefined);
    });
  });
};

/**
 * Create an atelier, sets its initial auction and update its history and state
 * @param {number} gameID - ID of the atelier game
 * @param {[string]} reviewers - Array of user ID for reviewers
 * @param {string} uploaderID - ID of the uploader
 * @param {string} originalName - Original name of the video being uploaded
 * @param {string} title - Atelier title
 * @param {string} description - Atelier description
 * @param {number[]} tags - List of tag ID bound to this atelier
 * @param {boolean} isPrivate - True if the atelier is private, false if it is public
 * @return {Promise<Number>} Fulfilled with the ID of the atelier just created, or undefined if any error happen
 */
module.exports.createAtelier = (gameID, reviewers, uploaderID, originalName, title, description, tags, isPrivate) => {
  return new Promise((resolve, reject) => {
    sqlPool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      // Cooked sql args (CSV strings)
      // tags
      const tagSqlArg = tags.length !== 0 ? _.reduce(tags, (accu, tag) => `${accu},${tag.ID}`, '').slice(1) : '';
      // reviewers, bounty
      let revIdSqlArg = '';
      let bountySqlArg = '';
      _.each(reviewers, (reviewer) => {
        revIdSqlArg += `,${reviewer.ID}`;
        bountySqlArg += `,${reviewer.bounty}`;
      });
      revIdSqlArg = revIdSqlArg.slice(1);
      bountySqlArg = bountySqlArg.slice(1);
      const query =
        'set @createdAtelierID=0;' +
        'call create_atelier(' +
          `${connection.escape(gameID)}, ${connection.escape(bountySqlArg)}, ${connection.escape(uploaderID)},` +
          `${connection.escape(originalName)}, ${connection.escape(title)}, ${connection.escape(description)}, ${tags.length},` +
          `${connection.escape(tagSqlArg)}, ${connection.escape(isPrivate)}, ${reviewers.length},` +
          `${connection.escape(revIdSqlArg)}, @createdAtelierID);` +
        'SELECT @createdAtelierID';
      connection.query(query, (err, result) => {
        if (err || result.length !== 3) {
          connection.release();
          return reject(err || new Error(`Unexpected results length (${result.length}) on create_atelier SQL`));
        }
        const atelierID = result[2][0]['@createdAtelierID'];
        if (atelierID == null) {
          connection.release();
          return reject(err);
        }
        connection.release();
        return resolve(atelierID);
      });
    }); // getConnection
  }); // new Promise
};

/**
 * Increment the view count for an atelier by a delta
 * @param {number} atelierID - Atelier numeric ID
 * @param {number} incrementDelta - Value to increment the view count by
 * @return {Promise<undefined|*>}
 */
module.exports.incrementViewCount = (atelierID, incrementDelta = 1) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('UPDATE atelier SET nbViews = nbViews + ? WHERE ID = ?;', [incrementDelta, atelierID], (err, res) => {
      if (err || res.affectedRows !== 1) {
        return reject(err || `Could not update atelier_auction for atelier ${atelierID}`);
      }
      return resolve(undefined);
    });
  });
};

/**
 * Accepts an atelier, update the atelier status and set the reviewer as the official reviewer for this atelier, record the auctioned out bounty
 * @param {string} reviewerID - Numeric reviewer user ID
 * @param {number} atelierID - Numeric atelier ID
 * @return {Promise<Error|undefined>} Fulfilled with an error if the creation did not go well, undefined if everything went well
 */
module.exports.acceptAtelier = (reviewerID, atelierID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query(`CALL accept_atelier(?,?);`, [atelierID, reviewerID], (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(undefined);
    });
  });
};

/**
 * Decline an atelier, insert the atelier event and remove the candidate from the auction pool
 * @param {string} reviewerID - Reviewer user ID
 * @param {number} atelierID -  Atelier ID
 * @return {Promise<Error|number>} Rejected with an error if the query went wrong, fulfilled with the nb candidates left otherwise
 */
module.exports.declineAtelier = (reviewerID, atelierID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query(`CALL decline_atelier(?, ?);`, [atelierID, reviewerID], (err, result) => {
      if (err) {
        return reject(err);
      }
      const nbCandidateLeft = result[1][0]?.nbCandidatesLeft ?? Number.NaN;
      return resolve(nbCandidateLeft);
    });
  });
};

/**
 * Select a random sample of reviews
 * @param {number} sampleSize
 * @return {Promise<object[]>}
 */
module.exports.selectReviewsSample = ({sampleSize}) => {
  const query =
    'SELECT atelierID, title, originalName, creationTimestamp, reviewerID, reviewerNickname, uploaderID, ' +
        'uploaderNickname, currentStatus, gameID, gameName, description, bounty, score, nbViews ' +
    'FROM atelier_aggregated_info__view ' +
    'WHERE currentStatus = ? AND isPrivate = 0 ' +
    'ORDER BY RAND() ' +
    'LIMIT ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [atelierStatus.Complete, sampleSize], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Select workshops filtering on uploader ID
 * @param {number} uploaderID
 * @param {number} offset
 * @param {number} limit
 * @return {Promise<[{ID: number, uploaderID: number, title: string, creationTimestamp: Date, gameID: number, gameName: string}]>}
 */
module.exports.selectAtelierFilterOnUploader = ({uploaderID, offset = 0, limit = 5}) => {
  const query =
      'SELECT uploaderID as uploaderID, atelier.ID as ID, title, creationTimestamp, game_ref.ID as gameID, game_ref.name as gameName ' +
      'FROM atelier JOIN game_ref on atelier.gameID = game_ref.ID ' +
      `WHERE uploaderID = ? AND creationTimestamp ${offset ? '< ?' : '> ?'} AND currentStatus < ? ` +
      'ORDER BY creationTimestamp DESC ' +
      'LIMIT ?';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [uploaderID, atelierStatus.Complete, offset, limit], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Select atelier filtering on the reviewer ID
 * @param {number} reviewerID
 * @param {number} [offset] - timestamp upper bound when specified
 * @param {number} [limit]
 * @return {Promise<[{ID: number, uploaderID: string, title: string, creationTimestamp: Date, gameID: number, gameName: string}]>}
 */
module.exports.selectAtelierFilterOnReviewer = ({reviewerID, offset = 0, limit = 5}) => {
  const query =
      'SELECT uploaderID as uploaderID, atelier.ID as ID, title, creationTimestamp, game_ref.ID as gameID, game_ref.name as gameName ' +
      'FROM atelier JOIN game_ref ON atelier.gameID = game_ref.ID ' +
      `WHERE reviewerID = ? AND atelier.creationTimestamp ${offset ? '< ?' : '> ?'} ` +
      'ORDER BY creationTimestamp DESC ' +
      'LIMIT ?';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [reviewerID, offset, limit], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Select atelier filtering on the user ID
 * @param {number} userID
 * @param {number} [offset] - upper bound timestamp when specified
 * @param {number} [limit]
 * @return {Promise<[{ID: number, uploaderID: string, title: string, creationTimestamp: Date, gameID: number, gameName: string}]>}
 */
module.exports.selectAtelierFilterOnUser = ({userID, offset = 0, limit = 5}) => {
  const query =
      'SELECT uploaderID as uploaderID, atelier.ID as ID, title, creationTimestamp, game_ref.ID as gameID, game_ref.name as gameName ' +
      'FROM atelier JOIN game_ref ON atelier.gameID = game_ref.ID ' +
      `WHERE (reviewerID = ? OR uploaderID = ?) AND UNIX_TIMESTAMP(creationTimestamp) ${offset ? '< ?' : '> ?'} ` +
      'ORDER BY creationTimestamp DESC ' +
      'LIMIT ?';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID, userID, offset, limit], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};


/**
 * Select atelier with metadata
 * AtelierID filter is exclusive from all others
 *  @deprecated Use a more specialized function
 *  @param {AtelierQueryParameter} atelierQueryParameter
 * @param {number=} offset - If set, retrieve rows starting at this offset
 * @param {number=} limit - Max number of ID to return, or undefined for no limits
 * @return {Promise<AtelierDescription[]|object[]|Error>}
 */
module.exports.selectAtelier = async (atelierQueryParameter, offset = undefined, limit = undefined) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.getConnection(async (err, connection) => {
      if (err) {
        return reject(err);
      }
      const {
        gameID,
        reviewerID,
        candidateReviewerID,
        uploaderID,
        tagID,
        title,
        currentStatusID,
        atelierID,
      } = atelierQueryParameter.filter;
      const {
        isPrivateFilteredOut,
        isTagsFilteredOut,
        isIdOnly,
        isCandidateReviewIncluded,
        requestUserID,
      } = atelierQueryParameter.tweaker;
      const sortingField = atelierQueryParameter.sort.field;
      const isSortingAsc = atelierQueryParameter.sort.isAsc;
      const {isNbRowIncluded} = atelierQueryParameter.tweaker;

      const isFilteringOnCandidateReviewer = candidateReviewerID !== undefined;
      // Cook up `Sort By` String
      let sortString = ' ORDER BY creationTimestamp DESC ';
      if (_.contains(['creationTimestamp', 'description', 'gameName', 'uploaderNickname', 'reviewerNickname', 'bounty', 'score', 'nbViews'], sortingField)) {
        sortString = ` ORDER BY ${sortingField} ${isSortingAsc ? ' ASC ' : ' DESC '}`;
      }
      // Cook up limit string
      const limitString = dbUtil.buildLimitString(offset, limit);
      // Cook up filter string
      // If no filtering on status is provided, we'll still filter out cancelled and errored atelier
      let filterString =
        `currentStatus ${currentStatusID !== undefined && !Number.isNaN(currentStatusID)
          ? `= ${connection.escape(currentStatusID)}`
          : ` < ${connection.escape(atelierStatus.Cancelled)}`} `;
      // Filter on AtelierID is an exclusive filter, it will ignore any other filter
      if (atelierID !== undefined && Number.isInteger(atelierID)) {
        filterString += ` AND atelierID = ${connection.escape(atelierID)} `;
      } else {
        if (gameID !== undefined && Number.isInteger(gameID)) {
          filterString += ` AND gameID = ${connection.escape(gameID)} `;
        }
        if (reviewerID !== undefined) {
          if (isCandidateReviewIncluded) {
            filterString +=
              ` AND atelierID in (select atelierID from atelier_auction where reviewerID = ${reviewerID}) `;
          } else {
            filterString += ` AND reviewerID = ${connection.escape(reviewerID)} `;
          }
        }
        if (uploaderID !== undefined) {
          filterString += ` AND uploaderID = ${connection.escape(uploaderID)} `;
        }
        if (tagID !== undefined && Number.isInteger(tagID)) {
          filterString += ` AND atelierID IN (SELECT atelierID FROM atelier_tag WHERE tagID = ${tagID}) `;
        }
        if (title !== undefined && title.length !== 0) {
          const titlePattern = `%${title}%`;
          filterString += ` AND title LIKE ${connection.escape(titlePattern)} `;
        }
        if (isPrivateFilteredOut) {
          if (requestUserID !== undefined) {
            filterString += ' AND isPrivate = false ';
          } else {
            ` AND (isPrivate = false OR uploaderID = ${connection.escape(requestUserID)}) `;
          }
        }
      }

      let nbRowTotal;
      // Small query if ID only
      if (isIdOnly) {
        if (isNbRowIncluded) {
          const countHelper = function() {
            return new Promise((resH, rejH) => {
              connection.query(`SELECT count(atelierID) as nbResult FROM atelier_aggregated_info__view WHERE ${filterString} ${sortString} ${limitString};`, (err, result) => {
                if (err) {
                  return rejH(err);
                }
                return resH(result[0].nbResult);
              });
            });
          };
          try {
            nbRowTotal = await countHelper();
          } catch (e) {
            connection.release();
            return reject(e);
          }
        }
        connection.query(`SELECT atelierID as ID FROM atelier_aggregated_info__view WHERE ${filterString} ${sortString} ${limitString};`, (err, result) => {
          if (err) {
            connection.release();
            return reject(err);
          }
          connection.release();
          return resolve(result);
        });
      } else {
        const havingString = isFilteringOnCandidateReviewer ? ` HAVING FIND_IN_SET(${connection.escape(candidateReviewerID)}, candidateReviewerID) > 0 ` : '';
        if (isNbRowIncluded) {
          // FIXME Maxi Ghetto
          const countHelper = function() {
            return new Promise((resH, rejH) => {
              const countQuery = isFilteringOnCandidateReviewer ?
                `SELECT candidateReviewerID FROM atelier_aggregated_info__view WHERE ${filterString} HAVING FIND_IN_SET(${connection.escape(candidateReviewerID)}, candidateReviewerID) > 0 ;` :
                `SELECT count(*) as nbResult FROM atelier_aggregated_info__view WHERE ${filterString} ;`;
              connection.query(countQuery, (err, result) => {
                if (err) {
                  return rejH(err);
                }
                return resH(isFilteringOnCandidateReviewer ? result.length : result[0].nbResult);
              });
            });
          };
          try {
            nbRowTotal = await countHelper();
          } catch (e) {
            connection.release();
            return reject(e);
          }
        }
        const query =
          'SELECT atelierID, title, originalName, creationTimestamp, reviewerID, reviewerNickname, ' +
          '  uploaderID, uploaderNickname, gameName, currentStatus, ' +
          '  gameID, description, isPrivate, bounty, score, nbViews ' +
          `  ${isFilteringOnCandidateReviewer ? ', candidateReviewerID ' : ''}` +
          'FROM atelier_aggregated_info__view ' +
          `WHERE ${filterString} ${havingString} ${sortString} ${limitString};`;
        connection.query(query, async (err, result) => {
          if (err) {
            connection.release();
            return reject(err);
          }
          if (!isTagsFilteredOut) {
            if (_.isNumber(atelierID)) {
              const tags = await tagQuery.selectTagsForAtelier(atelierID);
              const {atelierID, ...cleanedTag} = tags;
              result.tags = cleanedTag;
            } else {
              const atelierID = result.map((atelier) => atelier.atelierID);
              const atelierTags = _.groupBy(await tagQuery.selectTagsForAtelier(atelierID), 'atelierID');
              for (let i = 0; i < result.length; i++) {
                const atelierID = result[i].atelierID;
                result[i].tags = atelierTags[atelierID] ? atelierTags[atelierID].map((tags) => {
                  // eslint-disable-next-line no-unused-vars
                  const {atelierID, ...cleanedTag} = tags;
                  return cleanedTag;
                }) : [];
              }
            }
          }
          connection.release();
          return resolve({nbRowTotal, atelierDescription: result});
        });
      }
    }); // getConnection
  }); // new Promise
};

/**
 * Select the number of ateliers related to a game
 * @param {number} gameID - Game ID to sum ateliers for
 * @return {Promise<{nbAtelier: number, isPrivate: boolean, currentStatus: number}[]>}
 */
module.exports.selectNbAtelierFilterOnGame = (gameID) => {
  const query =
    'SELECT IFNULL(count(ID), 0) AS nbAtelier, isPrivate, currentStatus ' +
    'FROM atelier ' +
    'WHERE gameID = ? AND currentStatus < ? ' +
    'GROUP BY gameID, currentStatus, isPrivate;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [gameID, atelierStatus.Cancelled], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

/**
 * Select the number of ateliers from a reviewer that are not in error status
 * @param {number} userID
 * @return {Promise<{nbAtelier: number, isPrivate: boolean, currentStatus: number}[]>}
 */
module.exports.selectNbAtelierFilterOnReviewer = (userID) => {
  const query =
    'SELECT IFNULL(count(ID), 0) AS nbAtelier, isPrivate, currentStatus ' +
    'FROM atelier ' +
    'WHERE reviewerID = ? and currentStatus < ? ' +
    'GROUP BY reviewerID, currentStatus, isPrivate;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID, atelierStatus.Cancelled], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

/**
 * Select the number of ateliers (complete) uploaded by an user
 * @param {number} userID - uploader ID to count atelier for
 * @return {Promise<number>}
 */
module.exports.selectNbAtelierFilterOnUploader = (userID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT ifnull(count(ID), 0) as nbAtelier FROM atelier WHERE uploaderID = ? group by uploaderID;', [userID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result.length === 0 ? 0 : result[0].nbAtelier);
    });
  });
};

/**
 * Select the number of ateliers (any status) related to a tag
 * @param {number} tagID - Tag ID to sum ateliers for
 * @return {Promise<*>}
 */
module.exports.selectNbAtelierFilterOnTag = (tagID) => {
  const query =
    'SELECT count(atelierID) AS nbAtelier, isPrivate, currentStatus ' +
    'FROM atelier_tag INNER JOIN atelier ' +
    'ON atelier.ID = atelier_tag.atelierID ' +
    'WHERE tagID = ? AND currentStatus < ? ' +
    'GROUP BY tagID, currentStatus, isPrivate;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [tagID, atelierStatus.Cancelled], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

/**
 * Select a sequence of atelier ID reviewed by a user
 * @param {[number]} reviewerID -
 * @param {boolean} filterOutPrivate
 * @param {number} [offset=0]
 * @param {number} [limit=undefined]
 * @return {Promise<undefined|*>}
 */
module.exports.selectRecommendedAteliersFromReviewers = ({
  reviewerID,
  filterOutPrivate,
  offset = 0,
  limit = undefined,
}) => {
  return new Promise((resolve, reject) => {
    const visibilityFilterString = filterOutPrivate === true ? ' AND isPrivate = 0 ' : '';
    const query =
      'SELECT atelier.atelierID, originalName, creationTimestamp, score, nbViews, reviewerID, reviewerNickname, ' +
      '  uploaderID, uploaderNickname, gameName, uploaderNickname, currentStatus, gameID, ' +
      '  description, title, isPrivate, bounty ' +
      'FROM atelier_aggregated_info__view AS atelier INNER JOIN atelier_history AS history ON ' +
      '  atelier.atelierID = history.atelierID ' +
      `WHERE reviewerID in (?) AND currentStatus = ? ${visibilityFilterString} ` +
      'ORDER BY history.timestamp DESC, atelier.nbViews ASC ' +
      `${dbUtil.buildLimitString(offset, limit)};`;
    sqlPool.query(query, [reviewerID, atelierStatus.Complete], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

/**
 * Select a sequence of atelier ID uploader by a user
 * @param {number} uploaderID -
 * @param {boolean} filterOutPrivate
 * @param {number} offset - Select offset
 * @param {number} limit - Select limit
 * @return {Promise<Number[]>}
 */
module.exports.selectAtelierIDUploadedByUser = function(uploaderID, filterOutPrivate = true, offset = undefined, limit = undefined) {
  return new Promise((resolve, reject) => {
    const limitString = dbUtil.buildLimitString(offset, limit);
    const query = `SELECT ID FROM atelier WHERE uploaderID = ? AND currentStatus = ? ${filterOutPrivate === true ? ' AND isPrivate = 0 ' : ''} ${limitString};`;
    sqlPool.query(query, [uploaderID, atelierStatus.Complete], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

module.exports.selectAtelierIsPrivate = function(atelierID) {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT isPrivate FROM atelier where ID = ?', [atelierID], (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result.isPrivate);
    });
  });
};

/**
 * Update an atelier status
 * @param {boolean} atelierStatus
 * @param {number} atelierID
 * @return {Promise<null|*>}
 */
module.exports.updateAtelierStatus = function(atelierStatus, atelierID) {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('update atelier set currentStatus = ? where ID = ?', [atelierStatus, atelierID], (err, res) => {
      if (err || res.affectedRows !== 1) {
        return reject(err || new Error(`Could not set isUpdate for atelier ${atelierID}`));
      }
      return resolve(undefined);
    });
  });
};

/**
 * Select some atelier short description from a game
 * Used in recommendation side bar for the 'view atelier' page
 * // FIXME This is ghetto atm, does not care for who the user is to do recommendation...
 * @param {number} gameID
 * @param {number} userID
 * @param {number} [offset]
 * @param {number} limit
 * @return {Promise<Error|object[]>}
 */
module.exports.selectRecommendedAtelier = function({gameID, userID, offset = 0, limit = 5}) {
  const query =
    'SELECT atelier.ID as ID, originalName as s3Key, uploaderID, user.nickname as uploaderNickname, creationTimestamp, title, nbViews ' +
    'FROM atelier INNER JOIN user ' +
    'ON atelier.uploaderID = user.ID ' +
    'WHERE gameID = ? AND (isPrivate = false OR uploaderID = ?) AND currentStatus=? ' +
    'ORDER BY creationTimestamp desc, nbViews ASC ' +
    `${offset ? 'WHERE creationTimestamp < ?' : 'WHERE creationTimestamp > ?'} ` +
    'limit ?';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [gameID, userID, atelierStatus.Complete, offset, limit], (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};

/**
 * Update an atelier score if user ID is the owner of that atelier and the status is complete
 * @param {number} userID
 * @param {number} atelierID
 * @param {number} score
 * @return {Promise<Error|undefined>}
 */
module.exports.updateAtelierScore = function(userID, atelierID, score) {
  return new Promise((resolve, reject) => {
    sqlPool.query('UPDATE atelier SET score = ? WHERE ID = ? AND uploaderID = ? AND currentStatus = ?;', [score, atelierID, userID, atelierStatus.Complete], (err, res) => {
      if (err || res.affectedRows === 0) {
        return reject(err || new Error('No rows were updated'));
      }
      return resolve(undefined);
    });
  });
};
