// Node/Express
const path = require('path');
// Misc
const bcrypt = require('bcryptjs');
// Saltymotion
const userQuery = require('../../db/userQuery');
const authQuery = require('../../db/authQuery');
const { SALT_ROUNDS } = require('../../applicationSettings');
const snsQuery = require('../../db/snsQuery');
const { deleteKey } = require('../../redis/cacheQuery');
const { RedisHashKey } = require('../../redis/cacheModel');
const { buildUserProfile } = require('./utility');
const { updateReviewerGamePool } = require('../../db/reviewerQuery');

const appLogger = require('../../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Update the user password
 * @param {string} userID
 * @param {string} newPassword
 * @param {string} currentPassword
 * @return {Promise<boolean>} Return true if the update was successful, false otherwise
 */
async function updatePassword({ userID, newPassword, currentPassword }) {
  const isOauth = await authQuery.isUserOauthOnly(userID);
  if (!isOauth) {
    const { password: storedPassword } = await authQuery.selectUserPasswordFromUserID(userID);
    const match = await bcrypt.compare(currentPassword, storedPassword);
    if (!match) {
      appLogger.error('Error in updateUserProfile: Password dont match');
      return false;
    }
  }
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await authQuery.updateUserPassword(hashedPassword, userID);
  return true;
}

/**
 * User profile data access layer
 * @param {string} userID
 * @return {{get: (function(): *), update: ((function({email?: string, countryCode?: string, languages?: Language[],
 * timezone?: string, snsAccounts?: SnsAccounts, notificationPreference?: Object, currentPassword?: string,
 * newPassword?: string, selfIntroduction?: string, gamePool?: Game[]}): Promise<Error|Undefined>)|*)}}
 */
function user({ userID }) {
  let instance;
  const fetchUser = async ({ forceCacheReload }) => {
    if (instance !== undefined && !forceCacheReload) return;
    instance = await buildUserProfile({ userID, forceReload: forceCacheReload });
  };

  return {
    /**
     * Return the user profile
     * @return {Promise<UserProfile>}
     */
    get: async () => {
      await fetchUser({ forceCacheReload: false });
      return instance;
    },

    /**
     * Update a user profile
     * @param {string} [email]
     * @param {string} [countryCode]
     * @param {Language[]} [languages]
     * @param {string} [timezone]
     * @param {SnsAccounts} [snsAccounts]
     * @param {Object} [notificationPreference]
     * @param {string} [currentPassword]
     * @param {string} [newPassword]
     * @param {string} [selfIntroduction]
     * @param {{ID: number, minimumBounty: number}[]} [gamePool]
     * @return {Promise<Error|Undefined>}
     */
    update: async ({
      email,
      countryCode,
      languages,
      timezone,
      snsAccounts,
      notificationPreference,
      currentPassword,
      newPassword,
      selfIntroduction,
      gamePool,
    }) => {
      try {
        if (newPassword !== undefined && !await updatePassword({ userID, newPassword, currentPassword })) {
          return new Error('Error while updating password');
        }

        if (languages !== undefined) {
          await userQuery.updateUserLanguage({ userID, languages });
        }

        await userQuery.updateUser({
          userID,
          email,
          selfIntroduction,
          countryCode,
          timezone,
        });

        if (notificationPreference) {
          await userQuery.updateUserNotificationPreference({
            userID,
            notificationPreference,
          });
        }
        if (snsAccounts !== undefined) {
          await snsQuery.saveSnsAccounts({
            userID,
            youtubeName: snsAccounts.youtubeName,
            twitterName: snsAccounts.twitterName,
            twitchName: snsAccounts.twitchName,
          });
        }
        if (gamePool !== undefined) {
          await updateReviewerGamePool({ userID, gamePool });
        }
        // Invalidate cache
        await deleteKey({ keyType: RedisHashKey.userProfile, ID: userID });
        return undefined;
      } catch (err) {
        appLogger.error(`Error in updateUserProfile: ${err}`);
        return err;
      }
    },
  };
}

module.exports = user;
