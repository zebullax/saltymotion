// Saltymotion
import { actionType } from "./action";
import AppActionType from "../app/actionType";
import { cloneUserProfile } from "../../lib/utility";
import { buildInitialUserProfile } from "../../store/initializers";

/**
 * Reducer for user profile slice
 * @param {UserProfile} currentState
 * @param {Action} action
 * @param {UserActionType|AppActionType} action.type
 * @return {(UserProfile | null)}
 */
export default function reducer(currentState, action) {
  if (currentState === undefined) {
    return null;
  }
  switch (action.type) {
    case actionType.setUser: {
      return action.payload;
    }

    case actionType.updateUserProfile: {
      return {
        ...currentState,
        ...action.payload,
      };
    }

    case AppActionType.logout: {
      return buildInitialUserProfile();
    }

    case actionType.linkStripeAccount: {
      return {
        ...currentState,
        stripeAccountID: action.payload,
      };
    }

    case actionType.unlinkStripeAccount: {
      return {
        ...currentState,
        stripeAccountID: undefined,
      };
    }

    case actionType.updateWallet: {
      const updatedProfile = cloneUserProfile(currentState);
      updatedProfile.wallet = {
        freeCoin: currentState.wallet.freeCoin + action.payload.freeChip ?? 0,
        frozenCoin: currentState.wallet.frozenCoin + action.payload.frozenCoin ?? 0,
        redeemableCoin: currentState.wallet.redeemableCoin + action.payload.redeemableCoin ?? 0,
      };
      return updatedProfile;
    }

    /**
     * Add a game to list of follow games in user profile
     */
    case actionType.followGame: {
      return {
        ...currentState,
        favoriteGames: [...currentState.favoriteGames, action.payload],
      };
    }

    /**
     * Remove a game from list of follow games in user profile
     */
    case actionType.unfollowGame: {
      const gameIdx = currentState.favoriteGames.findIndex((game) => game.ID === action.payload.ID);
      if (gameIdx !== -1) {
        currentState.favoriteGames.splice(gameIdx, 1);
      }
      return {
        ...currentState,
        favoriteGames: [...currentState.favoriteGames],
      };
    }

    /**
     * Add a reviewer profile to the list of favorite in user profile
     */
    case actionType.addFavoriteReviewerToUser: {
      return {
        ...currentState,
        favoriteReviewers: [...currentState.favoriteReviewers, action.payload],
      };
    }

    /**
     * Remove a reviewer profile from the list of favorite in user profile
     */
    case actionType.removeFavoriteReviewerToUser: {
      const reviewerIdx = currentState.favoriteReviewers.findIndex((reviewer) => reviewer.ID === action.payload);
      if (reviewerIdx === -1) {
        return currentState;
      }
      currentState.favoriteReviewers.splice(reviewerIdx, 1);
      return {
        ...currentState,
        userProfile: [...currentState.favoriteReviewers],
      };
    }

    default:
      return currentState;
  }
}
