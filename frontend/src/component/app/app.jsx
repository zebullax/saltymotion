/* eslint-disable no-console */
// React
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
// MUI
import { ThemeProvider } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CssBaseline from "@mui/material/CssBaseline";
// Saltymotion
import NavigationBar, { VisitorNavigationBar } from "../navigationBar/navigationBar";
import ApplicationBar, { VisitorApplicationBar } from "../applicationBar/applicationBar";
import { makeSaltyTheme } from "../../lib/appTheme";
import { notificationType, notificationTypeToText } from "../../lib/notificationReference";
import LoginPageContainer from "../loginPage/loginPageContainer";
import SignupPageContainer from "../signupPage/signupPageContainer";
import ApplicationRoutes from "../route/loggedInRoute";
import LoadingScreen from "../placeholder/loadingScreen";
import { parseQueryString } from "../../lib/utility";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";
import SaltySocket from "../../lib/socketIO/saltySocket";
import Hidden from "../abstract/Hidden";
import { updateUnreadNotification } from "../../state/notification/action";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";
import { loginFromToken, updateWallet } from "../../state/userProfile/action";

/**
 * Saltymotion Application
 * @type {func} dispatch
 * @type {string} statusMessage
 * @type {string} errorMessage
 * @type {ApiCallStatus} [loginStatus]
 * @type {boolean} isVisitor
 * @type {boolean} isDarkMode
 * @type {JWT} [jwt]
 * @constructor
 * @return {JSX.Element}
 */
function App({ dispatch, statusMessage, errorMessage, loginStatus, isVisitor, isDarkMode, jwt }) {
  const [queryParams, setQueryParams] = React.useState(parseQueryString(document.location.search));
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const socketIO = React.useRef(undefined);

  const saltyTheme = React.useMemo(() => makeSaltyTheme(isDarkMode), [isDarkMode]);

  /**
   * Initialize query string on app mount
   * ...Looks weird but since this component is not living directly under router we can't use router hooks
   */
  React.useEffect(() => {
    console.debug("useEffect: app mount");
    setQueryParams(parseQueryString(document.location.search));
    return () => {
      console.debug("Disconnecting socketIO");
      socketIO.current.close();
    };
  }, []);

  React.useEffect(() => {
    if (isVisitor && jwt !== undefined) {
      console.debug("Found Token, logging in...");
      dispatch(loginFromToken({ jwt }));
    }
    if (!isVisitor && jwt !== undefined) {
      console.log("Logging on to socketIO server");
      socketIO.current = new SaltySocket(jwt);
      socketIO.current.subscribeToMessages("notification", (serializedNotification) => {
        const notification = JSON.parse(serializedNotification);
        const { isError, isActivity, isStatus, type, payload } = notification;
        // Activity means user has a notification
        if (isActivity) {
          dispatch(updateUnreadNotification({ hasUnreadNotification: true }));
        }
        if (isError) {
          dispatch(setErrorMessage(notificationTypeToText(type)));
        } else if (isStatus) {
          dispatch(setStatusMessage(notificationTypeToText(type)));
        }
        if (payload) {
          switch (type) {
            case notificationType.status.charge.complete:
              dispatch(updateWallet({ freeChip: payload.chargeAmount }));
              break;
            default:
              break;
          }
        }
      });
    }
  }, [dispatch, jwt, isVisitor]);

  /**
   * Run effect when querystring parameters update
   */
  React.useEffect(() => {
    console.debug("useEffect App: queryParams");
    if (queryParams === undefined) {
      return;
    }
    if (queryParams.action === "buyChips") {
      switch (queryParams.status) {
        case "success":
          dispatch(setStatusMessage("Chips were purchased successfully"));
          break;
        case "cancel":
          dispatch(setStatusMessage("Chips purchase was cancelled"));
          break;
        default:
          break;
      }
    }
  }, [dispatch, queryParams]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={saltyTheme}>
        <CssBaseline>
          <LoadingScreen isOpen={loginStatus === ApiCallStatus.IN_PROGRESS} />
          {loginStatus !== ApiCallStatus.IN_PROGRESS && (
            <Switch>
              <Route exact path="/signup" render={() => (!isVisitor ? <Redirect to="/" /> : <SignupPageContainer />)} />
              <Route exact path="/login" render={() => (!isVisitor ? <Redirect to="/" /> : <LoginPageContainer />)} />
              <Route>
                <Grid container>
                  <Grid item xs={12} style={{ zIndex: saltyTheme.zIndex.drawer + 1 }}>
                    {isVisitor ? (
                      <VisitorApplicationBar onOpenSideBar={() => setIsSidebarOpen(true)} />
                    ) : (
                      <ApplicationBar onOpenSideBar={() => setIsSidebarOpen(true)} />
                    )}
                  </Grid>
                  <Hidden mdDown>
                    <>
                      <Grid item xs={2}>
                        {isVisitor ? <VisitorNavigationBar /> : <NavigationBar />}
                      </Grid>
                      <Grid item xs={10}>
                        <ApplicationRoutes />
                      </Grid>
                    </>
                  </Hidden>
                  <Hidden lgUp>
                    <>
                      {isVisitor ? (
                        <VisitorNavigationBar
                          isDrawerOpen={isSidebarOpen}
                          onDrawerClose={() => setIsSidebarOpen(false)}
                        />
                      ) : (
                        <NavigationBar isDrawerOpen={isSidebarOpen} onDrawerClose={() => setIsSidebarOpen(false)} />
                      )}
                      <ApplicationRoutes />
                    </>
                  </Hidden>
                </Grid>
              </Route>
            </Switch>
          )}
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={statusMessage !== ""}
            autoHideDuration={6000}
            onClose={() => dispatch(setStatusMessage(""))}
          >
            <Alert color="success" severity="success">
              {statusMessage}
            </Alert>
          </Snackbar>
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={errorMessage !== ""}
            autoHideDuration={6000}
            onClose={() => dispatch(setErrorMessage(""))}
          >
            <Alert color="error" severity="error">
              {errorMessage}
            </Alert>
          </Snackbar>
        </CssBaseline>
      </ThemeProvider>
    </BrowserRouter>
  );
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  statusMessage: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  loginStatus: PropTypes.string,
  isVisitor: PropTypes.bool.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  jwt: PropTypes.shape({
    raw: PropTypes.string.isRequired,
    header: PropTypes.object.isRequired,
    payload: PropTypes.object.isRequired,
  }),
};
App.defaultProps = {
  jwt: undefined,
};

const mapStateToProps = (state) => ({
  statusMessage: state.application.statusMessage,
  errorMessage: state.application.errorMessage,
  loginStatus: state.application.loginStatus,
  isVisitor: state.application.isVisitor,
  isDarkMode: state.application.isDarkMode,
  jwt: state.application.jwt,
});

export default connect(mapStateToProps)(App);
