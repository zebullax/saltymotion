const winston = require('winston');
const { format } = require('logform');

const alignWithLevelContext = (level) => {
  const longestLevel = 'warning';
  return ' '.repeat(longestLevel.length - level.length);
};

const alignedWithTime = format.combine(
  format.timestamp(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${alignWithLevelContext(info.level)} ${info.message}`),
);

module.exports.createLogger = (level, filename) => winston.createLogger({
  level,
  format: alignedWithTime,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename }),
  ],
});
