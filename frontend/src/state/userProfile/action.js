import { setErrorMessage, setLoginStatus, setStatusMessage, setUserProfileUpdateStatus } from "../app/action";
import {
  addGameToFollow,
  authenticateUser,
  createCheckoutID,
  deleteReviewerConnectedAccount,
  getUnreadNotificationCount,
  getUser,
  removeGameFromFollow,
  updateUserProfile as updateUser,
} from "../../lib/api/saltymotionApi";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";
import { STRIPE_PK_KEY } from "../../lib/property";
import { updateUnreadNotification } from "../notification/action";
import { cleanJWT, persistJWT, wipeCache } from "../../lib/storage";
import { jwtDecode } from "../../lib/utility";

/**
 * @typedef {Object} UserActionType
 * @readonly
 * @property {string} setUser
 * @property {string} logout
 * @property {string} updateUserProfile
 * @property {string} linkStripeAccount
 * @property {string} unlinkStripeAccount
 * @property {string} updateWallet
 * @property {string} addFavoriteReviewerToUser
 * @property {string} removeFavoriteReviewerToUser
 * @property {string} followGame
 * @property {string} unfollowGame
 * @property {string} updateSelfIntroduction
 */
const actionType = {
  setUser: "USER:PROFILE__SET",
  logout: "USER:LOGOUT",
  updateUserProfile: "USER:PROFILE__UPDATE",
  linkStripeAccount: "USER:WALLET__STRIPE_ACCOUNT__ADD",
  unlinkStripeAccount: "USER:WALLET__STRIPE_ACCOUNT__REMOVE",
  updateWallet: "USER:WALLET__UPDATE",
  addFavoriteReviewerToUser: "USER:ADD_FAVORITE_REVIEWER",
  removeFavoriteReviewerToUser: "USER:REMOVE_FAVORITE_REVIEWER",
  followGame: "USER:FOLLOW_GAME",
  unfollowGame: "USER:UNFOLLOW_GAME",
  updateSelfIntroduction: "USER:SELF_INTRODUCTION__UPDATE",
};

export { actionType };

/**
 * Set the user profile
 * @param {UserProfile} profile
 * @return {Action}
 */
export function setUser(profile) {
  return {
    type: actionType.setUser,
    payload: profile,
  };
}

/**
 * Update the user profile
 * @param {Object} profile
 * @param {string} profile.userID
 * @param {Language[]} [profile.languages]
 * @param {string} [profile.timezone]
 * @param {string} [profile.countryCode]
 * @param {string} [profile.email]
 * @param {string} [profile.selfIntroduction]
 * @param {SnsAccounts} [profile.snsAccounts]
 * @param {Blob} [profile.picture]
 * @param {{ID: number, minimumBounty: number}[]} [profile.gamePool]
 * @param {string} [profile.currentPassword]
 * @param {string} [profile.newPassword]
 * @return {function}
 */
const updateUserProfile = (profile) => (dispatch) => {
  dispatch(setUserProfileUpdateStatus(ApiCallStatus.IN_PROGRESS));
  const [updatePromise] = updateUser({ ...profile });
  updatePromise
    .then((updatedProfile) => {
      dispatch(setStatusMessage("Profile successfully updated"));
      dispatch({
        type: actionType.updateUserProfile,
        payload: updatedProfile,
      });
    })
    .catch(() => {
      dispatch(setErrorMessage("Error while updating your profile"));
      dispatch(setUserProfileUpdateStatus(ApiCallStatus.FAILURE));
    })
    .finally(() => {
      dispatch(setUserProfileUpdateStatus(ApiCallStatus.COMPLETE));
    });
};
export { updateUserProfile };

/**
 * Add a reviewer to the set of favorite reviewers
 * @param {UserPublicProfile} reviewerProfile
 * @return {Action}
 */
export function addFavoriteReviewerToUser(reviewerProfile) {
  return {
    type: actionType.addFavoriteReviewerToUser,
    payload: reviewerProfile,
  };
}

/**
 * Remove a reviewer from favorites
 * @param {string} reviewerID
 * @return {Action}
 */
export function removeFavoriteReviewerToUser(reviewerID) {
  return {
    type: actionType.removeFavoriteReviewerToUser,
    payload: reviewerID,
  };
}

/**
 * Add a game to the user follow list
 * @param {string} userID
 * @param {{ID: number, name: string}} game
 * @param {(function|undefined)} onFollow
 * @return {Action}
 */
export function followGame(userID, game, onFollow = undefined) {
  const [followGamePromise] = addGameToFollow(userID, game.ID);
  followGamePromise
    .then(() => {
      if (typeof onFollow === "function") {
        onFollow(undefined);
      }
    })
    .catch((e) => {
      if (typeof onFollow === "function") {
        onFollow(e);
      }
    });
  return { type: actionType.followGame, payload: { ID: game.ID, name: game.name } };
}

/**
 * Remove a game from the user follow list
 * @param {string} userID
 * @param {{ID: number, name: string}} game
 * @param {(function|undefined)} onUnfollow
 * @return {Action}
 */
export function unfollowGame(userID, game, onUnfollow = undefined) {
  const [unfollowGamePromise] = removeGameFromFollow(userID, game.ID);
  unfollowGamePromise
    .then(() => {
      if (typeof onUnfollow === "function") {
        onUnfollow(undefined);
      }
    })
    .catch((e) => {
      if (typeof onUnfollow === "function") {
        onUnfollow(e);
      }
    });
  return { type: actionType.unfollowGame, payload: { ID: game.ID, name: game.name } };
}

/**
 * Link the Stripe account ID to the user profile
 * @param {string} accountID
 * @return {Action}
 */
const linkStripeAccount = (accountID) => ({ type: actionType.linkStripeAccount, payload: accountID });
export { linkStripeAccount };

/**
 * Unlink the stripe account from user profile
 * @param {string} userID
 * @return {(function(*): void)|*}
 */
const unlinkStripeAccount = (userID) => (dispatch) => {
  const [deleteConnectedAccountPromise] = deleteReviewerConnectedAccount(userID);
  deleteConnectedAccountPromise
    .then(() => {
      dispatch(setStatusMessage("Your Stripe account is now unlinked"));
      dispatch({ actionType: actionType.unlinkStripeAccount });
    })
    .catch((error) => {
      console.error(error);
      dispatch(setErrorMessage("Error while unlinking your Stripe account, please retry later..."));
    });
};
export { unlinkStripeAccount };

/**
 * Update a user wallet based on a delta
 * @param {number} [freeChip]
 * @param {number} [redeemableChip]
 * @param {number} [frozenChip]
 * @return {{payload: {redeemableChip, frozenChip, freeChip}, type: (string)}}
 */
export function updateWallet({ freeChip, redeemableChip, frozenChip }) {
  return { type: actionType.updateWallet, payload: { freeChip, redeemableChip, frozenChip } };
}

export function purchaseChip({ userID }) {
  return (dispatch) => {
    // Redirect to either once purchase ends
    // ...?action=buyChips&status=success
    // ...?action=buyChips&status=cancel
    const [chargePromise] = createCheckoutID({ userID });
    chargePromise
      .then(({ sessionID: stripeCheckoutID }) => {
        // eslint-disable-next-line new-cap
        const stripeClient = window.Stripe(STRIPE_PK_KEY);
        stripeClient
          .redirectToCheckout({
            sessionId: stripeCheckoutID,
          })
          .then((checkoutValue) => {
            if (checkoutValue.error.message !== undefined) {
              console.error(`Error from checkout: ${checkoutValue.error.message}`);
              dispatch(setErrorMessage("Error while processing the charge"));
            }
          })
          .catch((redirectError) => {
            console.error(redirectError);
            dispatch(setErrorMessage("Error while redirecting to checkout"));
          });
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Error while processing the charge"));
      });
  };
}

/**
 * Login using a token
 * @param {JWT} jwt
 * @param {function} [onSuccess]
 * @param {function} [onError]
 * @return {(function(*): void)|*}
 */
export function loginFromToken({ jwt, onSuccess, onError }) {
  return (dispatch) => {
    dispatch(setLoginStatus({ status: ApiCallStatus.IN_PROGRESS }));
    const userID = jwt.payload.ID;
    const [getUserPromise] = getUser(userID, jwt.raw);
    const [getUnreadNotificationCountPromise] = getUnreadNotificationCount({ userID });
    Promise.all([getUserPromise, getUnreadNotificationCountPromise])
      .then(([user, unreadNotification]) => {
        dispatch(setUser(user));
        dispatch(
          updateUnreadNotification({
            hasUnreadNotification: unreadNotification?.count > 0,
          }),
        );
        dispatch(setLoginStatus({ status: ApiCallStatus.SUCCESS, jwt }));
        if (typeof onSuccess === "function") {
          onSuccess();
        }
      })
      .catch((e) => {
        console.error(e);
        // Remove the jwt from cache to prevent bad state loop
        wipeCache();
        dispatch(setLoginStatus({ status: ApiCallStatus.FAILURE, msg: "Error while login using server token" }));
        if (typeof onError === "function") {
          onError();
        }
      });
  };
}

/**
 * Initiate login process from username password
 * @param {string} username
 * @param {string} password
 * @return {function}
 */
export function loginFromCredential({ username, password }) {
  return (dispatch) => {
    const [loginPromise] = authenticateUser({ username, password });
    let jwt;
    loginPromise
      .then(({ token }) => {
        jwt = jwtDecode(token);
        if (jwt === undefined) {
          throw new Error("Error decoding the auth token");
        }
        persistJWT(token);
        return jwt;
      })
      .then((decodedJWT) => dispatch(loginFromToken({ jwt: decodedJWT })))
      .catch((e) => {
        console.error(e);
        dispatch(setErrorMessage("Error while authenticating"));
        cleanJWT();
      });
  };
}

/**
 * Logout from the app
 * @return {Action}
 */
export function logout() {
  wipeCache();
  return {
    type: actionType.logout,
  };
}
