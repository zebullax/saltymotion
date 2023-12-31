const sqlPool = require('./sqlConnectionPool.js');

/**
 * Select Atelier history
 * @param {number} atelierID
 * @return {Promise<AtelierHistoryEvent[]>} Fulfilled with the atelier history events
 */
module.exports.selectAtelierHistory = (atelierID) => {
  return new Promise((resolve, reject) => {
    sqlPool.query('SELECT statusID, timestamp, metadata FROM atelier_history WHERE atelierID = ? ORDER BY timestamp DESC',
                  [atelierID],
                  (err, result) => {
      if (err) {
        console.error(`Error in selectAtelierHistory ${err}`);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
