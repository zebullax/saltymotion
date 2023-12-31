// eslint-disable-next-line new-cap
// Node/Express
const apiRouter = require('express').Router();
const path = require('path');
// Misc
const { StatusCodes } = require('http-status-codes');
// Saltymotion
const userQuery = require('../lib/db/userQuery');
const middleware = require('../lib/middleware');
const stripeCharge = require('../lib/payment/stripeCharge');
const stripeCustomer = require('../lib/payment/stripeCustomer');
const wallet = require('../lib/datalayer/wallet');
const { checkIsUserIDSelf } = require('../lib/middleware');
const { DEFAULT_CHARGE_VALUE, DEFAULT_CHARGE_CURRENCY } = require('../lib/payment/stripeCharge');
const dataLayer = require('../lib/datalayer/dataLayer');

const appLogger = require('../lib/log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const { SERVER_BASE_ADDRESS } = process.env;

const handlerApiRoute = {
  /**
   * Create a checkout session with express
   * @param {e.Request} req
   * @param {number} req.body.nbBags
   * @param {string} req.jwt.ID
   * @param {e.Response} res
   */
  createCheckoutID: async (req, res) => {
    const userID = req.jwt.ID;
    const nbBags = req.body?.nbBags ?? 1;
    try {
      // FIXME: race condition on DB read/write for stripe customer ID...
      //  Does not seem exploitable trivially but need to find a fix
      const userDataLayer = dataLayer.user({ userID });
      const user = await userDataLayer.get();
      const stripeCustomerID = await userQuery.selectStripeCustomerID({ userID });

      if (stripeCustomerID == null) {
        appLogger.debug(`Creating a Stripe customer for ${userID}...`);
        const customerCreated = await stripeCustomer.createCustomer({
          email: user.email,
          name: user.name,
          userID,
        });
        appLogger.debug(`Created customer ${JSON.stringify(customerCreated)} for ${userID}`);
        await userQuery.setStripeCustomerID({ userID, stripeCustomerID: customerCreated.id });
        user.stripeCustomerID = customerCreated.id;
      }

      const chargeDescription = stripeCharge.buildChargeDescription()
        .setAmount(DEFAULT_CHARGE_VALUE)
        .setName('CHIPS_BUY')
        .setQty(nbBags)
        .setDescription(`Purchase ${nbBags * DEFAULT_CHARGE_VALUE} chips`)
        .setCurrency(DEFAULT_CHARGE_CURRENCY)
        .setSaltymotionEmail(user.email)
        .setSaltymotionUserID(userID)
        .setCustomerID(user.stripeCustomerID)
        .setRedirectURL({
          success: `${SERVER_BASE_ADDRESS}?action=buyChips&status=success`,
          cancel: `${SERVER_BASE_ADDRESS}?action=buyChips&status=cancel`,
        });
      const stripeSessionID = await stripeCharge.createCheckoutSession(chargeDescription);
      if (stripeSessionID === undefined) {
        appLogger.error(`Error in createCheckoutID, user ${userID}: undefined sessionID`);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
      } else {
        res.json({ sessionID: stripeSessionID });
      }
    } catch (err) {
      appLogger.error(`Error in createCheckoutID, user ${userID}: ${err}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * List charges and payment in a user wallet
   * @param {any} req
   * @param {{ID: string}} req.jwt
   * @param {{gt: string, lt: string}} [req.query.chargesFilter.date] - ISO datetime range
   * @param {{gt: string, lt: string}} [req.query.outgoingBountiesFilter.date] - ISO datetime range
   * @param {Object} res
   * @return {Promise<WalletHistory>}
   */
  async listUserWalletHistory(req, res) {
    try {
      const userID = req.jwt.ID;
      const chargesDate = req.query?.chargesFilter?.date;
      const outgoingBountiesDate = req.query?.outgoingBountiesFilter?.date;

      let charges = [];
      let outgoingBounties = [];

      if (chargesDate !== undefined) {
        charges = await wallet.listCharges({
          userID,
          startDate: new Date(chargesDate.gt),
          endDate: new Date(chargesDate.lt),
        });
      }
      if (outgoingBountiesDate !== undefined) {
        outgoingBounties = await wallet.listOutgoingBounties({
          userID,
          startDate: new Date(outgoingBountiesDate.gt),
          endDate: new Date(outgoingBountiesDate.lt),
        });
      }

      res.json({ charges, outgoingBounties });
    } catch (e) {
      appLogger.error(`Error in listUserWalletHistory: ${e}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

apiRouter.post('/wallets/:userID/checkoutID', middleware.enforceJWT, checkIsUserIDSelf, handlerApiRoute.createCheckoutID); // eslint-disable-line max-len
apiRouter.get('/wallets/:userID/history', middleware.enforceJWT, checkIsUserIDSelf, handlerApiRoute.listUserWalletHistory); // eslint-disable-line max-len
module.exports = apiRouter;
