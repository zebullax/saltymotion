/* eslint-disable max-len */
// Saltymotion
const sqlPool = require('./sqlConnectionPool.js');
const {userType} = require('../activity');

/**
 * Get the user account balance
 * @param {string} userID
 * @return {Promise<{freeCoin: number, frozenCoin: number, redeemableCoin: number}>}
 */
module.exports.selectUserBalance = (userID) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('SELECT freeCoin, frozenCoin, redeemableCoin FROM user WHERE ID = ?;', [userID], (err, result) => {
      if (err) {
        return reject(err);
      }
      const {freeCoin, frozenCoin, redeemableCoin} = result[0];
      return resolve({freeCoin, frozenCoin, redeemableCoin});
    });
  });
};

/**
 * Update a user free chips balance
 * @param {string} userID
 * @param {number} delta
 * @return {Promise<unknown>}
 */
module.exports.increaseUserFreeCoin = (userID, delta) => {
  return new Promise(async (resolve, reject) => {
    sqlPool.query('UPDATE user SET freeCoin = freeCoin + ? WHERE ID = ?;', [delta, userID], (err, result) => {
      if (err || result.affectedRows !== 1) {
        return reject(err);
      }
      return resolve(undefined);
    });
  });
};

/**
 * Select list of paid bounties for a user
 * @param {string} userID
 * @param {Date} startFrom
 * @param {Date} endBefore
 * @return {Promise<{timestamp: number, atelierID: number, amount: number, reviewerID: number, reviewerName: string}[]>}
 */
module.exports.listOutgoingBounty = ({userID, startFrom, endBefore}) => {
  const query =
    'SELECT the_vault.timestamp as timestamp, the_vault.atelierID, the_vault.amount, user.ID as reviewerID, user.nickname as reviewerName ' +
    'FROM the_vault INNER JOIN user on the_vault.receiverID = user.ID ' +
    'WHERE the_vault.senderID = ? AND the_vault.senderTypeID = ? ' +
    'AND `timestamp` > ? AND `timestamp` < ? '+
    'ORDER BY the_vault.timestamp DESC;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID, userType.user, startFrom, endBefore], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};
