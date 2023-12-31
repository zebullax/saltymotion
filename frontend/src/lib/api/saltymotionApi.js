// Saltymotion
import { xhrGet, xhrPCall } from "./xhrWrapper";
import {
  GAME_CATEGORY_LABEL,
  REVIEWER_CATEGORY_LABEL,
  TAG_CATEGORY_LABEL,
  UPLOADER_CATEGORY_LABEL,
  USER_CATEGORY_LABEL,
} from "../property";
import { AtelierStatus } from "../atelierStatus";

/**
 * Get the list of all tags, filtered on hint potentially
 * @param {string} [hint=undefined]
 * @param {number} [offset=0]
 * @param {number} [limit=undefined]
 * @return {[Promise<Object[]>,XMLHttpRequest]}
 */
export function getTags({ hint = undefined, offset = 0, limit = undefined }) {
  return xhrGet("/api/v1/tags", { hint, offset, limit });
}

/**
 * Get a tag description
 * @param {number} tagID
 * @return {[Promise<Object[]>,XMLHttpRequest]}
 */
export function getTag(tagID) {
  return xhrGet(`/api/v1/tags/${tagID}`);
}

/**
 * Get one game description
 * @param {number} gameID
 * @return {[Promise<Game[]>,XMLHttpRequest]}
 */
export function getGame({ gameID }) {
  return xhrGet(`/api/v1/games/${gameID}`);
}

/**
 * Get game related tags
 * @param {number} gameID
 * @param {number} [limit]
 * @return {[Promise<Tag[]>,XMLHttpRequest]}
 */
export function getGameTags({ gameID, limit }) {
  return xhrGet(`/api/v1/games/${gameID}/tags`, { limit });
}

/**
 * Get game statistics
 * @param {number} gameID
= * @return {[Promise<GameStatistics>,XMLHttpRequest]}
 */
export function getGameStatistics({ gameID }) {
  return xhrGet(`/api/v1/games/${gameID}/statistics`);
}

/**
 * Get game reviewers
 * @param {number} gameID
 * @param {number} offset
 * @param {number} limit
 * @return {[Promise<Reviewer>,XMLHttpRequest]}
 */
export function getGameReviewers({ gameID, offset = 0, limit = undefined }) {
  return xhrGet(`/api/v1/games/${gameID}/reviewers`, { offset, limit });
}

/**
 * Get games
 * @param {number[]} [tagsID]
 * @param {number} [offset]
 * @param {number} [limit]
 * @return {(Promise<{ID: number, name: string}[]>|XMLHttpRequest)[]}
 */
export function getGames({ tagsID = undefined, offset = 0, limit = undefined }) {
  return xhrGet(
    "/api/v1/games",
    tagsID !== undefined
      ? {
          tagsID: JSON.stringify(tagsID),
          offset,
          limit,
        }
      : { offset, limit },
  );
}

/**
 * Get a list of games from a hint on the name
 * @param {string} hint
 * @param {number} offset
 * @param {number} limit
 * @return {(Promise<Object[]>|XMLHttpRequest)[]}
 */
export function queryGamesFromHint({ hint, offset, limit }) {
  return xhrGet("/api/v1/games/search/fromHint", { hint, offset, limit });
}

/**
 * Get user notifications
 * @param {string} userID
 * @param {string} [startFrom]
 * @param {number} [limit=10] Between 1 and 25
 * @return {(Promise<Object[]>|XMLHttpRequest)[]}
 */
export function getNotifications({ userID, startFrom = undefined, limit = 10 }) {
  return xhrGet(`/api/v1/users/${userID}/notifications`, { startFrom, limit });
}

/**
 * Get the number of unread notifications
 * @param {string} userID
 * @return {(Promise<{count: number}>|XMLHttpRequest)[]}
 */
export function getUnreadNotificationCount({ userID }) {
  return xhrGet(`/api/v1/users/${userID}/notifications`, { status: "ACTIVE" });
}

/**
 * Get a chunk of atelier message
 * @param {number} atelierID
 * @param {number} offset
 * @param {number} limit
 * @return {[Promise<object[]>, XMLHttpRequest]}
 */
export function getAtelierMessage(atelierID, offset, limit) {
  return xhrGet(`/api/v1/ateliers/${atelierID}/comments`, { offset, limit });
}

/**
 * Delete an atelier message
 * @param {number} atelierID
 * @param {number} commentID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function deleteAtelierMessage(atelierID, commentID) {
  return xhrPCall("DELETE", `/api/v1/ateliers/${atelierID}/comments/${commentID}`);
}

/**
 * Get a sample of games
 * @param {number} count
 * @return {(Promise<Game[]>|XMLHttpRequest)[]}
 */
export function sampleGames({ count = 5 }) {
  return xhrPCall("POST", "/api/v1/games/sample", { count });
}

/**
 * Get a sample of reviewers
 * @param {number} count
 * @return {(Promise<Reviewer[]|undefined>|XMLHttpRequest)[]}
 */
export function sampleReviewers({ count = 5 }) {
  return xhrPCall("POST", "/api/v1/reviewers/sample", { count });
}

/**
 * Get a list of recommended ateliers
 * @param {number} gameID
 * @param {boolean} isShortFormat
 * @param {number} offset
 * @param {number} limit
 * @return {[Promise<object[]>, XMLHttpRequest]}
 */
export function getRecommendedAtelier({ gameID, isShortFormat, offset, limit }) {
  return xhrGet("/api/v1/ateliers", {
    filterCategory: GAME_CATEGORY_LABEL,
    filterValue: gameID,
    isShortFormat,
    offset,
    limit,
    atelierStatus: AtelierStatus.Complete,
  });
}

/**
 * Get a list of ateliers
 * @param {number} [userID]
 * @param {string} [uploaderID]
 * @param {string} [reviewerID]
 * @param {number} [gameID]
 * @param {[number]} [tagsID]
 * @param {number} [atelierStatus]
 * @param {boolean} [isNbTotalResultsIncluded=false]
 * @param {number} offset
 * @param {number} limit
 * @param {boolean} [isShortFormat=false]
 * @return {[Promise<object[]>, XMLHttpRequest]}
 */
export function searchAtelier({
  userID,
  uploaderID,
  reviewerID,
  tagsID,
  gameID,
  atelierStatus,
  isNbResultsReturned: isNbTotalResultsIncluded = false,
  offset,
  limit,
  isShortFormat = false,
}) {
  let filter;
  if (userID !== undefined) {
    filter = { label: USER_CATEGORY_LABEL, value: userID };
  } else if (uploaderID !== undefined) {
    filter = { label: UPLOADER_CATEGORY_LABEL, value: uploaderID };
  } else if (reviewerID !== undefined) {
    filter = { label: REVIEWER_CATEGORY_LABEL, value: reviewerID };
  } else if (gameID !== undefined) {
    filter = { label: GAME_CATEGORY_LABEL, value: gameID };
  } else if (tagsID !== undefined) {
    filter = { label: TAG_CATEGORY_LABEL, value: tagsID };
  }

  return xhrGet("/api/v1/ateliers", {
    filterCategory: filter.label,
    filterValue: filter.value,
    isNbTotalResultsIncluded,
    isShortFormat,
    offset,
    limit,
    atelierStatus,
  });
}

/**
 * Get atelier description from atelier ID
 * @param {number} atelierID
 * @return {(Promise<Object[]>|XMLHttpRequest)[]}
 */
export function getAtelier(atelierID) {
  return xhrGet(`/api/v1/ateliers/${atelierID}`);
}

/**
 * Select a random sample of reviews
 * @param {number} [count]
 * @return {(Promise<Object[]>|XMLHttpRequest)[]}
 */
export function getReviewsSample({ count = 6 }) {
  return xhrPCall("POST", "/api/v1/ateliers/sample", { count });
}

/**
 * Post a comment to an atelier
 * @param {number} atelierID
 * @param {string} messageContent
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function postAtelierMessage(atelierID, messageContent) {
  return xhrPCall("POST", `/api/v1/ateliers/${atelierID}/comments`, { comment: messageContent });
}

/**
 * Signal a candidate acceptance to review an atelier
 * @param {number} atelierID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function postAtelierAccept(atelierID) {
  return xhrPCall("POST", `/api/v1/ateliers/${atelierID}/accept`);
}

/**
 * Query to signal a candidate refusal to review an atelier
 * @param {number} atelierID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function postAtelierDecline(atelierID) {
  return xhrPCall("POST", `/api/v1/ateliers/${atelierID}/decline`);
}

/**
 * Update atelier ratings
 * @param {number} ID
 * @param {number} rating
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function updateWorkshopRatings({ ID, rating }) {
  return xhrPCall("PATCH", `/api/v1/ateliers/${ID}/rating`, { score: rating });
}

/**
 * Send a query to update a user profile
 * @param {string} userID
 * @param {Object[]} [languages]
 * @param {string} [timezone]
 * @param {string} [countryCode]
 * @param {string} [email]
 * @param {string} [selfIntroduction]
 * @param {Blob} [picture]
 * @param {{youtubeName: string, twitchName: string, twitterName: string}} [snsAccounts]
 * @param {object} [notificationPreference]
 * @param {string} [currentPassword]
 * @param {string} [newPassword]
 * @param {number[]} [gamePool]
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function updateUserProfile({
  userID,
  languages,
  timezone,
  countryCode,
  email,
  selfIntroduction,
  picture,
  snsAccounts,
  notificationPreference,
  currentPassword,
  newPassword,
  gamePool,
}) {
  const uploadForm = new FormData();
  if (languages) {
    uploadForm.append("languages", JSON.stringify(languages));
  }
  if (snsAccounts) {
    uploadForm.append("snsAccounts", JSON.stringify(snsAccounts));
  }
  if (notificationPreference) {
    uploadForm.append("notificationPreference", JSON.stringify(notificationPreference));
  }
  if (timezone) {
    uploadForm.append("timezone", timezone);
  }
  if (countryCode) {
    uploadForm.append("countryCode", countryCode);
  }
  if (email) {
    uploadForm.append("email", email);
  }
  if (selfIntroduction) {
    uploadForm.append("selfIntroduction", selfIntroduction);
  }
  if (currentPassword && newPassword) {
    uploadForm.append("currentPassword", currentPassword);
    uploadForm.append("newPassword", newPassword);
  }
  if (gamePool) {
    uploadForm.append("gamePool", JSON.stringify(gamePool));
  }
  if (picture) {
    uploadForm.append("picture", picture);
  }
  return xhrPCall("PATCH", `/api/v1/users/${userID}`, uploadForm);
}

/**
 * Post a review video
 * @param {number} atelierID
 * @param {string} encodedBlob
 * @param {string} mimeType
 * @param {function(ProgressEvent)} [progressCallback]
 * @return {Promise<Object[]>}
 */
export function postReview({ atelierID, encodedBlob, progressCallback, mimeType }) {
  const formData = new FormData();
  formData.append("encodedVideoBlob", encodedBlob);
  formData.append("mimeType", JSON.stringify(mimeType));
  const [promise, xhr] = xhrPCall("POST", `/api/v1/ateliers/${atelierID}/review`, formData);
  if (typeof progressCallback === "function") {
    xhr.onprogress = progressCallback;
  }
  return promise;
}

/**
 * Create an atelier
 * @param {number} gameID
 * @param {boolean} isPrivate
 * @param {string} title
 * @param {string} description
 * @param {object[]} tags
 * @param {object[]} reviewers
 * @param {Blob} videoFile
 * @param {function} [progressCallback = undefined]
 * @return {Promise<Object[]>}
 */
export function postCreateAtelier({
  gameID,
  isPrivate,
  title,
  description,
  tags,
  reviewers,
  videoFile,
  progressCallback = undefined,
}) {
  const formData = new FormData();
  formData.append("gameID", gameID.toString());
  formData.append("isPrivate", isPrivate.toString());
  formData.append("title", title);
  formData.append("description", description);
  formData.append("tags", JSON.stringify(tags));
  formData.append("reviewers", JSON.stringify(reviewers));
  formData.append("video", videoFile);
  const [promise, xhr] = xhrPCall("POST", "/api/v1/ateliers", formData);
  xhr.onprogress = progressCallback;
  return promise;
}

/**
 * Create a checkout ID for chip purchase
 * @param {string} userID
 * @return {(Promise<any|undefined>|XMLHttpRequest)[]}
 */
export function createCheckoutID({ userID }) {
  return xhrPCall("POST", `/api/v1/wallets/${userID}/checkoutID`);
}

/**
 * List history of user wallet
 * If user wants to see charges and/or outgoingBounties, user must pass a valid time range
 * @param {string} userID
 * @param {{from: string, to: string}} [chargesFilter]
 * @param {{from: string, to: string}} [outgoingBountiesFilter]
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function getWalletHistory({ userID, chargesFilter, outgoingBountiesFilter }) {
  const filter = {};
  if (chargesFilter) {
    Object.assign(filter, {
      "chargesFilter[date][lt]": chargesFilter.to,
      "chargesFilter[date][gt]": chargesFilter.from,
    });
  }
  if (outgoingBountiesFilter) {
    Object.assign(filter, {
      "outgoingBountiesFilter[date][lt]": outgoingBountiesFilter.to,
      "outgoingBountiesFilter[date][gt]": outgoingBountiesFilter.from,
    });
  }
  return xhrGet(`/api/v1/wallets/${userID}/history`, filter);
}

/**
 * Query reviewer profile
 * @param {string} [name=undefined]
 * @param {string} [hint=undefined]
 * @param {number} [gameID=undefined]
 * @param {number[]} [tagsID=undefined]
 * @param {boolean} [fetchLanguages=false]
 * @param {boolean} [isShort=false]
 * @param {number} [offset=undefined]
 * @param {number} [limit=undefined]
 * @return {(Promise<Reviewer[]|undefined>|XMLHttpRequest)[]}
 */
export function searchReviewer({
  name = undefined,
  hint = undefined,
  gameID = undefined,
  tagsID = undefined,
  fetchLanguages = false,
  isShort = false,
  offset = undefined,
  limit = undefined,
}) {
  if (name === undefined && hint === undefined && tagsID === undefined) {
    return [Promise.reject(new Error("You must specify at least one criteria")), new XMLHttpRequest()];
  }
  const serializedTagsID = tagsID !== undefined ? JSON.stringify(tagsID) : undefined;
  return xhrGet("/api/v1/reviewers", {
    name,
    hint,
    gameID,
    tagsID: serializedTagsID,
    fetchLanguages,
    offset,
    limit,
    isShort,
  });
}

/**
 * Get a single reviewer profile
 * @param {number} ID
 * @return {(Promise<Reviewer>|XMLHttpRequest)[]}
 */
export function getReviewerProfile(ID) {
  return xhrGet(`/api/v1/reviewers/${ID}`);
}

/**
 * Get the connected user Stripe connect account if any
 * @param {string} reviewerID
 * @return {(Promise<Object[]>|XMLHttpRequest)[]}
 */
export function getReviewerConnectedAccount(reviewerID) {
  return xhrGet(`/api/v1/reviewers/${reviewerID}/connectedAccount`, {});
}

/**
 * Delete a reviewer connected account
 * @param {string} reviewerID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function deleteReviewerConnectedAccount(reviewerID) {
  return xhrPCall("DELETE", `/api/v1/reviewers/${reviewerID}/connectedAccount`, {});
}

/**
 * Add a reviewer to user's favorite
 * @param {string} userID
 * @param {string} reviewerID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function addReviewerToFavorite(userID, reviewerID) {
  return xhrPCall("POST", `/api/v1/users/${userID}/favoriteReviewers/${reviewerID}`);
}

/**
 * Remove a reviewer to user's favorite
 * @param {string} userID
 * @param {string} reviewerID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function removeReviewerFromFavorite(userID, reviewerID) {
  return xhrPCall("DELETE", `/api/v1/users/${userID}/favoriteReviewers/${reviewerID}`);
}

/**
 * Add a game to the list of a user followed games
 * @param {string} userID
 * @param {number} gameID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function addGameToFollow(userID, gameID) {
  return xhrPCall("POST", `/api/v1/users/${userID}/favoriteGames/${gameID}`);
}

/**
 * Remove a reviewer to user's favorite
 * @param {string} userID
 * @param {number} gameID
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function removeGameFromFollow(userID, gameID) {
  return xhrPCall("DELETE", `/api/v1/users/${userID}/favoriteGames/${gameID}`);
}

/**
 * Get recommended list of resources for user front page
 * @param {string} userID
 * @param {number} [gameRecommendationOffset]
 * @param {number} [gameRecommendationLimit]
 * @param {number} [reviewerRecommendationOffset]
 * @param {number} [reviewerRecommendationLimit]
 * @return {[Promise<{games: Game[], reviews: {fromGames: AtelierDescription[], fromReviewers: AtelierDescription[]}, reviewers: Reviewer[]}>, XMLHttpRequest]}
 */
export function getUserFeed({
  userID,
  gameRecommendationOffset = 0,
  gameRecommendationLimit = 10,
  reviewerRecommendationOffset = 0,
  reviewerRecommendationLimit = 10,
}) {
  return xhrGet(`/api/v1/users/${userID}/feed`, {
    gameRecommendationOffset,
    gameRecommendationLimit,
    reviewerRecommendationOffset,
    reviewerRecommendationLimit,
  });
}

/**
 * Update user account to new password using the secret link
 * @param {string} newPassword
 * @param {string} secret
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function resetUserPassword(newPassword, secret) {
  return xhrPCall("POST", "/api/v1/users/resetPassword", { newPassword, secret }, undefined);
}

/**
 * Create a reset link for user password
 * @param {string} username
 * @param {string} email
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function createResetLink(username, email) {
  const jwt = undefined;
  return xhrPCall("POST", "/api/v1/users/resetPasswordLink", { username, email }, jwt);
}

/**
 * Get a user profile
 * @param {string} userID
 * @param {string} [jwtToken]
 * @return {(Promise<UserProfile|UserPublicProfile>|XMLHttpRequest)[]}
 */
export function getUser(userID, jwtToken = undefined) {
  return xhrGet(`/api/v1/users/${userID}`, undefined, jwtToken);
}

/**
 * Apply local authentication
 * @param {string} username
 * @param {string} password
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function authenticateUser({ username, password }) {
  return xhrPCall("POST", "/api/v1/users/auth", { username, password }, undefined);
}

/**
 * Signup a user
 * @param {string} password
 * @param {string} username
 * @param {string} timezone
 * @param {string} countryCode
 * @param {string} email
 * @return {(Promise<Object[]|undefined>|XMLHttpRequest)[]}
 */
export function signupUser({ password, username, timezone, countryCode, email }) {
  return xhrPCall(
    "POST",
    "/api/v1/users",
    {
      password,
      username,
      timezone,
      countryCode,
      email,
    },
    undefined,
  );
}
