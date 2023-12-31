const redis = require('redis');

const redisClient = redis.createClient({port: process.env.REDIS_PORT, host: process.env.REDIS_HOST});
redisClient.on('error', (err) => console.error(`Redis error ${err}`));

module.exports.client = redisClient;
