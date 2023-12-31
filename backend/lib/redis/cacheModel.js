const saltyCacheNamespace = 'saltyCache';

/**
 * RedisHashKey
 * @typedef {object} RedisHashKey
 * @readonly
 * @property {string} RedisHashKey.userProfile
 * @property {string} RedisHashKey.reviewerProfile
 * @property {string} RedisHashKey.oauth
 */
const RedisHashKey = {
  userProfile: 'userProfileID',
  reviewerProfile: 'reviewerProfileID',
  oauth: 'oauth',
  nonce: 'nonce',
};
module.exports.RedisHashKey = RedisHashKey;

/**
 * RedisSchemaVersion
 * @typedef {object} RedisSchemaVersion
 * @readonly
 * @property {string} RedisSchemaVersion.v1
 * @property {string} RedisSchemaVersion.v2
 * @property {string} RedisSchemaVersion.v3
 */
const RedisSchemaVersion = {
  v1: 'v1', // Baseline
  v2: 'v2', // Adding favorite game to user profile
  v3: 'v3', // Adding tags to reviewer
  v4: 'v4', // Change game pool schema
};
module.exports.RedisSchemaVersion = RedisSchemaVersion;

/**
 * Build a key for hash in redis
 * @param {string} cacheKey
 * @param {string} schemaVersion
 * @return {string}
 */
module.exports.buildRedisLookupKey = ({
  cacheKey,
  schemaVersion,
}) => `${saltyCacheNamespace}_${schemaVersion}:${cacheKey}`;

module.exports.REDIS_STABLE_SCHEMA_VERSION = RedisSchemaVersion.v4;
