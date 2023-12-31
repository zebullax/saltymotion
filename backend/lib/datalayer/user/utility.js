// Node/Express
const path = require('path');
// Saltymotion
const userQuery = require('../../db/userQuery');
const redisCache = require('../../redis/cacheQuery');
const { RedisHashKey } = require('../../redis/cacheModel');
const gameFollowerQuery = require('../../db/gameFollowerQuery');
const authQuery = require('../../db/authQuery');
const reviewerQuery = require('../../db/reviewerQuery');
const reviewerFollowerQuery = require('../../db/reviewerFollowerQuery');
const notificationQuery = require('../../db/notificationQuery');
const { selectTagFromReviewerId } = require('../../db/tagQuery');
const appLogger = require('../../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Create a normalized user profile from sub properties
 * @param {any} userProfile
 * @param {{ID: string, name: string}[]} favoriteReviewers
 * @param {Game[]} favoriteGames
 * @param {boolean} isOauthOnly
 * @param {number} nbNotification
 * @param {ReviewerGame[]} gamePool
 * @param {Tag[]} tags
 * @return {Promise<{UserProfile}>}
 */
async function normalizeUserProfile({
  userProfile,
  favoriteReviewers,
  favoriteGames,
  isOauthOnly,
  nbNotification,
  gamePool,
  tags,
}) {
  return {
    ID: userProfile.ID,
    name: userProfile.nickname,
    countryCode: userProfile.countryCode,
    timezone: userProfile.timezone,
    isOauth: isOauthOnly,
    nbUnreadNotification: nbNotification,
    registrationDate: userProfile.registrationDate,
    email: userProfile.email,
    selfIntroduction: userProfile.selfIntroduction || '',
    nbReview: userProfile.nbReview,
    nbAtelier: userProfile.nbAtelier,
    languages: userProfile.languages || [],
    wallet: {
      redeemableCoin: userProfile.redeemableCoin ?? 0,
      freeCoin: userProfile.freeCoin ?? 0,
      frozenCoin: userProfile.frozenCoin ?? 0,
    },
    reviewerScore: userProfile.reviewerScore,
    favoriteReviewers,
    favoriteGames,
    gamePool: gamePool ?? [],
    snsAccounts: userProfile.snsAccounts,
    isStripeAccountLinked: userProfile.stripeAccountID != null, // use for transfer
    stripeCustomerID: userProfile.stripeCustomerID, // user for charge
    notificationPreference: {
      isNotifyOnReviewOpportunity: Boolean(userProfile.isNotifyOnReviewOpportunity),
      isNotifyOnReviewComplete: Boolean(userProfile.isNotifyOnReviewComplete),
      isNotifyOnNewComment: Boolean(userProfile.isNotifyOnNewComment),
      isNotifyOnFavoriteActivity: Boolean(userProfile.isNotifyOnFavoriteActivity),
    },
    tags: tags == null ? [] : tags,
  };
}

/**
 * Load and build a normalized user profile
 * @async
 * @param {string} userID
 * @param {boolean} [forceReload = true] - Whether to force reloading from DB
 * @return {UserProfile}
 */
async function buildUserProfile({ userID, forceReload = false }) {
  if (!forceReload) {
    try {
      const profile = await redisCache.loadKeyValueFromFieldID(RedisHashKey.userProfile, userID);
      if (profile != null) {
        appLogger.debug(`Cache hit on user ${userID}`);
        return profile;
      }
      appLogger.debug(`Cache miss on user ${userID}`);
    } catch (e) {
      appLogger.debug(`Error in buildUserProfile, user ${userID}: ${e}`);
    }
  }

  const queryParam = userQuery
    .buildUserQueryParameter()
    .setUserID(userID)
    .setKeepPrivateFields(true)
    .setSnsAccountsSelected(true)
    .setGetLanguageFields(true);
  const [userProfile] = await userQuery.selectUser(queryParam);
  if (userProfile === undefined) {
    return undefined;
  }

  // Collect favorite games and reviewers
  const favoriteReviewers = await reviewerFollowerQuery.selectUserFavorite({ userID });
  const favoriteGames = await gameFollowerQuery.selectFavoriteGames(userID);
  // If user is also a reviewer grab game pool and tags
  const gamePool = await reviewerQuery.selectGamePool({ reviewerID: userID });
  const tags = await selectTagFromReviewerId({ reviewerID: userID });
  const notificationQueryParam = notificationQuery.buildNotificationQueryParameter()
    .setIsCountOnly(true)
    .setIsActiveOnly(true)
    .setTargetUserID(userProfile.ID);
  const { nbNotification } = await notificationQuery.selectNotification(notificationQueryParam);

  const isOauthOnly = await authQuery.isUserOauthOnly(userID);
  const normalizedProfile = await normalizeUserProfile({
    userProfile,
    favoriteReviewers,
    favoriteGames,
    isOauthOnly,
    nbNotification,
    gamePool,
    tags,
  });
  appLogger.debug(`Flushing user ${userID} profile to cache`);
  redisCache.storeKeyValueFromFieldID(RedisHashKey.userProfile, normalizedProfile);
  return normalizedProfile;
}

module.exports.buildUserProfile = buildUserProfile;
