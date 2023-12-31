/* eslint-disable max-len */
const sqlPool = require('./sqlConnectionPool');

/**
 * Select all gameID that a user has in his favorite list
 * @param {string} userID
 * @return {Promise<Game[]>}
 */
module.exports.selectFavoriteGames = (userID) => {
  const query = ''
    + 'SELECT gameID as ID, name, releaseYear, editor, introduction '
    + 'FROM game_follower INNER JOIN game_ref ON game_ref.ID = gameID '
    + 'WHERE userID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Select all gameID that a user has in his favorite list
 * @param {number} userID
 * @return {Promise<number[]>}
 */
module.exports.selectFavoriteGamesID = (userID) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT gameID from game_follower where userID = ?;';
    sqlPool.query(query, [userID], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Add a game to the list of game followed by a user
 * @param {number} userID
 * @param {number} gameID
 * @return {Promise<(undefined | Error)>}
 */
module.exports.addToFavoriteGames = function(userID, gameID) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO game_follower (userID, gameID) VALUES (?, ?);';
    sqlPool.query(query, [userID, gameID], ((err, res) => {
      if (err || res.affectedRows !== 1) {
        reject(err || new Error('No lines were inserted'));
      } else {
        resolve(undefined);
      }
    }));
  });
};

/**
 * Remove from a user list of followed games
 * @param {number} userID
 * @param {number} gameID
 * @return {Promise<(undefined | Error)>}
 */
module.exports.removeFromFavoriteGames = function(userID, gameID) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM game_follower WHERE userID = ? AND gameID = ?;';
    sqlPool.query(query, [userID, gameID], ((err, res) => {
      if (err || res.affectedRows !== 1) {
        reject(err || new Error('No lines were removed'));
      } else {
        resolve(undefined);
      }
    }));
  });
};
