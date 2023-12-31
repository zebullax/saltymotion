
/**
 * Set the user session to UTC (as server)
 * @param {object} sqlConnection
 * @return {Promise<undefined|Error>}
 */
module.exports.setTimezoneToUTC = async function(sqlConnection) {
  return new Promise((resolve, reject) => {
    sqlConnection.query('SET time_zone=\'+00:00\';', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};
