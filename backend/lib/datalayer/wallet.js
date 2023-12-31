// Saltymotion
const userQuery = require('../db/userQuery');
const cashQuery = require('../db/cashQuery');
const {WalletActivityType} = require('../payment/walletReference');
const {isoToEpochTimeRange} = require('../dateUtility');
const {stripeClient} = require('../payment/stripeClient');

/**
 * Normalize a raw Stripe charge object into our format
 * @param {Object} rawCharge
 * @param {string} rawCharge.status
 * @param {number} rawCharge.amount
 * @param {Date} rawCharge.date
 * @param {string} rawCharge.failure_message
 * @param {string} rawCharge.receipt_url
 * @return {Charge}
 */
const normalizeCharge = (rawCharge) => {
  const {
    status,
    amount,
    created,
    failure_message: failureMessage,
    receipt_url: url,
  } = rawCharge;
  return {
    status,
    amount,
    date: new Date(created * 1000), // ms to s
    url,
    type: WalletActivityType.charge,
    failureMsg: status === 'failed' ? failureMessage : '',
  };
};

/**
 * Normalize a raw object to a normalized bounty
 * @param {Object} rawBounty
 * @param {number} rawBounty.reviewerID
 * @param {string} rawBounty.reviewerName
 * @param {number} rawBounty.amount
 * @param {number} rawBounty.atelierID
 * @param {Date} rawBounty.date
 * @return {OutgoingBounty}
 */
const normalizeBounty = (rawBounty) => {
  const {
    reviewerID,
    reviewerName,
    amount,
    atelierID,
    timestamp: date,
  } = rawBounty;
  return {
    reviewer: {ID: reviewerID, name: reviewerName},
    amount,
    date,
    type: WalletActivityType.outgoingBounty,
    atelier: {ID: atelierID},
  };
};

const wallet = {
  /**
   * List charges related to a Stripe customer ID
   * @async
   * @param {string} userID - User whose charges we are listing
   * @param {Date} [startDate]
   * @param {Date} [endDate]
   * @return {Promise<Charge[]>}
   */
  async listCharges({userID, startDate = undefined, endDate = undefined}) {
    const stripeCustomerID = await userQuery.selectStripeCustomerID({userID});
    if (stripeCustomerID == null) {
      return [];
    }
    const normalizedDateRange = isoToEpochTimeRange({startDate, endDate});
    const DEFAULT_LIMIT_CHARGE_LIST = 25;

    const created = {'gte': normalizedDateRange.startFrom, 'lte': normalizedDateRange.endBefore};
    const chargesList = [];
    const queryParam = {
      limit: DEFAULT_LIMIT_CHARGE_LIST,
      created: created,
      customer: stripeCustomerID,
    };
    for await (const charge of stripeClient.charges.list(queryParam)) {
      chargesList.push(charge);
    }
    return chargesList.map((rawCharge) => normalizeCharge(rawCharge));
  },

  /**
   * List bounty paid to reviewers from user to reviewer
   * @param {string} userID - User whose outgoing bounties we list
   * @param {Date} [startDate]
   * @param {Date} [endDate]
   * @return {Promise<OutgoingBounty[]>}
   */
  async listOutgoingBounties({userID, startDate = undefined, endDate = undefined}) {
    const bounties = await cashQuery.listOutgoingBounty({
      userID,
      startFrom: startDate,
      endBefore: endDate,
    });
    return bounties.map((bounty) => normalizeBounty(bounty));
  },
};

module.exports = wallet;
