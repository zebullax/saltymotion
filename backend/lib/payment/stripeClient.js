/**
 * Stripe API object using our key
 * @type {Stripe}
 */
const stripeClient = require('stripe')(process.env.STRIPE_OAUTH_SECRET);

module.exports.stripeClient = stripeClient;
