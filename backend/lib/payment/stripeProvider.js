const {stripeClient} = require('./stripeClient.js');

module.exports.listConnectedAccount = async () => {
  return new Promise((resolve, reject) => {
    stripeClient.accounts.list({
    }, (err, accounts) => {
      if (err) {
        reject(err);
      } else {
        resolve(accounts.data);
      }
    });
  });
};
