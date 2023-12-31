const {stripeClient} = require('./stripeClient.js');

/**
 * Create a transfer between our platform and a target connected account
 * @param {string} targetStripeAccountID
 * @param {number} targetSaltymotionUserID
 * @param {number} amount
 * @return {Promise<object>}
 */
module.exports.createTransfer = async ({targetStripeAccountID, targetSaltymotionUserID, amount}) => {
  return new Promise((resolve, reject) => {
    stripeClient.transfers.create({
      amount: amount,
      currency: 'jpy',
      destination: targetStripeAccountID,
      metadata: {'userID': targetSaltymotionUserID},
    }, (err, transfer) => {
      if (err) {
        reject(err);
      } else {
        resolve(transfer);
      }
    });
  });
};

/**
 * List all Stripe transfers between 2 dates to a connected account
 * @param {string} stripeAccountID
 * @param {Date} startDate - Start date to filter on, default to now - 1 month
 * @param {Date} endDate - End date to filter on, default to now
 * @return {Promise<[object]>}
 */
module.exports.listTransfers = async ({stripeAccountID, startDate = undefined, endDate = undefined}) => {
    const DEFAULT_LIMIT_TRANSFER_LIST = 10;
    // Default to the last 1 months of transfers
    if (startDate === undefined) {
      startDate = new Date(Date.now());
      startDate.setMonth(startDate.getMonth() - 1);
    }
    if (endDate === undefined) {
      endDate = new Date(Date.now());
    }
    const created = {
      'gte': parseInt(startDate.getTime() / 1000, 10),
      'lte': parseInt(endDate.getTime() / 1000, 10),
    };
    const transferList = [];
    const queryParam = {
      limit: DEFAULT_LIMIT_TRANSFER_LIST,
      created: created,
      destination: stripeAccountID,
    };
    for await (const transfer of stripeClient.transfers.list(queryParam)) {
      transferList.push(transfer);
    }
    return transferList;
};
