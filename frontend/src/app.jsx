// React/Redux
import React from "react";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { Provider } from "react-redux";
import { render } from "react-dom";
import thunk from "redux-thunk";
// Saltymotion
import App from "./component/app/app";
import buildStore from "./store/store";
import { persistUserPreference, recoverJWT, recoverUserPreference } from "./lib/storage";
import { jwtDecode } from "./lib/utility";
import appReducer from "./state/app/reducer";
import userReducer from "./state/userProfile/reducer";
import notificationReducer from "./state/notification/reducer";
import reviewReducer from "./state/review/reducer";

const cachedJWT = jwtDecode(recoverJWT());

// Recover user pref from cache
// If not found we'll create default and persist it
let userPreference = recoverUserPreference();
if (userPreference == null) {
  userPreference = { isDarkMode: window.matchMedia("(prefers-color-scheme: dark)").matches };
  persistUserPreference(userPreference.isDarkMode);
}

const rootReducer = combineReducers({
  userProfile: userReducer,
  application: appReducer,
  notification: notificationReducer,
  review: reviewReducer,
});

// TODO Check validity now < new Date(cachedJWT.exp * 1000)
const composeEnhancers =
  IS_PROD || typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== "function"
    ? compose
    : window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ serialize: true });

const store = createStore(
  rootReducer,
  buildStore({ overrideApplicationState: { jwt: cachedJWT, isDarkMode: userPreference.isDarkMode } }),
  composeEnhancers(applyMiddleware(thunk)),
);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("applicationContainerID"),
);
