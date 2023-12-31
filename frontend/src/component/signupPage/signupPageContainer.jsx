// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
// MUI
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import PersonIcon from "@mui/icons-material//Person";
import LockIcon from "@mui/icons-material//Lock";
import Button from "@mui/material/Button";
import AlternateEmailIcon from "@mui/icons-material//AlternateEmail";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
// Saltymotion
import { signupUser } from "../../lib/api/saltymotionApi";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import PrivacyPolicy from "../aboutPage/privacyPolicy";
import TermsOfUse from "../aboutPage/termsOfUse";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";

const FALLBACK_COUNTRY_CODE = "fr";
const FALLBACK_TIMEZONE = "Europe/Paris";
const EMAIL_REGEX = "^[a-zA-Z0-9.!#$%&amp;’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$";

/**
 * Render the Signup page
 * @param {function} dispatch
 * @return {JSX.Element}
 * @constructor
 */
function SignupPageContainer({ dispatch }) {
  const [isTosOpen, setIsTosOpen] = React.useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [timezone, setTimezone] = React.useState(FALLBACK_TIMEZONE);
  const [countryCode, setCountryCode] = React.useState(FALLBACK_COUNTRY_CODE);
  const [isSigning, setIsSigning] = React.useState(false);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  /**
   * On mount get user location
   */
  React.useEffect(() => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.ipdata.co?api-key=2479ddee66a7380e8bcbbe300677d5a6b8d4c4136fae839042030e7b");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.addEventListener("load", () => {
      // eslint-disable-next-line camelcase
      const { time_zone, country_code } = JSON.parse(xhr.response);
      // eslint-disable-next-line camelcase
      setTimezone(time_zone?.name ?? FALLBACK_TIMEZONE);
      // eslint-disable-next-line camelcase
      setCountryCode(country_code ?? FALLBACK_COUNTRY_CODE);
    });
    return () => xhr.abort();
  }, []);

  const onSignup = (evt) => {
    evt.preventDefault();
    const [signupPromise] = signupUser({
      username,
      email,
      password,
      timezone,
      countryCode,
    });
    signupPromise
      .then(() => {
        dispatch(setStatusMessage("We sent you an email, please follow the link in there to confirm your account"));
      })
      .catch(({ err }) => {
        console.error(err);
        dispatch(setErrorMessage(`Error while signing up: ${err}`));
      })
      .finally(() => setIsSigning(false));
    setIsSigning(true);
  };

  return (
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
            <Grid item xs={2} />
            <Grid item xs={8} container alignItems="center">
              <Grid item xs={3}>
                <img
                  crossOrigin="anonymous"
                  src={makeS3Link(
                    s3LinkCategory.staticPicture,
                    isDarkMode ? "transparentLogo.png" : "saltyLogoDarkBackground.png",
                  )}
                  alt="logo"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={9}>
                <Typography variant="h4">Saltymotion</Typography>
              </Grid>
            </Grid>
            <Grid item xs={2} />
            <Grid item xs={12}>
              <form onSubmit={(evt) => onSignup(evt)} method="post">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      InputProps={{
                        type: "text",
                        autoComplete: "username",
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                      name="username"
                      required
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      label="Username"
                      placeholder="Pick a username"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      InputProps={{
                        autoComplete: "email",
                        type: "email",
                        startAdornment: (
                          <InputAdornment position="start">
                            <AlternateEmailIcon />
                          </InputAdornment>
                        ),
                      }}
                      name="email"
                      error={email.length !== 0 && email.match(EMAIL_REGEX) === null}
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      label="Email"
                      placeholder="Type your email"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      InputProps={{
                        type: "password",
                        autoComplete: "new-password",
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                      }}
                      name="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      label="Password"
                      placeholder="Type a password"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <input type="hidden" name="timezone" value={timezone} />
                    <input type="hidden" name="countryCode" value={countryCode} />
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
                      Sign Up
                    </Button>
                    {isSigning && <CircularProgress style={{ position: "relative", left: "calc(50% - 20px)" }} />}
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid item xs={12} container justify="flex-end" spacing={1}>
              <Grid item>
                <Typography variant="subtitle2">Already have an account ?</Typography>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/login" variant="subtitle2">
                  Log in
                </Link>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} style={{ textAlign: "center" }}>
              <Typography variant="subtitle2" color="textSecondary" component="span">
                By Signing Up you acknowledge that you have read and agree with the
              </Typography>
              <Typography
                variant="subtitle2"
                onClick={() => setIsPrivacyPolicyOpen(true)}
                component="span"
                style={{ padding: 4, cursor: "pointer" }}
              >
                Privacy policy
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" component="span">
                and our
              </Typography>
              <Typography
                variant="subtitle2"
                onClick={() => setIsTosOpen(true)}
                component="span"
                style={{ padding: 4, cursor: "pointer" }}
              >
                Terms of use
              </Typography>
            </Grid>
            <Dialog open={isTosOpen} onClose={() => setIsTosOpen(false)}>
              <DialogContent>
                <TermsOfUse />
              </DialogContent>
            </Dialog>
            <Dialog open={isPrivacyPolicyOpen} onClose={() => setIsPrivacyPolicyOpen(false)}>
              <DialogContent>
                <PrivacyPolicy />
              </DialogContent>
            </Dialog>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={1} lg={4} />
    </Grid>
  );
}

SignupPageContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(SignupPageContainer);
