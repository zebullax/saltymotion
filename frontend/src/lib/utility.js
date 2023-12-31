import _ from "underscore";

/**
 * Deserialize reviewer profile
 * @param {Object} reviewer
 * @param {string} reviewer.ID
 * @param {string} reviewer.name
 * @param {string} reviewer.selfIntroduction
 * @param {string} reviewer.timezone
 * @param {snsAccounts} reviewer.snsAccounts
 * @param {string} reviewer.registrationDate
 * @param {string} reviewer.countryCode
 * @param {Language[]} reviewer.languages
 * @param {NormalizedGamePool[]} reviewer.gamePool
 * @return {Reviewer}
 */
export function deserializeReviewerProfile(reviewer) {
  return {
    ID: reviewer.ID,
    name: reviewer.name,
    selfIntroduction: reviewer.selfIntroduction,
    timezone: reviewer.timezone,
    snsAccounts: reviewer.snsAccounts,
    registrationDate: new Date(reviewer.registrationDate),
    countryCode: reviewer.countryCode,
    languages: reviewer.languages,
    gamePool: reviewer.gamePool,
  };
}

/**
 *
 * @param {object} profile
 * @param {string} profile.registrationDate
 * @param {object[]} profile.favoriteReviewers
 * @param {{ID: number, name: string}[]} profile.favoriteGames
 * @return {UserProfile}
 */
export function deserializeUserProfile(profile) {
  // TODO use parse reviver
  return {
    ...profile,
    registrationDate: new Date(profile.registrationDate),
    favoriteGames: profile.favoriteGames,
    favoriteReviewers: profile.favoriteReviewers.map((reviewer) => deserializeReviewerProfile(reviewer)),
  };
}
export const s3LinkCategory = {
  matchVideo: "https://saltymotion-atelier-candidate.s3-ap-northeast-1.amazonaws.com",
  profilePicture: "https://saltymotion-user-profile.s3-ap-northeast-1.amazonaws.com",
  previewPicture: "https://saltymotion-atelier-preview.s3-ap-northeast-1.amazonaws.com",
  reviewVideo: "https://saltymotion-atelier-review.s3-ap-northeast-1.amazonaws.com",
  staticPicture: "https://saltymotion-static-images.s3-ap-northeast-1.amazonaws.com",
  gameCover: "https://saltymotion-game-cover.s3-ap-northeast-1.amazonaws.com",
  gameBackdrop: "https://saltymotion-game-backdrop.s3-ap-northeast-1.amazonaws.com",
};

/**
 * Create a s3 link from a category of resource and its key
 * @param {string} linkCategory
 * @param {string|number} s3Key
 * @return {string|undefined}
 */
export function makeS3Link(linkCategory, s3Key) {
  switch (linkCategory) {
    case s3LinkCategory.matchVideo:
    case s3LinkCategory.reviewVideo:
    case s3LinkCategory.previewPicture:
    case s3LinkCategory.staticPicture:
    case s3LinkCategory.profilePicture:
    case s3LinkCategory.gameCover:
    case s3LinkCategory.gameBackdrop:
      return `${linkCategory}/${s3Key}`;
    default:
      return undefined;
  }
}

/**
 * Build GET query string
 * @param {object} params
 * @return {string}
 */
export function formatGetParams(params = {}) {
  return (
    "?" +
    Object.keys(params)
      .filter((key) => params[key] !== undefined)
      .map((key) => key + "=" + encodeURIComponent(params[key]))
      .join("&")
  );
}

/**
 * Use the string from useLocation to parse the queryString
 * @param {string} locationSearch
 * @return {(Object|undefined)}
 */
export function parseQueryString(locationSearch) {
  if (locationSearch === "") {
    return undefined;
  }
  const normalizedResults = {};
  const params = new URLSearchParams(locationSearch);
  params.forEach((val, key) => (normalizedResults[key] = val));
  return normalizedResults;
}

/**
 * Decode a jwt
 * @param {string} t
 * @return {JWT | undefined}
 */
export function jwtDecode(t) {
  if (t === undefined) {
    return undefined;
  }
  try {
    return {
      raw: t,
      header: JSON.parse(window.atob(t.split(".")[0])),
      payload: JSON.parse(window.atob(t.split(".")[1])),
    };
  } catch (e) {
    console.error(`Error while decoding jwt: ${e}`);
    return undefined;
  }
}

/**
 * Clone an object using JSON as an IR
 * @param {object} o
 * @return {object}
 */
export function dirtyClone(o) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * Clone a user profile
 * @param {Object} o
 * @return {UserProfile}
 */
export function cloneUserProfile(o) {
  // TODO use parse reviver
  return deserializeUserProfile(dirtyClone(o));
}

/**
 * Validate email against regex
 * @param {string} email
 * @return {boolean}
 */
export function checkIsEmailValid(email) {
  // eslint-disable-next-line max-len
  const re =
    /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Sort a sequence of items based on a timestamp stringified field
 * @param {string} timestampFieldName
 * @param {boolean} isDesc
 * @param {Object[]} items
 * @return {Object[]}
 */
export function sortOnTimestampField({ timestampFieldName = "timestamp", isDesc = true, items }) {
  // Keep it sorted on timestamp desc
  let sortedItems = items.sort((lhs, rhs) => (isDesc ? 1 : -1) * (new Date(rhs.timestamp) - new Date(lhs.timestamp)));
  sortedItems = _.uniq(sortedItems, true, (item) => item[timestampFieldName]);
  return sortedItems;
}

/**
 * No op function
 */
export function noop() {
  // NO OP...
}
