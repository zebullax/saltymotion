/**
 * Save JWT to storage
 * @param {string} jwt
 * @param {Storage} [storage]
 */
export function persistJWT(jwt, storage = window.localStorage) {
  storage.setItem("jwt", jwt);
}

/**
 * Clean any JWT from storage
 * @param {Storage} [storage]
 */
export function cleanJWT(storage = window.localStorage) {
  storage.removeIte("jwt");
}

/**
 * Persist UI preference for user
 * @param {boolean} isDarkMode
 * @param {object} [storage]
 */
export function persistUserPreference(isDarkMode, storage = window.localStorage) {
  storage.setItem("userPreference", JSON.stringify({ isDarkMode }));
}

/**
 * Recover user preference from storage
 * @param {object} [storage]
 * @return {{isDarkMode: boolean}}
 */
export function recoverUserPreference(storage = window.localStorage) {
  return JSON.parse(storage.getItem("userPreference"));
}

/**
 * Get jwt from storage
 * @param {object} [storage]
 * @return {(string|undefined)}
 */
export function recoverJWT(storage = window.localStorage) {
  return storage.getItem("jwt") ?? undefined;
}

/**
 * Clean up local storage
 * @param {object} [storage]
 */
export function wipeCache(storage = window.localStorage) {
  storage.clear();
}
