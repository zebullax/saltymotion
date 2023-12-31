// Saltymotion
import { sortOnTimestampField } from "../../lib/utility";
import { actionType } from "./action";

/**
 * Reducer for the notifications slice of the global state
 * @param {NotificationStore} currentState
 * @param {Action} action
 * @param {NotificationActionType} action.type
 * @return {(NotificationStore | null)}
 */
export default function reducer(currentState, action) {
  if (currentState === undefined) {
    return null;
  }

  switch (action.type) {
    case actionType.setNotification: {
      const { notifications, isCleared, requestedCount } = action.payload;
      const hasMore = requestedCount === notifications.length; // Could lead to a +1 call I know...
      return {
        ...currentState,
        data: isCleared ? notifications : sortOnTimestampField({ items: [...currentState.data, ...notifications] }),
        hasMore,
      };
    }
    case actionType.setNotificationLoadStatus: {
      return {
        ...currentState,
        loadingStatus: action.payload,
      };
    }
    case actionType.updateUnreadNotification: {
      // If we have unread notifications, we reset our state to blank to avoid weird state
      const { hasUnreadNotification } = action.payload;
      return {
        ...currentState,
        hasUnreadNotification,
        data: hasUnreadNotification ? [] : currentState.data,
        hasMore: hasUnreadNotification,
      };
    }

    default:
      return currentState;
  }
}
