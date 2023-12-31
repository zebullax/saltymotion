const sqlPool = require('./sqlConnectionPool.js');
const dbUtil = require('./dbUtil.js');

/**
 * Insert a new atelier message from a user
 * @param {number} atelierID
 * @param {number} userID
 * @param {string} message
 * @param {Date} timestamp
 * @return {Promise<number|Error>}
 */
module.exports.insertAtelierMessage = async (atelierID, userID, message, timestamp) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO atelier_message(userID, atelierID, content, timestamp) VALUES (?, ?, ?, ?)';
    sqlPool.query(query, [userID, atelierID, message, timestamp], (err, result) => {
      if (err) {
        console.error(`Error in insertAtelierMessage: ${err}`);
        return reject(err);
      }
      return resolve(result.insertId);
    });
  });
};

/**
 * Remove a comment from an atelier discussion
 * @param {number} requesterID
 * @param {number} messageID
 * @return {Promise<number|Error>}
 */
module.exports.removeAtelierMessage = async (requesterID, messageID) => {
  const query = 'DELETE FROM atelier_message WHERE userID = ? AND ID = ?;';
  return new Promise((resolve, reject) => {
    sqlPool.query(query, [requesterID, messageID], (err, res) => {
      if (err) {
        console.error(`Error in removeAtelierMessage: ${err}`);
        return reject(err);
      }
      resolve(res.affectedRows);
    });
  });
};

/**
 * Select a slice of message from an atelier
 * @param {number} atelierID
 * @param {number} offset
 * @param {number} limit
 * @return {Promise<object[]>}
 */
module.exports.selectAtelierMessage = async (atelierID, offset, limit) => {
  return new Promise((resolve, reject) => {
    const limitString = dbUtil.buildLimitString(offset, limit);
    sqlPool.query('SELECT messageID as ID, userID, userNickname, timestamp, content ' +
                  'FROM atelier_message__view ' +
                  'WHERE atelierID = ? ' +
                  `ORDER BY timestamp DESC ${limitString}`, [atelierID], (err, result) => {
      if (err) {
        console.error(`Error in selectAtelierMessage: ${err}`);
        return reject(err);
      }
      return resolve(result);
    });
  });
};
