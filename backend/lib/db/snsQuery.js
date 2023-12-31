/* eslint-disable max-len */
const sqlPool = require('./sqlConnectionPool.js');

/**
 * Select a user SNS accounts
 * @param {string} userID
 * @return {Promise<[{twitterName: string, twitchName: string, youtubeName: string}] | Error>}
 */
module.exports.selectSnsAccountsFromUserID = function(userID) {
  const query =
      'SELECT ifnull(twitterName, \'\') as twitterName, ' +
      'ifnull(twitchName, \'\') as twitchName, ' +
      'ifnull(youtubeName, \'\') as youtubeName FROM sns_account WHERE userID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID], (err, res) => {
      if (err) {
        console.error(`Error in selectSnsAccountsFromUserID: ${err}`);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * Save SNS accounts for a user
 * @param {string} userID
 * @param {string} twitterName
 * @param {string} twitchName
 * @param {string} youtubeName
 * @return {Promise<Error|undefined>}
 */
module.exports.saveSnsAccounts = function({userID, twitterName, twitchName, youtubeName}) {
  const query =
      'INSERT INTO sns_account (userID, twitterName, twitchName, youtubeName) VALUES (?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE ' +
      'twitterName = ?, twitchName = ?, youtubeName = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [userID, twitterName, twitchName, youtubeName, twitterName, twitchName, youtubeName], (err) => {
      if (err) {
        console.error(`Error in saveSnsAccounts: ${err}`);
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};
