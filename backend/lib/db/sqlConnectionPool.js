// Saltymotion
const dbParam = require('./dbParam.js');
// Misc
// eslint-disable-next-line import/order
const sqlPool = require('mysql').createPool(dbParam.connection.prod);

sqlPool.on('connection', (conn) => {
  conn.query('SET time_zone=\'+00:00\';', (err) => {
    if (err) {
      console.error(`Error in sqlPool onConnection: ${err}`);
      // Can't really recover from there...
      throw err;
    }
  });
});

module.exports = sqlPool;
