/* eslint-disable camelcase */
const crypto = require('crypto');

/**
 * Create the signature required for Twitter query
 * @param {string} method
 * @param {string} url
 * @param {object} queryDictionary
 * @param {string} consumerSecret
 * @param {string} [oauthSecret]
 * @return {string}
 */
function createTwitterRequestSignature({
  method,
  url,
  queryDictionary,
  consumerSecret,
  oauthSecret,
}) {
  // Encode
  const encodedDictionary = {};
  Object.keys(queryDictionary).forEach((key) => {
    encodedDictionary[encodeURIComponent(key)] = encodeURIComponent(queryDictionary[key]);
  });
  // Sort and stringify
  let parameterString = '';
  Object.keys(encodedDictionary).sort().forEach((orderedKey) => {
    parameterString += `${orderedKey}=${encodedDictionary[orderedKey]}&`;
  });
  parameterString = parameterString.slice(0, -1);
  const signatureBaseString =
      `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(parameterString)}`;
  // Hash the encoded payload
  const signingKey =
      `${encodeURIComponent(consumerSecret)}&${oauthSecret !== undefined ? encodeURIComponent(oauthSecret): ''}`;
  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.update(signatureBaseString);
  return hmac.digest('base64');
}

/**
 * Create the oauth authorization header expected by Twitter when creating request token
 * @param {boolean} isFirstStage - Whether we are in the first stage of auth, in that case a callback URL is expected
 * @param {string} method
 * @param {string} url
 * @param {object} oauthDictionary
 * @param {string} [oauthDictionary.oauth_callback]
 * @param {string} oauthDictionary.oauth_consumer_key
 * @param {string} oauthDictionary.oauth_signature_method
 * @param {string} [oauthDictionary.oauth_token]
 * @param {string} oauthDictionary.oauth_timestamp
 * @param {string} oauthDictionary.oauth_nonce
 * @param {string} oauthDictionary.oauth_version
 * @param {object} [variablePayload]
 * @param {string} consumerSecret
 * @param {string} [oauthSecret]
 * @return {string}
 */
function createTwitterAuthorizationHeader({
  isFirstStage,
  method,
  url,
  oauthDictionary,
  variablePayload,
  consumerSecret,
  oauthSecret,
}) {
  let queryDictionary = oauthDictionary;
  if (typeof variablePayload === 'object' && Object.keys(variablePayload).length !== 0) {
    queryDictionary = {...queryDictionary, ...variablePayload};
  }
  // eslint-disable-next-line no-unused-vars
  const signature = createTwitterRequestSignature({
    method,
    url,
    queryDictionary,
    consumerSecret,
    oauthSecret,
  });
  return 'OAuth ' +
      `${isFirstStage ? `oauth_callback="${encodeURIComponent(queryDictionary.oauth_callback)}", `: ''}` +
      `oauth_consumer_key="${queryDictionary.oauth_consumer_key}", ` +
      `oauth_nonce="${encodeURIComponent(queryDictionary.oauth_nonce)}", ` +
      `oauth_signature="${encodeURIComponent(signature)}", ` +
      `oauth_signature_method="${queryDictionary.oauth_signature_method}", ` +
      `${!isFirstStage ? `oauth_token="${encodeURIComponent(queryDictionary.oauth_token)}", `: ''}` +
      `oauth_timestamp="${queryDictionary.oauth_timestamp}", ` +
      `oauth_version="${queryDictionary.oauth_version}"`;
}

module.exports = {createTwitterAuthorizationHeader};
