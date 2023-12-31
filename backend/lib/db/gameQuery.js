/* eslint-disable max-len */
// Node/Express
const path = require('path');
// Misc
const _ = require('underscore');
// Saltymotion
const dbUtil = require('./dbUtil');
const sqlPool = require('./sqlConnectionPool');
const { atelierStatus } = require('../atelierStatus');
const appLogger = require('../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Build a default game query object to tune the behavior of select games query
 * @return {GameQueryParameter}
 */
module.exports.buildGameQueryParameter = () => ({
  filter: {
    name: undefined,
    nameHint: undefined,
    gameID: [],
    tagID: [],
    excludingGameID: [],
  },
  tweaker: {
    isNbAtelierIncluded: false,
  },
  sort: {
    fieldName: 'name',
    isAsc: true,
  },
  setName(name) {
    this.filter.name = name;
    return this;
  },
  setNameHint(nameHint) {
    this.filter.nameHint = nameHint;
    return this;
  },
  setGameID(gameID) {
    this.filter.gameID = gameID;
    return this;
  },
  setExcludingGameID(excludingGameID) {
    this.filter.excludingGameID = excludingGameID;
    return this;
  },
  setTagID(tagID) {
    this.filter.tagID = tagID;
    return this;
  },
  setSort(fieldName, isAsc) {
    this.sort.fieldName = fieldName;
    this.sort.isAsc = isAsc;
    return this;
  },
  setIsNbAtelierIncluded(isNbAtelierIncluded) {
    this.tweaker.isNbAtelierIncluded = isNbAtelierIncluded;
    return this;
  },
});

/**
 * Select a random sample of game
 * @param {number} sampleSize
 * @return {Promise<[{ID: number, nbAtelier: number}]>}
 */
module.exports.selectGamesSample = ({ sampleSize }) => {
  const query = 'SELECT ID, nbAtelier FROM nb_atelier_per_game__view ORDER BY RAND() LIMIT ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [sampleSize], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Select games using filtering potentially
 * @param {GameQueryParameter} queryParameter
 * @param {number} [offset=0]
 * @param {number} [limit=undefined]
 * @return {Promise<object[]>}
 */
module.exports.selectGame = async ({ queryParameter, offset = 0, limit = undefined }) => {
  const {
    name, nameHint, gameID, tagID, excludingGameID,
  } = queryParameter.filter;
  const { isNbAtelierIncluded } = queryParameter.tweaker;
  const { fieldName, isAsc } = queryParameter.sort;

  const isTagArray = _.isArray(tagID);
  const isNumberTag = _.isNumber(tagID);
  const isFilteredOnTag = (isTagArray && tagID.length) || isNumberTag;
  const nameFilter = nameHint !== undefined ? `name LIKE ${sqlPool.escape(`%${nameHint}%`)}`
    : name !== undefined ? `name = ${sqlPool.escape(name)}`
      : undefined;
  const tagFilter = isTagArray && tagID.length ? `tagID in (${sqlPool.escape(tagID)})`
    : isNumberTag ? `tagID = ${sqlPool.escape(tagID)}`
      : undefined;
  const gameFilter = _.isArray(gameID) && gameID.length ? `ID in ${sqlPool.escape(gameID)}`
    : _.isNumber(gameID) ? `ID = ${sqlPool.escape(gameID)}`
      : _.isArray(excludingGameID) && excludingGameID.length ? `ID NOT IN (${sqlPool.escape(excludingGameID)})`
        : _.isNumber(excludingGameID) ? `ID != ${sqlPool.escape(excludingGameID)}`
          : undefined;
  const aggregatedFilter = _.reduce([nameFilter, tagFilter, gameFilter], (accu, val) => (val !== undefined ? `${accu !== undefined ? `${accu} AND ${val}` : val}` : accu));

  if (isFilteredOnTag && isNbAtelierIncluded) {
    const query = isTagArray
      ? 'SELECT gameID as ID, gameName as name, count(tagID) as tagCount, sum(nbAtelier) as nbAtelier '
        + 'FROM nb_atelier_per_game_per_tag__view '
        + `${aggregatedFilter !== undefined ? `WHERE ${aggregatedFilter}` : ''} `
        + 'GROUP BY ID '
        + 'HAVING count(tagID) = ? '
        + `ORDER BY ${fieldName} ${isAsc ? 'ASC' : 'DESC'} `
      + `${dbUtil.buildLimitString(offset, limit)}; `
      : 'SELECT gameID as ID, gameName as name, sum(nbAtelier) as nbAtelier '
        + 'FROM nb_atelier_per_game_per_tag__view '
        + `${aggregatedFilter !== undefined ? `WHERE ${aggregatedFilter}` : ''} `
        + 'GROUP BY ID '
        + `ORDER BY ${fieldName} ${isAsc ? 'ASC' : 'DESC'} `
        + `${dbUtil.buildLimitString(offset, limit)};`;

    return new Promise((resolve, reject) => {
      sqlPool.query(query, [tagID.length], (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  } if (isNbAtelierIncluded) {
    const query = 'SELECT ID, name, nbAtelier '
                  + 'FROM nb_atelier_per_game__view '
                  + `${aggregatedFilter !== undefined ? `WHERE ${aggregatedFilter}` : ''} `
                  + 'GROUP BY ID '
                  + `ORDER BY ${fieldName} ${isAsc ? 'ASC' : 'DESC'} `
                  + `${dbUtil.buildLimitString(offset, limit)};`;
    return new Promise((resolve, reject) => {
      sqlPool.query(query, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }); // query
    }); // new Promise
  }
  const query = 'SELECT ID, name '
      + 'FROM game_ref '
      + `${aggregatedFilter !== undefined ? `WHERE ${aggregatedFilter}` : ''} `
      + `ORDER BY ${fieldName} ${isAsc ? 'ASC' : 'DESC'} ${fieldName !== 'name' ? ', name ASC' : ''} `
      + `${dbUtil.buildLimitString(offset, limit)};`;
  return new Promise((resolve, reject) => {
    sqlPool.query(query, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Select the number of available games, optionally filtered on tag
 * @param {[number]} [idSequence = undefined]
 * @async
 * @return {Promise<Number>} Promise fulfilled with number of games
 */
module.exports.countQueryResult = async (idSequence = undefined) => new Promise((resolve, reject) => {
  if (idSequence === undefined || !Array.isArray(idSequence) || idSequence.length === 0) {
    sqlPool.query('SELECT count(ID) as count FROM game_ref', (err, result) => {
      if (err) {
        appLogger.error(`Error in countQueryResult ${err}`);
        return reject(err);
      }
      return resolve(result[0].count);
    });
  } else {
    sqlPool.query(
      'SELECT gameID, COUNT(tagID) AS countTags '
        + 'FROM saltymotion.nb_atelier_per_game_per_tag__view '
        + 'WHERE tagID IN (?) '
        + 'GROUP BY gameID '
        + 'HAVING COUNT(tagID) = ?;',
      [idSequence, idSequence.length],
      (err, result) => {
        if (err) {
          appLogger.error(`Error in countQueryResult ${err}`);
          return reject(err);
        }
        return resolve(result.length);
      },
    );
  }
});

/**
 * Select game based on auto-complete hint
 * @param {string} hint - Hint to use for looking up the game name
 * @param {number} [offset=0]
 * @param {number} [limit=undefined]
 * @return {Promise<*>} Fulfilled with game information if available
 */
module.exports.selectGamesFromHint = async (hint, offset = 0, limit = undefined) => {
  const limitString = dbUtil.buildLimitString(offset, limit);
  return new Promise((resolve, reject) => {
    sqlPool.query(
      `SELECT ID, name FROM game_ref WHERE name LIKE ? ORDER BY name ASC ${limitString};`,
      [`%${hint}%`],
      (err, result) => {
        if (err) {
          appLogger.error(`Error in selectGamesFromHint ${err}`);
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

/**
 * Select a game from its ID
 * @param {number} ID - Game ID
 * @return {Promise<Game>}
 */
module.exports.selectGameFromID = async (ID) => new Promise((resolve, reject) => {
  sqlPool.query('SELECT ID, name, editor, releaseYear, introduction FROM game_ref WHERE ID = ?', [ID], (err, result) => {
    if (err) {
      appLogger.error(`Error in selectGameFromID ${err}`);
      reject(err);
    } else {
      resolve(result[0]);
    }
  });
});

/**
 * Select nb Reviewers having this game in their pool
 * @param {number} ID
 * @return {Promise<{nbReviewers: number}>}
 */
module.exports.selectNbReviewersPerGameID = async ({ ID }) => {
  const query = 'SELECT COUNT(*) as nbReviewers FROM reviewer WHERE gameID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [ID], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.length === 1 ? res[0] : { nbReviewers: 0 });
      }
    });
  });
};

/**
 * Select game statistics from a game ID
 * @param {number} gameID
 * @return {Promise<GameStatistics>}
 */
module.exports.selectGameStatistics = async({ gameID }) => {
  const query = ''
    + 'WITH '
    + `  statNbAtelier AS (SELECT gameID, COUNT(*) AS nbAtelier FROM saltymotion.atelier WHERE currentStatus <${atelierStatus.Deleted} GROUP BY gameID), `
    + '  statNbReviewer AS (SELECT gameID, COUNT(*) AS nbReviewers FROM saltymotion.reviewer group by gameID) '
    + 'SELECT game_ref.ID, IFNULL(nbAtelier, 0) as nbWorkshops, IFNULL(nbReviewers, 0) as nbReviewers '
    + 'FROM game_ref '
    + '  LEFT JOIN statNbAtelier ON game_ref.ID = statNbAtelier.gameID '
    + '  LEFT JOIN statNbReviewer ON game_ref.ID = statNbReviewer.gameID '
    + 'WHERE game_ref.ID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [gameID], (err, res) => {
      if (err) {
        appLogger.error(`Error in selectGameStatistics ${err.sql}`);
        reject(err);
      } else if (res.length === 0) {
        reject(new Error(`Game ${gameID} not found`));
      } else {
        resolve(res[0]);
      }
    });
  });
};
