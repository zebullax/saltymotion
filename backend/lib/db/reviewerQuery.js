/* eslint-disable max-len */
// Node/Express
const path = require('path');
// Saltymotion
const dbUtil = require('./dbUtil');
const sqlPool = require('./sqlConnectionPool');
const appLogger = require('../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Select the reviewer score
 * @async
 * @param {[string]} userID - Sequence of User ID to filter on
 * @return {Promise<Object>} Fulfilled with the reviewer stat
 */
const selectReviewerScore = async (userID) => new Promise((resolve, reject) => {
  const query = 'SELECT reviewerID, AVG(score) as reviewerScore, count(*) as nbReview '
        + 'FROM atelier '
        + 'WHERE reviewerID in (?) '
        + 'GROUP BY reviewerID;';
  sqlPool.query(query, [userID], (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result);
  });
});

module.exports.selectReviewerScore = selectReviewerScore;

/**
 * Select ID for the most active reviewers
 * @async
 * @param {number} limitNb - The max number of row to return
 * @return {Promise<*>} Fulfilled with a sequence of atelier ID
 */
module.exports.selectShowcaseReviewerID = async (limitNb) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT DISTINCT ID FROM reviewer_profile__view '
                  + 'ORDER BY nb_atelier DESC LIMIT ?;', [limitNb], (err, result) => {
    if (err) {
      return reject(err);
    }
    return resolve(result);
  });
});

/**
 * Select reviewer ID that produce the most atelier, filtering on some tag
 * @param {[number]} idSequence - Sequence of tag ID
 * @param {number} offset -
 * @param {number} limit -
 * @return {Promise<*>} Fulfilled with a sequence of atelier ID
 */
module.exports.selectReviewerIdFilterOnTag = async (idSequence, offset = 0, limit = undefined) => new Promise((resolve, reject) => {
  const limitString = dbUtil.buildLimitString(offset, limit);
  sqlPool.query(
    'SELECT reviewerID as ID, COUNT(tagID) AS nbTag '
        + 'FROM saltymotion.nb_atelier_per_reviewer_per_tag__view '
        + `WHERE tagID IN (?) GROUP BY reviewerID HAVING nbTag = ${idSequence.length} ${limitString}`,
    [idSequence],
    (err, result) => {
      if (err) {
        appLogger.error(err.sql);
        return reject(err);
      }
      return resolve(result);
    },
  );
});

/**
 * Select a reviewer game pool
 * @param {string} reviewerID
 * @return {Promise<ReviewerGame[] | undefined>}
 */
module.exports.selectGamePool = ({ reviewerID }) => {
  const query = 'SELECT gamePool FROM reviewer_game_pool__view WHERE userID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [reviewerID], (err, result) => {
      if (err) {
        appLogger.error(`Error in selectGamePool: ${err.sql}`);
        reject(err);
      } else if (result.length === 0) {
        resolve(undefined);
      } else {
        resolve(JSON.parse(result[0].gamePool));
      }
    });
  });
};

/**
 * Select a random sample of reviewers
 * @param {number} sampleSize
 * @return {Promise<[{ID: number, name:string, twitterName: string, youtubeName: string, twitchName: string, registrationDate: Date, countryCode: string, gamePool: string}]>}
 */
module.exports.selectReviewersSample = ({ sampleSize }) => {
  const query = 'SELECT ID, name, twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone, gamePool '
    + 'FROM reviewer_profile_aggregated_game_pool__view '
    + 'ORDER BY RAND() LIMIT ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [sampleSize], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports.selectReviewers = async function (offset = undefined, limit = undefined) {
  const limitString = dbUtil.buildLimitString(offset, limit);
  // FIXME this ORDER BY + OFFSET is not deterministic and may return same and or diff results...
  const query = 'SELECT ID, name, twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone, gamePool, selfIntroduction '
    + 'FROM reviewer_profile_aggregated_game_pool__view '
    + `ORDER BY name ASC ${limitString};`;

  return new Promise((resolve, reject) => {
    sqlPool.query(query, [], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Select reviewer profile from a hint on name and potentially filter on game
 * @param {string} hint
 * @param {number} [gameID]
 * @param {number} [offset]
 * @param {number} [limit]
 * @return {Promise<[{ID: number, twitchName:string, youtubeName:string, twitterName:string, gameID: number, gameName: string, score: number,  nbReview: number,  minimumBounty: number, registrationDate: any, countryCode: string, timezone: string}] | [{ID: number, name:string, registrationDate: any, countryCode: string, timezone: string, gamePool: string}]>}
 */
module.exports.selectReviewerFromHint = function ({
  hint, gameID = Number.NaN, offset = 0, limit = undefined,
}) {
  const limitString = dbUtil.buildLimitString(offset, limit);
  if (!Number.isNaN(gameID)) {
    return new Promise((resolve, reject) => {
      sqlPool.query(
        'SELECT ID, name, gameID, gameName, nb_atelier as nbReview, avgScore as score, minimumBounty, '
            + 'twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone '
          + 'FROM reviewer_profile__view '
          + 'WHERE name LIKE ? AND gameID = ? '
          + `ORDER BY name ASC ${limitString};`,
        [`%${hint}%`, gameID],
        (err, result) => {
          if (err) {
            appLogger.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  }
  return new Promise((resolve, reject) => {
    sqlPool.query(
      'SELECT ID, name, twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone, gamePool '
          + 'FROM reviewer_profile_aggregated_game_pool__view '
          + 'WHERE name LIKE ? '
          + `ORDER BY name ASC ${limitString};`,
      [`%${hint}%`],
      (err, result) => {
        if (err) {
          appLogger.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

/**
 * Select ID and nickname of reviewers based on nickname hint
 * @param {string} hint
 * @param {number} [offset]
 * @param {number} [limit]
 * @return {Promise<{ID: number, name: string}[]>}
 */
module.exports.selectReviewerShortIDFromHint = function ({ hint, offset, limit }) {
  const limitString = dbUtil.buildLimitString(offset, limit);
  const query = 'SELECT DISTINCT ID, nickname as name '
      + 'FROM user INNER JOIN reviewer ON user.Id = reviewer.userID '
      + 'WHERE nickname LIKE ? '
      + `ORDER BY name ASC ${limitString};`;
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [`%${hint}%`], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Select reviewers profile from a sequence of reviewers ID
 * @param {string[]} reviewersID
 * @return {Promise<[{ID: number, twitchName:string, youtubeName:string, twitterName:string, name:string, registrationDate: string, countryCode: string, timezone: string, gamePool: string}]>}
 */
module.exports.selectReviewersFromID = function (reviewersID) {
  const query = 'SELECT ID, name, IFNULL(selfIntroduction, \'\') as selfIntroduction, twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone, gamePool '
    + 'FROM reviewer_profile_aggregated_game_pool__view '
    + 'WHERE ID in (?) '
    + 'ORDER BY name ASC;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [reviewersID], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Update reviewer self introduction
 * @param {string} reviewerID
 * @param {string} selfIntroduction
 * @return {Promise<(Error|undefined)>}
 */
module.exports.updateReviewerSelfIntroduction = ({ reviewerID, selfIntroduction }) => {
  const query = 'UPDATE user SET selfIntroduction = ? WHERE ID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [selfIntroduction, reviewerID], (err, res) => {
      if (err || res.affectedRows !== 1) {
        reject(err || new Error(`Error while updating selfIntroduction: ${selfIntroduction}, ID: ${reviewerID}`));
      } else {
        resolve(undefined);
      }
    });
  });
};

/**
 * Select reviewers profile from a sequence of reviewers ID
 * @param {number} gameID
 * @param {number} offset
 * @param {number} limit
 * @return {Promise<[{ID: number, name: string, registrationDate: string, countryCode: string, timezone: string, gamePool: string}]>}
 */
module.exports.selectReviewersFromGameID = function (gameID, offset, limit) {
  const limitString = dbUtil.buildLimitString(offset, limit);
  const query = 'SELECT ID, name, registrationDate, countryCode, timezone, gamePool '
    + 'FROM reviewer_profile_aggregated_game_pool__view '
    + 'WHERE ID in (SELECT userID FROM reviewer WHERE gameID = ?) '
    + 'ORDER BY name ASC '
    + `${limitString};`;
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [gameID], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Select reviewers profile from a sequence of reviewers ID
 * @param {number} gameID
 * @return {Promise<{nbResults: number}>}
 */
module.exports.selectNbReviewersFromGameID = function (gameID) {
  return new Promise((resolve, reject) => {
    sqlPool.query(
      'SELECT count(ID) AS nbResults'
      + 'FROM reviewer_profile_aggregated_game_pool__view '
      + `WHERE ID in (SELECT userID FROM reviewer WHERE gameID = ?); ${
        [gameID]}`,
      (err, result) => {
        if (err) {
          appLogger.error(err);
          reject(err);
        } else {
          if (result.length === 0) {
            resolve({ nbResults: 0 });
          }
          resolve(result[0]);
        }
      },
    );
  });
};

/**
 * Select reviewers with the best average score for a given `gameID`
 * @param {number} gameID
 * @param {number} limit
 * @return {Promise<[{ID: string, nbWorkshops: number, avgScore: number}]>}
 */
module.exports.selectTopReviewerFromGameID = ({
  gameID,
  limit,
}) => {
  const query = ''
    + 'SELECT user.ID as ID, nb_atelier as nbWorkshops, avgScore '
    + 'FROM reviewer_profile__view INNER JOIN user ON reviewer_profile__view.ID=user.ID '
    + 'WHERE gameID = ? '
    + 'ORDER BY avgScore DESC, nb_atelier DESC, name ASC '
    + 'LIMIT ?;';

  return new Promise((resolve, reject) => {
    sqlPool.query(query, [gameID, limit], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Select reviewers profile from a sequence of reviewers ID
 * @param {string[]} reviewersID
 * @param {number} gameID
 * @return {Promise<[{ID: number, name:string, registrationDate: string, countryCode: string, timezone: string, gamePool: string}]>}
 */
module.exports.selectReviewersFromIDAndGameID = function (reviewersID, gameID) {
  return new Promise((resolve, reject) => {
    sqlPool.query(
      'SELECT ID, name, twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone, gamePool '
      + 'FROM reviewer_profile_aggregated_game_pool__view '
      + 'WHERE ID IN (?) '
        + 'AND ID IN (SELECT ID FROM reviewer_profile__view WHERE gameID = ?); ',
      [reviewersID, gameID],
      (err, result) => {
        if (err) {
          appLogger.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

/**
 * Select reviewers profile from game ID and hint
 * @param {string} hint
 * @param {number} gameID
 * @return {Promise<[{ID: number, name:string, registrationDate: string, countryCode: string, timezone: string, gamePool: string}]>}
 */
module.exports.selectReviewersFromGameIDAndHint = function (hint, gameID) {
  return new Promise((resolve, reject) => {
    sqlPool.query(
      'SELECT ID, name, twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone, gamePool '
      + 'FROM reviewer_profile_aggregated_game_pool__view '
      + 'WHERE name like ? AND ID IN (SELECT ID FROM reviewer_profile__view WHERE gameID = ?); ',
      [`%${hint}%`, gameID],
      (err, result) => {
        if (err) {
          appLogger.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

/**
 * Select the pool of reviewers which have tags associated with given tags ID
 * @param {number[]} tagsID
 * @param {number} [limit=undefined]
 * @return {Promise<[{ID: number, name:string, registrationDate: any, countryCode: string, timezone: string, gamePool: string}]>}
 */
module.exports.selectReviewersFromTagsID = function (tagsID, limit) {
  const query = 'SELECT ID, name, twitterName, youtubeName, twitchName, registrationDate, countryCode, timezone, gamePool '
      + 'FROM reviewer_profile_aggregated_game_pool__view '
      + 'WHERE ID in '
      + '  (SELECT reviewerID FROM atelier WHERE ID in '
      + '    (SELECT atelierID FROM atelier_tag WHERE tagID in (?))'
      + '  ) '
      + 'ORDER BY name asc LIMIT ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [tagsID, limit], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Select the pool of reviewers which have tags associated with given tags ID
 * // FIXME the nbReview and score should be associated to this tag and not some random game
 * @param {number} tagID
 * @param {number} [limit=undefined]
 * @return {Promise<[{ID: number, name:string, registrationDate: any, nbReview: number, score: number, countryCode: string, timezone: string, gamePool: string}]>}
 */
module.exports.selectTopReviewersFromTagID = function (tagID, limit) {
  const query = 'SELECT ID, name, registrationDate, countryCode, timezone, MAX(nb_atelier) as nbReview, avgScore '
    + 'FROM reviewer_profile__view '
    + 'WHERE ID in '
    + '  (SELECT distinct reviewerID FROM atelier WHERE ID in (SELECT atelierID FROM atelier_tag WHERE tagID = ? )) '
    + 'GROUP BY ID '
    + 'ORDER BY avgScore DESC LIMIT ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [tagID, limit], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Select the nb of reviewers
 * @return {Promise<{nbAvailableReviewers: number}>}
 */
module.exports.selectNbReviewersAvailable = function () {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT COUNT(DISTINCT ID) AS nbAvailableReviewers '
      + 'FROM reviewer_profile__view;', [], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Insert games into a reviewer game pool
 * If key is there already, update minimum bounty
 * @param {string} reviewerID
 * @param {[[number, number]]} gamePool - First is the gameID, second is minimum bounty
 * @return {Promise<undefined|number>}
 */
module.exports.insertOrUpdateGameToReviewerPool = (reviewerID, gamePool) => {
  if (gamePool.length === 0) {
    return Promise.resolve(0);
  }
  // eslint-disable-next-line max-len
  const query = 'INSERT INTO reviewer (userID, gameID, minimumBounty) VALUES ? ON DUPLICATE KEY UPDATE minimumBounty = VALUES(minimumBounty);';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [gamePool.map((game) => [reviewerID, game[0], game[1]])], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result.affectedRows);
      }
    });
  });
};

/**
 * Remove games from reviewer game pool
 * @param {string} reviewerID
 * @param {[number]} gameIDs
 * @return {Promise<*>}
 */
module.exports.removeGameFromReviewerPool = (reviewerID, gameIDs) => {
  if (gameIDs.length === 0) {
    return Promise.resolve(0);
  }
  const query = 'DELETE FROM reviewer WHERE gameID IN (?) AND userID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [gameIDs, reviewerID], (err, result) => {
      if (err) {
        appLogger.error(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Update a user game pool
 * @param {string} userID
 * @param {{ID: number, minimumBounty: number}[]} gamePool
 * @return {Promise<{userID: string, gameID: number, minimumBounty: number}[]|void>}
 */
module.exports.updateReviewerGamePool = async ({
  userID,
  gamePool,
}) => {
  const removeGame = () => new Promise((resolve, reject) => {
    if (gamePool.length === 0) {
      // Remove everything
      const query = 'DELETE FROM reviewer WHERE userID = ?;';
      sqlPool.query(query, [userID], (err) => {
        if (err) {
          appLogger.error(`Error in updateReviewerGamePool removeGame: ${err.sql}`);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    } else {
      const IDs = gamePool.map((game) => game.ID);
      const query = ''
        + 'WITH currentGameIds AS (SELECT gameID FROM reviewer WHERE userID = ?) '
        + 'DELETE FROM reviewer '
        + 'WHERE gameID IN (SELECT gameID FROM currentGameIds) '
        + 'AND gameID NOT IN (?) '
        + 'AND userID = ?; ';
      sqlPool.query(query, [userID, IDs, userID], (err) => {
        if (err) {
          appLogger.error(`Error in updateReviewerGamePool, del: ${err.sql}`);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    }
  });

  const addGame = () => new Promise((resolve, reject) => {
    // Build a sequence of (userID, gameID, bounty) for insert
    const valQuery = gamePool.map((game) => ([userID, game.ID, game.minimumBounty]));

    const query = ''
      + 'INSERT INTO reviewer (userID, gameID, minimumBounty) VALUES ? AS updatedValues '
      + 'ON DUPLICATE KEY UPDATE minimumBounty = updatedValues.minimumBounty;';
    sqlPool.query(query, [valQuery], (err) => {
      if (err) {
        appLogger.error(`Error in updateReviewerGamePool, add: ${err.sql}`);
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
  return Promise.all([
    removeGame(),
    gamePool.length > 0 ? addGame() : Promise.resolve(),
  ]);
};
