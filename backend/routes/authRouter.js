/* eslint-disable camelcase */
// Node/Express
const authRouter = require('express').Router(); // eslint-disable-line new-cap
const crypto = require('crypto');
const queryString = require('querystring');
// Saltymotion
const userQuery = require('../lib/db/userQuery');
const authQuery = require('../lib/db/authQuery');
const {generateJwtFromUserID} = require('../lib/auth/token');
const {now} = require('../lib/dateUtility');
const {createTwitterAuthorizationHeader} = require('../lib/auth/oauth');
const cacheQuery = require('../lib/redis/cacheQuery');
// Other libs
const _ = require('underscore');
const fetch = require('node-fetch');
const {extractJWT} = require('../lib/middleware');
const {enforceJWT} = require('../lib/middleware');
const {StatusCodes} = require('http-status-codes');

/**
 * Encode a query string from a dictionary of parameters name to value
 * @param {object} parameters
 * @param {string} [baseURL]
 * @return {string}
 */
function encodeQueryStringFromMap({parameters, baseURL = ''}) {
  let encodedParameters = Object.keys(parameters).reduce((memo, key) => {
    return `${memo}${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}&`;
  }, baseURL);
  encodedParameters = encodedParameters.slice(0, -1);
  return encodedParameters;
}

const isUndefined = (token) => token === undefined;

authRouter.get('/loginWithTwitch', (req, res) => {
  // TODO use nonce and persist it to redis
  // First step: get an auth code
  const url =
      'https://id.twitch.tv/oauth2/authorize' +
      `?client_id=${process.env.TWITCH_OAUTH_ID}` +
      `&redirect_uri=${process.env.SERVER_BASE_ADDRESS}/auth/twitch/redirect` +
      '&response_type=code' +
      '&scope=user:read:email';
  return res.redirect(url);
});

authRouter.get(`/twitch/redirect`, async (req, res) => {
  try {
    const {code} = req.query;
    if (code !== undefined) {
      // Second step: we got the auth code back, exchange for token
      const url =
          'https://id.twitch.tv/oauth2/token' +
          `?client_id=${process.env.TWITCH_OAUTH_ID}` +
          `&code=${code}` +
          `&client_secret=${process.env.TWITCH_OAUTH_SECRET}` +
          '&scope=user:read:email' +
          '&grant_type=authorization_code' +
          `&redirect_uri=${process.env.SERVER_BASE_ADDRESS}/auth/twitch/redirect`;
      const serializeCodedResponse = await fetch(url, {method: 'POST'});
      const codeResponse = await serializeCodedResponse.json();
      const {access_token: token} = codeResponse;
      // TODO verify token
      console.debug('Got Twitch token', token);
      const serializedProfile = await fetch(
          'https://api.twitch.tv/helix/users',
          {headers: {'Authorization': `Bearer ${token}`, 'Client-ID': process.env.TWITCH_OAUTH_ID}},
      );
      const profile = (await serializedProfile.json()).data[0];
      console.debug(profile);

      // We have the profile , check if we know that user or create a blank user
      const {id: twitchID, login: twitchName} = profile;
      const email = profile.email || `${profile.login}@mail.com`; // FIXME...WOW
      const user = await authQuery.findUserFromTwitchAccountID(profile.id);
      let userID;
      if (user === undefined) {
        console.debug(`User with twitchID ${twitchID} not found, creating...`);
        const newID = crypto.randomUUID();
        await userQuery.createOauthUser({userID: newID, nickname: twitchName.toString(), email});
        await authQuery.insertUserTwitchID(newID, twitchID);
        console.debug(`Created user ${newID}`);
        userID = newID;
      } else {
        console.debug(`Logged user ${JSON.stringify(user)} using twitch OAuth`);
        userID = user.ID;
      }
      const jwt = await generateJwtFromUserID({userID});
      res.redirect(`/login?auth=success&jwt=${jwt}`);
    } else {
      res.redirect(`/login?auth=error`);
    }
  } catch (e) {
    console.error(`Error in GET /twitch/redirect: ${e}`);
    res.redirect(`/login?auth=error`);
  }
});

/**
 * First step of login with Twitter oauth
 *   Get a request token
 *   Redirect to auth page with that token
 */
authRouter.get('/loginWithTwitter', async (req, res) => {
  // First step: get a request token
  const url = 'https://api.twitter.com/oauth/request_token';
  const nonce = crypto.randomBytes(16).toString('base64');
  const oauthDictionary = {
    oauth_callback: process.env.SERVER_BASE_ADDRESS + '/auth/twitter/redirect',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: now().toString(),
    oauth_nonce: nonce,
    oauth_consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
    oauth_version: '1.0',
  };
  const authHeader = createTwitterAuthorizationHeader({
    isFirstStage: true,
    method: 'POST',
    url,
    consumerSecret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
    oauthDictionary,
  });
  const requestTokenRawResponse = await fetch(
      url,
      {
        method: 'POST',
        headers: {'Authorization': authHeader},
      },
  );
  const requestTokenRawTextResponse = await requestTokenRawResponse.text();
  const requestTokenResponse = queryString.parse(requestTokenRawTextResponse);
  if (requestTokenResponse.oauth_callback_confirmed !== 'true') { // string type
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  }
  const {oauth_token, oauth_token_secret} = requestTokenResponse;
  try {
    await cacheQuery.storeOauthTokenMetadata({tokenSecret: oauth_token_secret, token: oauth_token, nonce});
  } catch (e) {
    console.error(`Error in loginWithTwitter: ${e}`);
    return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  res.redirect(`https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`);
});

/**
 * Second step of Twitter oauth login
 * Read the token & verifier from redirect query string
 * Read from cache if that matches an existing request
 * Get an access token
 *
 * Thirst step
 * Exchange our oauth for an auth token
 */
authRouter.get(`/twitter/redirect`, async (req, res) => {
  try {
    const {oauth_token, oauth_verifier} = req.query;
    if (oauth_token === undefined || oauth_verifier === undefined) {
      return res.redirect('/login?auth=error');
    }
    const oauthMetadata = await cacheQuery.loadOauthTokenMetadata({token: oauth_token});
    if (oauthMetadata == null) { // We didnt make that request...
      return res.redirect('/login?auth=error');
    }
    const url =
        `https://api.twitter.com/oauth/access_token`;
    const {nonce, secret} = oauthMetadata;
    const oauthDictionary = {
      oauth_consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: now().toString(),
      oauth_token,
      oauth_version: '1.0',
    };
    const authHeader = createTwitterAuthorizationHeader({
      isFirstStage: false,
      method: 'POST',
      url,
      consumerSecret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
      oauthSecret: secret,
      variablePayload: {oauth_verifier, oauth_token},
      oauthDictionary,
    });
    const requestTokenRawResponse = await fetch(
        url + `?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`,
        {
          method: 'POST',
          headers: {'Authorization': authHeader},
          body: `oauth_verifier=${oauth_verifier}`,
        },
    );
    const authTokenRawTextResponse = await requestTokenRawResponse.text();
    const authTokenResponse = queryString.parse(authTokenRawTextResponse);

    // Get user profile
    const {
      oauth_token: userToken,
      oauth_token_secret: userSecret,
      // user_id: twitterID,
      // screen_name: twitterUsername,
    } = authTokenResponse;

    const profileURL = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    oauthDictionary.oauth_token = userToken;
    const profileAuthHeader = createTwitterAuthorizationHeader({
      isFirstStage: false,
      method: 'GET',
      url: profileURL,
      consumerSecret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
      oauthSecret: userSecret,
      variablePayload: {include_email: 'true'},
      oauthDictionary,
    });

    const requestProfileRawResponse = await fetch(
        profileURL + '?include_email=true',
        {
          method: 'GET',
          headers: {'Authorization': profileAuthHeader},
        },
    );
    const profile = await requestProfileRawResponse.json();
    const {id: twitterID, screen_name: nickname} = profile;
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${nickname}@mail.com`;
    const user = await authQuery.findUserFromTwitterID(twitterID);
    let userID;
    if (user === undefined) {
      console.debug(`User with twitterID ${twitterID} not found, creating...`);
      userID = crypto.randomUUID();
      await userQuery.createOauthUser({userID: userID, nickname: nickname.toString(), email});
      await authQuery.insertUserTwitterID(userID, twitterID);
      console.debug(`Created user ${userID}/${nickname} from ${twitterID}`);
    } else {
      console.debug(`Logged user ${user.ID} using twitter OAuth`);
      userID = user.ID;
    }
    const jwt = await generateJwtFromUserID({userID});
    res.redirect(`/login?auth=success&jwt=${jwt}`);
  } catch (e) {
    console.error(`Error in GET /twitter/redirect: ${e}`);
    res.redirect(`/login?auth=error`);
  }
});

/**
 * First step of login with Google oauth2
 * Get an authorization code and save a state/nonce to storage
 */
authRouter.get('/loginWithGoogle', async (req, res) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  const authParameters = {
    client_id: process.env.GOOGLE_OAUTH_ID,
    redirect_uri: `${process.env.SERVER_BASE_ADDRESS}/auth/google/redirect`,
    response_type: 'code',
    scope: 'openid email profile',
    state: nonce, // Funnily enough, they have a nonce parameter...
  };

  const baseURL = 'https://accounts.google.com/o/oauth2/v2/auth?';
  const authURL = encodeQueryStringFromMap({parameters: authParameters, baseURL});

  // Store our nonce to confirm once we get a callback
  try {
    await cacheQuery.storeOauthNonce({nonce});
  } catch (e) {
    console.error(`Error in loginWithGoogle: ${e}`);
    return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return res.redirect(authURL);
});

/**
 * Second step of login with Google Oauth2
 *   Check the state/nonce
 *   Exchange the auth code for a token
 *   Get the payload from the token to read Google user ID
 *   Check if user exists and login or create profile
 */
authRouter.get('/google/redirect', async (req, res) => {
  const {state, code} = req.query;
  if (_.some([code, state], isUndefined)) {
    console.error(`Response from Google didnt contain required elements: ${req.query}`);
    return res.redirect('/login?auth=error');
  }
  await cacheQuery.loadOauthNonce({nonce: state})
  const tokenURL = 'https://oauth2.googleapis.com/token';
  const body = {
    code,
    client_id: process.env.GOOGLE_OAUTH_ID,
    client_secret: process.env.GOOGLE_OAUTH_SECRET,
    redirect_uri: `${process.env.SERVER_BASE_ADDRESS}/auth/google/redirect`,
    grant_type: 'authorization_code',
  };
  try {
    const requestTokenRawResponse = await fetch(
        tokenURL,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
    );
    const requestToken = await requestTokenRawResponse.json();
    if (requestToken === undefined) {
      console.error(`Error in /google/redirect: missing requestToken in response`);
      return res.redirect('/login?auth=error');
    }
    const {id_token: googleJWT} = requestToken;
    const base64Payload = Buffer.from(googleJWT.split('.')[1], 'base64');
    const decodedPayload = JSON.parse(base64Payload.toString('ascii'));
    const {sub: googleID, name: nickname, email} = decodedPayload;
    if (_.some([googleID, nickname], isUndefined)) {
      console.error(`Error in /google/redirect: missing fields in response payload`);
      return res.redirect('/login?auth=error');
    }
    // Check if user exists
    let userID;
    const user = await authQuery.findUserFromGoogleID(googleID);
    if (user === undefined) {
      console.debug(`User with googleID ${googleID} not found, creating...`);
      userID = crypto.randomUUID();
      await userQuery.createOauthUser({userID, nickname: nickname, email});
      await authQuery.insertUserGoogleID(userID, googleID);
      console.debug(`Created user ${userID}/${nickname} from ${googleID}`);
    } else {
      console.debug(`Logged user ${user.ID} using Google OAuth`);
      userID = user.ID;
    }
    const jwt = await generateJwtFromUserID({userID});
    res.redirect(`/login?auth=success&jwt=${jwt}`);
  } catch (e) {
    console.error(`Error in GET /google/redirect: ${e}`);
    res.redirect(`/login?auth=error`);
  }
});

/**
 * First step of login with Stripe
 *   Redirect to authorization server
 */
authRouter.get('/linkStripeAccount', extractJWT, enforceJWT, async (req, res) => {
  const {ID} = req.jwt;
  const baseURL = 'https://connect.stripe.com/oauth/authorize';
  const nonce = crypto.randomBytes(16).toString('base64');
  const authParameters = {
    client_id: process.env.STRIPE_OAUTH_ID,
    redirect_uri: `${process.env.SERVER_BASE_ADDRESS}/auth/stripe/redirect`,
    response_type: 'code',
    scope: 'read',
    state: nonce,
  };
  const authURL = encodeQueryStringFromMap({parameters: authParameters, baseURL});
  try {
    await cacheQuery.storeOauthNonce({nonce, metadata: ID});
  } catch (e) {
    console.error(`Error in loginWithStripe: ${e}`);
    return res.redirect('/profile?linkStripeAccountStatus=error');
  }
  return res.redirect(authURL);
});

authRouter.get('/stripe/redirect', async (req, res) => {
  const {code, scope, state} = req.query;
  if (_.some([code, scope, state], isUndefined)) {
    console.error(`Response from Stripe didnt contain required elements: ${req.query}`);
    return res.redirect('/profile?connectStripeAccount=error');
  }
  const saltyUserID = await cacheQuery.loadOauthNonce({nonce: state});
  if (saltyUserID === '') {
    console.error(`Error in /stripe/redirect: saltyUserID from cache was empty on nonce ${state}`);
    return res.redirect('/profile?linkStripeAccountStatus=error');
  }
  const tokenURL = 'https://connect.stripe.com/oauth/token';
  const body = {
    client_secret: process.env.STRIPE_OAUTH_SECRET,
    code,
    grant_type: 'authorization_code',
  };
  try {
    const requestRawResponse = await fetch(
        tokenURL,
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
    );
    const requestJsonResponse = await requestRawResponse.json();
    const {access_token, stripe_user_id} = requestJsonResponse;
    if (_.some([access_token, stripe_user_id], isUndefined)) {
      console.error(`Error in /stripe/redirect: missing tokens in response ${JSON.stringify(requestJsonResponse)}`);
      return res.redirect('/profile?linkStripeAccountStatus=error');
    }
    // TODO
    // const {stripe_user_id: stripeAccountID} = stripe_properties;
    // try {
    //   if (req.isAuthenticated() && req.user && !isNaN(req.user.ID)) {
    //     await userQuery.setStripeAccountID(req.user.ID, stripeAccountID);
    //     console.debug(`Set user ${req.user.ID} Stripe account ${stripeAccountID}`);
    //     done(null, req.user, {variant: 'connect'});
    //   } else {
    //     done(new Error(`Connect error for stripe OAuth ID : ${stripeAccountID}`));
    //   }
    // } catch (err) {
    //   console.error(`Error in stripe strategy: ${err}`);
    //   done(err);
    // }
    console.log(requestJsonResponse);
    return res.redirect('/profile?linkStripeAccountStatus=ok&ID=PUT_THE_STRIPE_ACCOUNT_ID_HERE');
  } catch (e) {
    console.error(`Error in /stripe/redirect: ${e}`);
    return res.redirect('/profile?linkStripeAccountStatus=error');
  }
});

/**
 * Login/Password based authentication
 */
authRouter.post('/login', async (req, res) => {
  const {username, password} = req.body;
  if (username === undefined || password === undefined) {
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  }
  const userQueryParam = userQuery
      .buildUserQueryParameter()
      .setFullName(username)
      .setKeepPrivateFields(true)
      .setSnsAccountsSelected(false)
      .setGetLanguageFields(false);
  try {
    const [user] = await userQuery.selectUser(userQueryParam);
    if (!user) {
      console.error(`No profile found for user ${username}`);
      return res.sendStatus(StatusCodes.UNAUTHORIZED);
    } else if (user.accountStatusID === 0) {
      console.error('User did not validate his email address');
      return res.sendStatus(StatusCodes.UNAUTHORIZED);
    } else if (user.accountStatusID !== 1) {
      console.error('User account has been disabled');
      return res.sendStatus(StatusCodes.UNAUTHORIZED);
    } else {
      const storedPass = user.password;
      const match = await bcrypt.compare(password, storedPass);
      if (!match) {
        console.error(`Password does not match for user ${username}`);
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
      } else {
        const jwt = await generateJwtFromUserID({userID: user.ID});
        return res.json(jwt);
      }
    }
  } catch (err) {
    console.error(`Error in local strategy: ${err}`);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

module.exports = authRouter;
