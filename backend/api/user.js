// Node/Express
const path = require('path');
// eslint-disable-next-line new-cap
const userApiRouter = require('express').Router();
// Misc
const multer = require('multer');
const { body, validationResult, query } = require('express-validator');
const uuid = require('uuid-v4');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
// Saltymotion
const reviewerQuery = require('../lib/db/reviewerQuery');
const reviewerFollowQuery = require('../lib/db/reviewerFollowerQuery');
const gameFollowerQuery = require('../lib/db/gameFollowerQuery');
const gameQuery = require('../lib/db/gameQuery');
const queryWrangling = require('../lib/queryWrangling');
const queryCache = require('../lib/redis/cacheQuery');
const { RedisHashKey } = require('../lib/redis/cacheModel');
const socketUtil = require('../lib/websocket/websocketUtility');
const { notificationType } = require('../lib/notificationReference');
const {
  MINIMUM_PASSWORD_LENGTH,
  SALT_ROUNDS,
} = require('../lib/applicationSettings');
const { buildAtelierReviewStat } = require('../lib/statistics');
const s3Util = require('../lib/staticStorage/s3Util');
const userQuery = require('../lib/db/userQuery');
const authQuery = require('../lib/db/authQuery');
const { enforceJWT, checkIsUserIDSelf } = require('../lib/middleware');
const mailer = require('../lib/mail/mailer');
const notificationQuery = require('../lib/db/notificationQuery');
const dataLayer = require('../lib/datalayer/dataLayer');
const { generateJwtFromUserID } = require('../lib/auth/token');
const { userWrangler } = require('../lib/datawrangling/user');

const WEBSITE_ROOT_FOLDER = path.normalize(path.join(__dirname, '..'));
const UPLOAD_FOLDER = path.normalize(path.join(WEBSITE_ROOT_FOLDER, process.env.ATELIER_UPLOAD_PATH));
const ACCOUNT_ACTIVE_STATUS_ID = 1; // TODO Import from a reference file

const appLogger = require('../lib/log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

const handlerApiRoute = {
  /**
   * Get recommended items for a user
   * @async
   * @param {object} req
   * @param {number} req.jwt.ID
   * @param {number} req.query.gameRecommendationOffset
   * @param {number} req.query.gameRecommendationLimit
   * @param {number} req.query.reviewerRecommendationOffset
   * @param {number} req.query.reviewerRecommendationLimit
   * @param {object} res
   * @return {Promise<{reviewers: [Reviewer], games: [Game], reviews: [NormalizedAtelierDescription]}>}
   */
  async getUserRecommendations(req, res) {
    const MAX_SHOWCASE_REVIEWER = 10;
    const MAX_SHOWCASE_GAME = 10;
    const userID = req.jwt.ID;
    const gameOffset = req.query.gameRecommendationOffset;
    const gameLimit = req.query.gameRecommendationLimit;
    const reviewerOffset = req.query.reviewerRecommendationOffset;
    const reviewerLimit = req.query.reviewerRecommendationLimit;

    try {
      const reviews = await userWrangler.getFeedReviews({
        userID,
        isSelf: true,
        gamesRecommendationSlice: { offset: gameOffset, limit: gameLimit },
        reviewersRecommendationSlice: { offset: reviewerOffset, limit: reviewerLimit },
      });
      // FIXME this is not personalized...
      // Get random samples of games and reviews
      const rawReviewers = await reviewerQuery.selectReviewersSample({ sampleSize: MAX_SHOWCASE_REVIEWER });
      const reviewers = await queryWrangling.normalizeReviewer(false, rawReviewers, true);
      const games = await gameQuery.selectGamesSample({ sampleSize: MAX_SHOWCASE_GAME });
      res.json({
        reviewers,
        games,
        reviews,
      });
    } catch (e) {
      appLogger.error(`Error in getUserRecommendation: ${e}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Authenticate a user based on name/password
   * If successful, we ll return a JWT for further query
   * @param {Object} req
   * @param {Object} res
   * @return {Promise<*>}
   */
  async authenticateUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on loginUser: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Error validating credentials' });
    }
    const { username, password } = req.body;
    try {
      const { password: storedPass, ID } = await authQuery.selectUserPasswordFromUsername({ username });
      if (ID === undefined) {
        appLogger.debug(`No user found with the name ${username}`);
        return res.status(StatusCodes.BAD_REQUEST).json({ err: 'User not found' });
      }
      const match = await bcrypt.compare(password, storedPass);
      if (!match) {
        appLogger.debug(`Password does not match for user ${username}`);
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: 'Passwords dont match' });
      }
      const jwt = await generateJwtFromUserID({ userID: ID });
      return res.json({ token: jwt });
    } catch (e) {
      appLogger.error(`Error in authenticateUser: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async addOrDeleteUserFavoriteGame(req, res, isDelete) {
    const { ID } = req.jwt;
    const gameID = Number.parseInt(req.params.gameID, 10);
    if (Number.isNaN(gameID)) {
      return res.sendStatus(StatusCodes.BAD_REQUEST);
    }
    try {
      if (!isDelete) {
        // Adding to followed games
        await gameFollowerQuery.addToFavoriteGames(ID, gameID);
      } else {
        // Remove from followed games
        await gameFollowerQuery.removeFromFavoriteGames(ID, gameID);
      }
      // Remove profile from cache as it's dirty
      await queryCache.deleteKey({
        keyType: RedisHashKey.userProfile,
        ID,
      });
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      appLogger.error(`Error in addOrDeleteUserFavoriteGame: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Add/Delete a reviewer in the pool of a user favorites
   * @async
   * @param {object} req
   * @param {object} res
   * @param {boolean} isDelete
   * @return {Promise<void>}
   */
  async addOrDeleteUserFavoriteReviewer(req, res, isDelete) {
    const { ID } = req.jwt;
    const { reviewerID } = req.params;
    if (ID === reviewerID) {
      // You can't add/delete yourself as your own favorite
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    try {
      if (!isDelete) {
        const isInsertSuccessful = await reviewerFollowQuery.insertUserFavorite(ID, reviewerID);
        if (!isInsertSuccessful) {
          appLogger.error('Error in addOrDeleteUserFavoriteReviewer: failure during insert');
          return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
      } else {
        const isDeleteSuccessful = await reviewerFollowQuery.removeUserFavorite(ID, reviewerID);
        if (!isDeleteSuccessful) {
          appLogger.error('Error in addOrDeleteUserFavoriteReviewer: failure during delete');
          return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
      const userDataLayer = dataLayer.user({ userID: ID });
      const updatedUserProfile = await userDataLayer.get();
      socketUtil.sendIoNotification({
        socketIO: req.app.io,
        userID: ID,
        msgType: notificationType.status.user.updateProfile.complete,
        payload: updatedUserProfile,
      });
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      appLogger.error(e);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  async getUserAtelierStatistics(req, res) {
    const { userID } = req.params;
    try {
      const stat = await buildAtelierReviewStat(userID, true);
      return res.send(stat);
    } catch (e) {
      appLogger.error(`Error in getUserAtelierStatistics: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const parseIfDefined = (field) => (field !== undefined ? JSON.parse(field) : undefined);

      const userID = req.jwt.ID;
      const {
        selfIntroduction,
        email,
        countryCode,
        languages,
        timezone,
        snsAccounts,
        notificationPreference,
        currentPassword,
        newPassword,
        gamePool,
      } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }

      if (req.file !== undefined) {
        const s3Err = await s3Util.uploadUserProfilePictureFile(req.file.path, userID.toString());
        if (s3Err !== undefined) {
          appLogger.error(`Error while uploading profile picture ${req.file.path} to S3 as ${userID.toString()}`);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ err: 'Error while updating user profile, picture upload failed' });
        }
      }
      const userDataLayer = dataLayer.user({ userID });
      await userDataLayer.update({
        selfIntroduction,
        email,
        countryCode,
        languages: parseIfDefined(languages),
        timezone,
        snsAccounts: parseIfDefined(snsAccounts),
        currentPassword,
        newPassword,
        gamePool: parseIfDefined(gamePool),
        notificationPreference: parseIfDefined(notificationPreference),
      });
      return res.json(await userDataLayer.get());
    } catch (err) {
      appLogger.error(`Error in updateUserProfile: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Build user profile
   * @param {object} req
   * @param {object} res
   * @return {Promise<UserProfile>}
   */
  getUser: async (req, res) => {
    const { userID } = req.params;
    const isPublicProfile = req.jwt?.ID === undefined || userID !== req.jwt.ID;
    try {
      const userLayer = dataLayer.user({ userID });
      const fullProfile = await userLayer.get();
      res.json(isPublicProfile ? userWrangler.cleanPrivateInfo(fullProfile) : fullProfile);
    } catch (e) {
      appLogger.error(`Error in getUser: ${e}`);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Register a new user
   * Create the record for user and its secret in DB, send the account confirmation email with that secret
   * @param {object} req
   * @param {object} res
   * @return {Promise<void>}
   */
  async signupUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on postSignup: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Error validating form' });
    }
    const {
      username, password, timezone, email, countryCode,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      const userID = uuid();
      await userQuery.createUser({
        userID,
        nickname: username,
        password: hashedPassword,
        email,
        timezone,
        countryCode,
      });
      appLogger.debug(`New user created ${userID}`);
      const secret = await userQuery.createUserAccountConfirmationSecret(userID);
      await mailer.sendSignUpConfirmationEmail({
        address: email.toString(),
        nickname: username.toString(),
        userID,
        secret: secret.toString(),
      });
      appLogger.debug(`Sent email to user ${userID} with secret token ${secret}`);
      return res.status(StatusCodes.OK).json({ msg: 'Confirmation email was sent' });
    } catch (e) {
      appLogger.error(`Error in signupUser: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Load user's own notifications
   * @param {object} req
   * @param {object} res
   * @return {Promise<*>}
   */
  loadUserNotification: async (req, res) => {
    const userID = req.jwt.ID;
    const { startFrom } = req.query;
    const { status } = req.query;
    const limit = parseInt(req.query.limit, 10);

    // Short fuse if user check unread notifications nb
    if (status === 'ACTIVE') {
      try {
        const nbActiveNotifications = await notificationQuery.selectNbUnreadNotifications({ userID });
        return res.json({ count: nbActiveNotifications });
      } catch (e) {
        appLogger.error(`Error in loadUserNotification, user ${userID}: ${e}`);
        return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
    const notificationQueryFilter = notificationQuery.buildNotificationQueryParameter()
      .setStartFrom(startFrom)
      .setTargetUserID(userID)
      .setIsActiveOnly(false);
    try {
      const rawNotification = await notificationQuery.selectNotification(notificationQueryFilter, limit);
      if (rawNotification.length === 0) {
        return res.json([]);
      }
      const normalizedNotification = queryWrangling.normalizeActivityDescription(rawNotification);
      const activityIdToMarkRead = rawNotification.map((item) => item.activityID);
      if (await notificationQuery.markNotificationObserved(activityIdToMarkRead) !== undefined) {
        appLogger.error('Error in loadNotification while marking activity read');
      }
      return res.json(normalizedNotification);
    } catch (err) {
      appLogger.error(`Error in loadUserNotification, user ${userID}: ${err}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Update a user password using a secret token to confirm his identity
   * Usually as last step in reset password flow
   * @async
   * @param {object} req
   * @param {object} res
   * @return {Promise<this>}
   */
  updateUserPasswordWithSecretToken: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on updateUserPasswordWithSecretToken: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Error validating form' });
    }
    const { newPassword, secret } = req.body;
    try {
      const userID = await userQuery.selectUserIDFromResetPasswordToken(secret);
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await authQuery.updateUserPassword(hashedPassword, userID);
      await userQuery.deletePasswordResetTempLink(userID);
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      appLogger.error(`Error in updateUserPasswordWithSecretToken: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  /**
   * Create a password reset secret link based on the username and registered email
   * @param {object} req
   * @param {object} res
   * @return {Promise<this>}
   */
  createResetPasswordSecret: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      appLogger.error(`Errors on createResetPasswordSecret: ${JSON.stringify(errors.mapped())}`);
      return res.status(StatusCodes.BAD_REQUEST).json({ err: 'Error validating form' });
    }

    const { email: requestEmail, username } = req.body;
    try {
      const result = await userQuery.selectUserEmailAndID(username);
      if (!result) {
        return res.status(StatusCodes.BAD_REQUEST).json({ err: 'No user with that username found' });
      }
      const { ID, email: accountEmail } = result;
      if (requestEmail !== accountEmail) {
        appLogger.error(`Error in createResetPasswordSecret: ${username} Email does not match`);
        return res.status(StatusCodes.FORBIDDEN).json({ err: 'User and email don\'t match' });
      }
      const secret = await userQuery.createPasswordResetTempLink(ID);
      await mailer.sendResetPasswordEmail({ address: requestEmail, nickname: username, secret });
      return res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      appLogger.error(`Error in createResetPasswordSecret: ${e}`);
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  confirmAccount: async (req, res) => {
    const { ID, token } = req.params;
    if (ID === undefined || token === undefined) {
      appLogger.error('Missing parameters for account validation');
      return res.redirect('/login?signup=PARAM_ERROR');
    }
    let expirationTimestamp;
    try {
      expirationTimestamp = await userQuery.selectSecretExpirationForUser({ userID: ID, secret: token });
    } catch (err) {
      appLogger.error(`Error in confirm account: ${err}`);
      return res.redirect('/login?signup=NO_LINK_ERROR');
    }
    if (expirationTimestamp > Date.now()) {
      return res.redirect('/login?signup=EXPIRED_LINK_ERROR');
    }
    await userQuery.updateUserAccountStatus({
      userID: ID,
      accountStatusID: ACCOUNT_ACTIVE_STATUS_ID,
    });
    return res.redirect('/login?signup=SUCCESS');
  },
};

userApiRouter.get(
  '/users/:userID',
  (req, res) => handlerApiRoute.getUser(req, res),
);

userApiRouter.get(
  '/users/:userID/atelierStatistics',
  (req, res) => handlerApiRoute.getUserAtelierStatistics(req, res),
);

userApiRouter.get(
  '/users/:userID/notifications',
  enforceJWT,
  checkIsUserIDSelf,
  query('limit').exists().isInt({ min: 1, max: 25 }),
  query('startFrom').isISO8601(),
  query('status').isIn(['ACTIVE', 'ALL']),
  handlerApiRoute.loadUserNotification,
);

userApiRouter.post(
  '/users/:userID/favoriteReviewers/:reviewerID',
  enforceJWT,
  checkIsUserIDSelf,
  (req, res) => handlerApiRoute.addOrDeleteUserFavoriteReviewer(req, res, false),
);

userApiRouter.post(
  '/users/auth',
  body('password').exists().isString().trim()
    .isLength({ min: 8 }),
  body('username').exists().isString().trim()
    .isLength({ min: 8, max: 25 }),
  (req, res) => handlerApiRoute.authenticateUser(req, res),
);

userApiRouter.delete(
  '/users/:userID/favoriteReviewers/:reviewerID',
  enforceJWT,
  checkIsUserIDSelf,
  (req, res) => handlerApiRoute.addOrDeleteUserFavoriteReviewer(req, res, true),
);// eslint-disable-line max-len

userApiRouter.post(
  '/users/:userID/favoriteGames/:gameID',
  enforceJWT,
  checkIsUserIDSelf,
  (req, res) => handlerApiRoute.addOrDeleteUserFavoriteGame(req, res, false),
); // eslint-disable-line max-len

userApiRouter.delete(
  '/users/:userID/favoriteGames/:gameID',
  enforceJWT,
  checkIsUserIDSelf,
  (req, res) => handlerApiRoute.addOrDeleteUserFavoriteGame(req, res, true),
);// eslint-disable-line max-len

userApiRouter.get(
  '/users/:userID/feed',
  enforceJWT,
  checkIsUserIDSelf,
  handlerApiRoute.getUserRecommendations,
);

userApiRouter.patch(
  '/users/:userID',
  enforceJWT,
  checkIsUserIDSelf,
  multer({
    dest: UPLOAD_FOLDER,
    limits: { fieldSize: 5 * 1024 },
  }).single('picture'),
  body('email').optional().isEmail().normalizeEmail(),
  body('countryCode').optional().isString().trim(),
  body('timezone').optional().isString().trim(),
  body('currentPassword').optional().isString().trim()
    .isLength({ min: 8 }),
  body('newPassword').optional().isString().trim()
    .isLength({ min: 8 }),
  handlerApiRoute.updateUserProfile,
);

userApiRouter.post(
  '/users/resetPasswordLink',
  body('email').normalizeEmail().isEmail(),
  body('username').exists().isString().trim()
    .isLength({ min: 3, max: 25 }),
  handlerApiRoute.createResetPasswordSecret,
);

userApiRouter.post(
  '/users/resetPassword',
  body('newPassword').exists().isString().trim()
    .isLength({ min: MINIMUM_PASSWORD_LENGTH }),
  body('secret').exists().isString().isLength({ min: 36, max: 36 }),
  (req, res) => handlerApiRoute.updateUserPasswordWithSecretToken(req, res),
);

userApiRouter.post(
  '/users',
  body('password').exists().isString().trim()
    .isLength({ min: 8 }),
  body('username').exists().isString().trim()
    .isLength({ min: 3, max: 25 }),
  body('timezone').exists().isString().trim(),
  body('countryCode').exists().isString().trim(),
  body('email').normalizeEmail().isEmail(),
  handlerApiRoute.signupUser,
);

userApiRouter.get(
  '/users/:ID/verify/:token',
  handlerApiRoute.confirmAccount,
);

module.exports = userApiRouter;
