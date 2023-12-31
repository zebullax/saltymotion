/* eslint-disable no-console */
// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
// MUI
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import PersonIcon from "@mui/icons-material//Person";
import LockIcon from "@mui/icons-material//Lock";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
// Saltymotion
import { persistJWT, wipeCache } from "../../lib/storage";
import { jwtDecode, makeS3Link, parseQueryString, s3LinkCategory } from "../../lib/utility";
import { ResetPasswordDialog } from "../password/passwordDialog";
import { createResetLink, resetUserPassword } from "../../lib/api/saltymotionApi";
import ForgottenPasswordDialog from "./forgottenPasswordDialog";
import { loginFromCredential, loginFromToken } from "../../state/userProfile/action";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";

/**
 * Render the Login main container
 * @param {function} dispatch
 * @param {string} loginStatus
 * @param {JWT} jwt
 * @return {JSX.Element}
 * @constructor
 */
function LoginPageContainer({ dispatch, loginStatus, jwt }) {
  const location = useLocation();
  const theme = useTheme();
  const history = useHistory();
  const isDarkMode = theme.palette.mode === "dark";

  const [queryParams, setQueryParams] = React.useState(parseQueryString(location.search));
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isForgottenPasswordDialogOpen, setIsForgottenPasswordDialogOpen] = React.useState(false);
  const [isCreatingResetLink, setIsCreatingResetLink] = React.useState(false);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [isResettingPasswordDialogOpen, setIsResettingPasswordDialogOpen] = React.useState(
    queryParams?.action === "resetPassword" && queryParams?.token?.length !== 0,
  );

  /**
   * Update query parameters dictionary on location change
   */
  React.useEffect(() => {
    setQueryParams(parseQueryString(location.search));
  }, [location]);

  /**
   * If a non-undefined jwt is passed as props to this component, we will try to log in automatically
   */
  React.useEffect(() => {
    if (jwt === undefined) {
      return;
    }
    console.debug("Auto log in with token");
    dispatch(
      loginFromToken({
        jwt,
        onSuccess: () => history.replace(location?.state?.from ?? "/"),
        onError: () => history.replace("/login"),
      }),
    );
  }, [location, history, dispatch, jwt]);

  /**
   * Run effect on  location change to detect OAUTH redirect with JWT authentication
   */
  React.useEffect(() => {
    if (queryParams === undefined) {
      return;
    }

    const { signup, auth, jwt: jwtFromQueryParam } = queryParams;
    console.debug("Running effect Login on queryParams", queryParams);
    if (signup === "SUCCESS") {
      dispatch(setStatusMessage("Your account has been confirmed, please login"));
    } else if (signup === "PARAM_ERROR") {
      dispatch(setErrorMessage("Error validating the parameters of your link"));
    } else if (signup === "NO_LINK_ERROR") {
      dispatch(setErrorMessage("Could not find your validation link, please try signing up again"));
    } else if (signup === "EXPIRED_LINK_ERROR") {
      dispatch(setErrorMessage("Your link expired, try signing up again"));
    }

    if (auth === "error") {
      dispatch(setErrorMessage("Error during login"));
    } else if (auth === "success" && jwtFromQueryParam) {
      persistJWT(jwtFromQueryParam);
      const decodedJWT = jwtDecode(jwtFromQueryParam);
      if (decodedJWT === undefined) {
        wipeCache();
        dispatch(setErrorMessage("Error while decoding token"));
      } else {
        dispatch(
          loginFromToken({
            jwt: decodedJWT,
            onError: () => history.replace("/login"),
            onSuccess: () => history.replace("/"),
          }),
        );
      }
    }
  }, [history, queryParams, dispatch]);

  const onCreateResetLink = (formUsername, formEmail) => {
    setIsCreatingResetLink(true);
    const [resetPromise] = createResetLink(formUsername, formEmail);
    resetPromise
      .then(() => {
        dispatch(setStatusMessage(`An email was sent to ${formEmail} with a temporary link to reset your password`));
        setIsForgottenPasswordDialogOpen(false);
      })
      .catch((err) => {
        console.error(err);
        dispatch(setErrorMessage("Error while resetting password, try again later"));
      })
      .finally(() => setIsCreatingResetLink(false));
  };

  const onResetPassword = (newPassword) => {
    const [resetPromise] = resetUserPassword(newPassword, queryParams.token);
    resetPromise
      .then(() => {
        dispatch(setStatusMessage("Your password was successfully changed, you can now log in"));
      })
      .catch((err) => {
        console.error(err);
        dispatch(setErrorMessage("Error while updating your password, try again later"));
      })
      .finally(() => {
        setIsResettingPassword(false);
        setIsForgottenPasswordDialogOpen(false);
      });
    setIsResettingPassword(true);
  };

  const onLoginWithCredential = (evt) => {
    evt.preventDefault();
    dispatch(loginFromCredential({ username, password }));
  };

  return (
    <>
      <ResetPasswordDialog
        isOpen={isResettingPasswordDialogOpen}
        onSubmit={onResetPassword}
        isSaving={isResettingPassword}
        onClose={() => setIsResettingPasswordDialogOpen(false)}
      />
      <ForgottenPasswordDialog
        isOpen={isForgottenPasswordDialogOpen}
        onClose={() => setIsForgottenPasswordDialogOpen(false)}
        isSendingPasswordReset={isCreatingResetLink}
        onPasswordReset={onCreateResetLink}
      />
      <Grid container style={{ zIndex: 999, height: "100vh" }}>
        <Grid item xs={1} lg={4} />
        <Grid item xs={10} lg={4} style={{ position: "relative", margin: "auto" }}>
          <Paper
            style={{
              padding: theme.spacing(4),
              maxWidth: "450px",
              margin: "auto",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={1} lg={2} />
              <Grid item xs={10} lg={8} container alignItems="center">
                <Grid item xs={3}>
                  <img
                    crossOrigin="anonymous"
                    src={makeS3Link(
                      s3LinkCategory.staticPicture,
                      isDarkMode ? "transparentLogo.png" : "saltyLogoDarkBackground.png",
                    )}
                    alt="saltymotion logo"
                    style={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={9}>
                  <Typography variant="h4">Saltymotion</Typography>
                </Grid>
              </Grid>
              <Grid item xs={1} lg={2} />
              <Grid item xs={12}>
                <form method="post" onSubmit={onLoginWithCredential} data-testid="LoginPageContainerTestID">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                        name="username"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        label="Username"
                        placeholder="Type your username"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        InputProps={{
                          type: "password",
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon />
                            </InputAdornment>
                          ),
                        }}
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        label="Password"
                        placeholder="Type your password"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} style={{ textAlign: "right" }}>
                      <Link
                        variant="subtitle2"
                        onClick={() => setIsForgottenPasswordDialogOpen(true)}
                        style={{ cursor: "pointer" }}
                      >
                        Forgot password ?
                      </Link>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        style={{
                          width: "100%",
                          marginBottom: theme.spacing(2),
                          marginTop: theme.spacing(2),
                        }}
                      >
                        LOGIN
                      </Button>
                      {loginStatus === ApiCallStatus.IN_PROGRESS && (
                        <CircularProgress style={{ position: "relative", left: "calc(50% - 20px)" }} />
                      )}
                    </Grid>
                  </Grid>
                </form>
              </Grid>
              <Grid item xs={2} sm={4} alignSelf="center">
                <Divider light />
              </Grid>
              <Grid item xs={8} sm={4}>
                <Typography style={{ textAlign: "center" }} variant="subtitle1">
                  Or Sign-in with
                </Typography>
              </Grid>
              <Grid item xs={2} sm={4} style={{ alignSelf: "center" }}>
                <Divider light />
              </Grid>
              <Grid item xs={12} container justifyContent="space-around">
                <Grid item xs={3} style={{ textAlign: "center" }}>
                  <IconButton onClick={() => document.location.assign("/auth/loginWithTwitch")}>
                    <Avatar
                      style={{ border: "1px white solid", height: "50px", width: "50px" }}
                      src={makeS3Link(s3LinkCategory.staticPicture, "loginButton/twitch.png")}
                      alt="Login with Twitch"
                    />
                  </IconButton>
                </Grid>
                <Grid item xs={3} textAlign="center">
                  <IconButton onClick={() => document.location.assign("/auth/loginWithGoogle")}>
                    <Avatar
                      style={{ border: "1px white solid", height: "50px", width: "50px" }}
                      src={makeS3Link(s3LinkCategory.staticPicture, "loginButton/google.png")}
                      alt="Login with Google"
                    />
                  </IconButton>
                </Grid>
                <Grid item xs={3} textAlign="center">
                  <IconButton onClick={() => document.location.assign("/auth/loginWithTwitter")}>
                    <Avatar
                      style={{ border: "1px white solid", height: "50px", width: "50px" }}
                      src={makeS3Link(s3LinkCategory.staticPicture, "loginButton/twitter.png")}
                      alt="Login with Stripe"
                    />
                  </IconButton>
                </Grid>
              </Grid>
              <Grid item xs={12} container justify="flex-end" spacing={1}>
                <Grid item>
                  <Typography variant="subtitle2">Don&apos;t have an account ?</Typography>
                </Grid>
                <Grid item>
                  <Link component={RouterLink} to="/signup" variant="subtitle2">
                    Sign Up
                  </Link>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle2">Or</Typography>
                </Grid>
                <Grid item>
                  <Link component={RouterLink} to="/" variant="subtitle2">
                    Continue as a visitor
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={1} lg={4} />
      </Grid>
    </>
  );
}

LoginPageContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loginStatus: PropTypes.string,
  jwt: PropTypes.shape({
    raw: PropTypes.string.isRequired,
    header: PropTypes.object.isRequired,
    payload: PropTypes.object.isRequired,
  }),
};

LoginPageContainer.defaultProps = {
  loginStatus: "",
  jwt: undefined,
};

const mapStateToProps = (state) => ({
  loginStatus: state.application.loginStatus,
  jwt: state.application.jwt,
});

export default connect(mapStateToProps)(LoginPageContainer);
