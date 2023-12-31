const {stripeClient} = require('./stripeClient.js');


// Hardcoded to 1000jpy = 1000 chips at the moment
const DEFAULT_CHARGE_VALUE = 1000;
const DEFAULT_CHARGE_CURRENCY = 'JPY';
module.exports.DEFAULT_CHARGE_VALUE = DEFAULT_CHARGE_VALUE;
module.exports.DEFAULT_CHARGE_CURRENCY = DEFAULT_CHARGE_CURRENCY;

/**
 * Build and return a charge description object
 * @return {ChargeDescription}
 */
module.exports.buildChargeDescription = () => ({
  name: undefined,
  setName(name) {
    this.name = name;
    return this;
  },
  customerID: undefined,
  setCustomerID(customerID) {
    this.customerID = customerID;
    return this;
  },
  saltymotionUserID: undefined,
  setSaltymotionUserID(userID) {
    this.saltymotionUserID = userID;
    return this;
  },
  saltymotionUserEmail: undefined,
  setSaltymotionEmail(email) {
    this.saltymotionUserEmail = email;
    return this;
  },
  description: undefined,
  setDescription(description) {
    this.description = description;
    return this;
  },
  imageURL: undefined,
  setImageURL(URL) {
    this.imageURL = URL;
    return this;
  },
  amount: undefined,
  setAmount(amount) {
    this.amount = amount;
    return this;
  },
  currency: DEFAULT_CHARGE_CURRENCY,
  setCurrency(currency) {
    this.currency = currency;
    return this;
  },
  qty: DEFAULT_CHARGE_VALUE,
  setQty(qty) {
    this.qty = qty;
    return this;
  },
  redirectURL: {
    success: undefined,
    cancel: undefined,
  },
  setRedirectURL(redirectURL) {
    this.redirectURL.success = redirectURL.success;
    this.redirectURL.cancel = redirectURL.cancel;
    return this;
  },
});

/**
 * Create and return a stripe session ID from a charge description object
 * @param {ChargeDescription} chargeDescription
 * @return {Promise<undefined|string>}
 */
module.exports.createCheckoutSession = async (chargeDescription) => {
  /* eslint-disable camelcase */
  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        name: chargeDescription.name,
        description: chargeDescription.description,
        images: [chargeDescription.imageURL],
        amount: chargeDescription.amount,
        currency: chargeDescription.currency,
        quantity: chargeDescription.qty,
      }],
      customer: chargeDescription.customerID,
      client_reference_id: chargeDescription.saltymotionUserID,
      success_url: chargeDescription.redirectURL.success,
      cancel_url: chargeDescription.redirectURL.cancel,
    });
    return session.id;
  } catch (err) {
    console.error(`Error in createSessionIdFromChargeDescription: ${err}`);
    return undefined;
  }
  /* eslint-enable camelcase */
};
