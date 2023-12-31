// Node/Express
// eslint-disable-next-line new-cap
const webhookRouter = require('express').Router();
// Saltymotion
const {notificationType} = require('../lib/notificationReference.js');
const {sendIoNotification} = require('../lib/websocket/websocketUtility.js');
const cashQuery = require('../lib/db/cashQuery.js');
const userQuery = require('../lib/db/userQuery.js');
// Misc
const stripe = require('stripe');


/**
 * Convert a charge to its coin equivalent
 * @param {number} amount
 * @param {number} currency
 * @return {number}
 */
const convertChargeValueToCoinAmount = function(amount, currency) {
  // FIXME Hardcoded ATM
  const coinEquivalent = 1000;
  console.debug(`Converting ${amount}${currency} to ${coinEquivalent}`);
  return coinEquivalent;
};

webhookRouter.post('/webhook', async (request, response) => {
  response.sendStatus(200);

  let event;
  // Sign events to check it originated from Stripe
  const signature = request.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNATURE;
  try {
    event = stripe.webhooks.constructEvent(request.rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(`webhook error '${err}' while constructing event from ${request.rawBody}`);
    return;
  }

  const getUserIdFromIntent = async (paymentIntent) => {
    // const customerID = paymentIntent?.customer?.id;
    const customerID = paymentIntent && paymentIntent.customer || undefined;
    if (customerID === undefined) {
      return undefined;
    }
    const queryParam = userQuery.buildUserQueryParameter().setStripeCustomerID(customerID);
    // return (await userQuery.selectUser(queryParam))[0]?.ID;
    const user = (await userQuery.selectUser(queryParam))[0];
    return user && user.ID;
  };

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      try {
        const userID = await getUserIdFromIntent(paymentIntent);
        if (userID === undefined) {
          console.error(`Cannot find user for payment: ${JSON.stringify(paymentIntent)}`);
          return;
        }
        const {amount, currency} = paymentIntent;
        const coinChargeAmount = convertChargeValueToCoinAmount(amount, currency);
        await cashQuery.increaseUserFreeCoin(userID, coinChargeAmount);
        sendIoNotification({
          socketIO: request.app.io,
          userID,
          payload: {chargeAmount: coinChargeAmount},
          msgType: notificationType.status.charge.complete,
        });
      } catch (e) {
        console.error(`Error in 'payment_intent.succeeded': ${e}, paymentIntent: ${JSON.stringify(paymentIntent)}`);
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.debug(`payment_intent.failed: ${JSON.stringify(paymentIntent)}`);
      try {
        const userID = await getUserIdFromIntent(paymentIntent);
        if (userID === undefined) {
          console.error(`Cannot find user for failed payment: ${JSON.stringify(paymentIntent)}`);
          return;
        }
        sendIoNotification({
          socketIO: request.app.io,
          userID,
          isError: true,
          msgType: notificationType.error.charge.failure,
        });
      } catch (e) {
        console.error(`Error in webhook 'payment_intent.payment_failed': ${e}` +
                      `, paymentIntent: ${JSON.stringify(paymentIntent)}`);
      }
      break;
    }
    case 'payment_intent.canceled': {
      const paymentIntent = event.data.object;
      console.debug(`payment_intent.canceled: ${JSON.stringify(paymentIntent)}`);
      try {
        const userID = await getUserIdFromIntent(paymentIntent);
        if (userID === undefined) {
          console.error(`Cannot find user for canceled payment: ${JSON.stringify(paymentIntent)}`);
          return;
        }
        sendIoNotification({
          socketIO: request.app.io,
          userID,
          msgType: notificationType.status.charge.cancelled,
        });
      } catch (e) {
        console.error(`Error in 'payment_intent.canceled': ${e}, paymentIntent: ${JSON.stringify(paymentIntent)}`);
      }
      break;
    }
    default:
      break;
  }
});

module.exports = webhookRouter;
