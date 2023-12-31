// Node/Express
const path = require('path');
// Saltymotion
const gameQuery = require('../../db/gameQuery');
const appLogger = require('../../log/logger')
  .createLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug', path.join(process.env.NODE_LOG_PATH, 'log'));

/**
 * Data access layer to game object
 * @param {number} gameID
 * @return {{
 * get: (function(): Promise<Game>),
 * }}
 */
function game({ gameID }) {
  let instance;
  /**
   * Load game instance
   * @param {boolean} forceReload
   */
  const fetchGame = async ({ forceReload }) => {
    if (instance !== undefined && !forceReload) return;
    instance = await gameQuery.selectGameFromID(gameID);
  };
  return {
    get: async () => {
      try {
        await fetchGame({ forceReload: false });
      } catch (e) {
        appLogger.error(`Error in game::get: ${e}`);
        instance = undefined;
      }
      return instance;
    },
  };
}

module.exports = game;
