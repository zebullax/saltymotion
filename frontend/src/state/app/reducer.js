// Saltymotion
import { buildInitialApplicationState } from "../../store/initializers";
import appActionType from "./actionType";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";

/**
 * Reducer for application state
 * @param {ApplicationStore} currentState
 * @param {Action} action
 * @param {AppActionType} action.type
 * @return {ApplicationStore}
 */
export default function reducer(currentState, action) {
  if (currentState === undefined) {
    return buildInitialApplicationState();
  }
  switch (action.type) {
    case appActionType.identity:
      return currentState;

    case appActionType.logout:
      return buildInitialApplicationState();

    case appActionType.setErrorMessage: {
      return {
        ...currentState,
        errorMessage: action.payload,
      };
    }

    case appActionType.setStatusMessage: {
      return {
        ...currentState,
        statusMessage: action.payload,
      };
    }

    case appActionType.setLoginStatus: {
      const isSuccess = action.payload.status === ApiCallStatus.SUCCESS;
      return {
        ...currentState,
        loginStatus: action.payload.status,
        jwt: isSuccess ? action.payload.jwt : currentState.jwt,
        isVisitor: !isSuccess,
      };
    }

    case appActionType.updateQuickAccessWorkshopsLoadChunkStatus: {
      return {
        ...currentState,
        quickAccessWorkshopsLoadChunkStatus: action.payload,
      };
    }

    case appActionType.toggleDarkMode: {
      return {
        ...currentState,
        isDarkMode: !currentState.isDarkMode,
      };
    }

    case appActionType.trimQuickAccessWorkshops: {
      const { quickAccessWorkshops } = currentState;
      const updatedWorkshops = quickAccessWorkshops.slice(0, quickAccessWorkshops.length - action.payload);
      return {
        ...currentState,
        quickAccessWorkshops: updatedWorkshops,
      };
    }

    case appActionType.setUserProfileUpdateStatus: {
      return {
        ...currentState,
        updateStatus: action.payload,
      };
    }

    case appActionType.clearQuickAccessWorkshopsNextChunk: {
      return {
        ...currentState,
        quickAccessWorkshops: [],
      };
    }

    case appActionType.pushQuickAccessWorkshopsNextChunk: {
      if (action.payload.length === 0) {
        return { ...currentState, hasMoreQuickAccessWorkshops: false };
      }
      return {
        ...currentState,
        quickAccessWorkshops: [...currentState.quickAccessWorkshops, ...action.payload],
      };
    }

    default:
      return currentState;
  }
}
