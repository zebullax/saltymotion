// Node/Express
const path = require('path');
// Saltymotion
const {
  buildRedisLookupKey,
  RedisHashKey,
  REDIS_STABLE_SCHEMA_VERSION,
} = require('./cacheModel');
const { client } = require('./client');

const appLogger = require('../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Save an object using its ID property as fields label, typically user or reviewer profile
 * @param {string} keyType
 * @param {any} value
 * @param {number|string} value.ID
 * @param {string} schemaVersion
 */
module.exports.storeKeyValueFromFieldID = (keyType, value, schemaVersion = REDIS_STABLE_SCHEMA_VERSION) => {
  const redisKey = buildRedisLookupKey({ cacheKey: keyType, schemaVersion });
  const field = value.ID.toString();
  client.hset(redisKey, field, JSON.stringify(value), (err) => {
    if (err) {
      appLogger.error(`Error in storeKeyValueFromFieldID: ${err}`);
    }
  });
};

/**
 * Load a user profile from cache
 * @param {string} keyType - Should be from cacheModel.RedisHashKey
 * @param {string} ID - uniqueID to fetch under that key category
 * @param {string} [schemaVersion = RedisSchemaVersion.v1]
 * @return {Promise<UserProfile|Error|null>}
 */
module.exports.loadKeyValueFromFieldID = (keyType, ID, schemaVersion = REDIS_STABLE_SCHEMA_VERSION) => {
  const redisKey = buildRedisLookupKey({ cacheKey: keyType, schemaVersion });
  return new Promise((resolve, reject) => {
    client.hget(redisKey, ID.toString(), (err, res) => {
      if (err) {
        appLogger.error(`Error in getUserProfile: ${err}`);
        return reject(err);
      }
      return resolve(JSON.parse(res));
    });
  });
};

/**
 * Delete a field from a key
 * @param {string} keyType - Should be from cacheModel.RedisHashKey
 * @param {string} ID
 * @param {string} [schemaVersion = RedisSchemaVersion.v1]
 * @return {Promise<bool|Error>}
 */
module.exports.deleteKey = ({
  keyType,
  ID,
  schemaVersion = REDIS_STABLE_SCHEMA_VERSION,
}) => {
  const redisKey = buildRedisLookupKey({
    cacheKey: keyType,
    schemaVersion,
  });
  return new Promise((resolve, reject) => {
    client.hdel(redisKey, ID, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res === 1);
      }
    });
  });
};

// Oauth specialization for temp token

/**
 * Persist oauth metadata into cache for Oauth 1
 * @param {string} token
 * @param {string} tokenSecret
 * @param {string} nonce
 * @param {string} schemaVersion
 * @return {Promise<(undefined|error)>}
 */
module.exports.storeOauthTokenMetadata = ({
  token,
  tokenSecret,
  nonce,
  schemaVersion = REDIS_STABLE_SCHEMA_VERSION,
}) => new Promise((resolve, reject) => {
  const redisKey = buildRedisLookupKey({ cacheKey: RedisHashKey.oauth, schemaVersion });
  const payload = JSON.stringify({ nonce, secret: tokenSecret });
  client.hset(redisKey, token, payload, (err, res) => {
    if (err || res === 0) {
      reject(new Error(`Error in storeKeyValueFromFieldID: ${err || 'nonce not inserted'}`));
    } else {
      resolve(undefined);
    }
  });
});

/**
 * Load from cache oauth 1 metadata
 * @param {string} token
 * @param {string} schemaVersion
 * @return {Promise<({nonce: string, secret: string}|null)>}
 */
module.exports.loadOauthTokenMetadata = ({ token, schemaVersion = REDIS_STABLE_SCHEMA_VERSION }) => {
  const redisKey = buildRedisLookupKey({ cacheKey: RedisHashKey.oauth, schemaVersion });
  return new Promise((resolve, reject) => {
    client.hget(redisKey, token, (err, res) => {
      if (err) {
        appLogger.error(`Error in loadOauthSecretFromToken: ${err}`);
        return reject(err);
      }
      return resolve(JSON.parse(res));
    });
  });
};

/**
 * Store a single state/nonce in a cache set as part of an oauth2 log in
 * @param {string} nonce
 * @param {string} [metadata] If present we will set that as the value for that nonce key
 * @param {string} [schemaVersion]
 * @return {Promise<(undefined|error)>}
 */
module.exports.storeOauthNonce = ({
  nonce,
  metadata = '',
  schemaVersion = REDIS_STABLE_SCHEMA_VERSION,
}) => new Promise((resolve, reject) => {
  const redisKey = buildRedisLookupKey({ cacheKey: RedisHashKey.nonce, schemaVersion });
  client.hset(redisKey, nonce, metadata, (err, res) => {
    if (err || res === 0) {
      reject(new Error(`Error in storeOauthNonce: ${err || 'nonce not inserted'}`));
    } else {
      resolve(undefined);
    }
  });
});

/**
 * Load the nonce if available from the store
 * @param {string} nonce
 * @param {string} schemaVersion
 * @return {Promise<(any)>}
 */
module.exports.loadOauthNonce = ({ nonce, schemaVersion = REDIS_STABLE_SCHEMA_VERSION }) => {
  const redisKey = buildRedisLookupKey({ cacheKey: RedisHashKey.nonce, schemaVersion });
  return new Promise((resolve, reject) => {
    client.hget(redisKey, nonce, (err, res) => {
      if (err || res == null) {
        appLogger.error(`Error in loadOauthNonce: ${err || 'Nonce was not found'}`);
        return reject(err);
      }
      return resolve(res);
    });
  });
};
