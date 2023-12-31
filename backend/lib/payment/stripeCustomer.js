const {stripeClient} = require('./stripeClient.js');

/**
 * Select customer information from Stripe based on the saltymotion account email
 * @async
 * @param {string} email
 * @return {Promise<undefined|object>}
 */
module.exports.selectCustomerFromEmail = async function(email) {
  return new Promise((resolve, reject) => {
    stripeClient.customers.list({limit: 1, email}, (err, customers) => {
      if (err) {
        console.error(`Error in selectCustomerFromEmail: ${err}`);
        reject(err);
      } else {
        if (customers.length === 0) {
          resolve(undefined);
        } else {
          resolve(customers.data[0]);
        }
      }
    });
  });
};

/**
 * Create a customer and send back its ID
 * @param {string} email
 * @param {string} name
 * @param {string} userID
 * @return {Promise<Error|object>}
 */
module.exports.createCustomer = async function({email, name, userID}) {
  return new Promise((resolve, reject) => {
    stripeClient.customers.create({
      description: name,
      email: email,
      metadata: {'saltyID': userID},
    }, (err, customer) => {
      if (err) {
        console.error(`Error in createCustomer: ${err}`);
        reject(err);
      } else {
        resolve(customer);
      }
    });
  });
};
