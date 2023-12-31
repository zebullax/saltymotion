// React
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// MUI
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Icon from "@mui/material/Icon";
import TwitterIcon from "@mui/icons-material//Twitter";
import CircularProgress from "@mui/material/CircularProgress";
import YouTubeIcon from "@mui/icons-material//YouTube";
import Button from "@mui/material/Button";
import LockIcon from "@mui/icons-material//Lock";
import SaveIcon from "@mui/icons-material//Save";
import { useTheme } from "@mui/material/styles";
import Modal from "@mui/material/Modal";
// Misc
import momentTZ from "moment-timezone";
import ISO6391 from "iso-639-1";
// Saltymotion
import ProfilePictureSelect from "./profilePictureSelect";
import { checkIsEmailValid, dirtyClone } from "../../lib/utility";
import PasswordDialog from "../password/passwordDialog";
import AutocompleteLanguage from "../autocomplete/autocompleteLanguage";
import { isoCountriesAsArray, resolveCountryCode } from "../../lib/countryCode";
import AutocompleteCountry from "../autocomplete/autocompleteCountry";
import AutocompleteTimezone from "../autocomplete/autocompleteTimezone";
import { userProfilePropTypes } from "../../../typedef/propTypes";
import { updateUserProfile } from "../../lib/api/saltymotionApi";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";

const k_DETECTED_TZ = momentTZ.tz.guess();
const k_AVAILABLE_TIMEZONES = momentTZ.tz.names();
const k_AVAILABLE_COUNTRY_CODE = isoCountriesAsArray;
const k_AVAILABLE_LANGUAGES = ISO6391.getAllNames().map((languageName) => ({
  isoCode: ISO6391.getCode(languageName),
  name: languageName,
}));

/**
 * Render the user profile tab
 * @param {boolean} isHidden
 * @param {function} dispatch
 * @param {UserProfile} userProfile
 * @param {boolean} isSaveInProgress
 * @return {JSX.Element}
 * @constructor
 */
function UserProfileTab({ isHidden, dispatch, userProfile, isSaveInProgress }) {
  const theme = useTheme();

  const { ID, registrationDate, isOauth, name, email, timezone, countryCode, snsAccounts, languages } = userProfile;

  const [workingProfile, setWorkingProfile] = React.useState({
    email,
    timezone,
    countryCode,
    languages: dirtyClone(languages),
    snsAccounts: dirtyClone(snsAccounts),
  });

  const [profilePictureFile, setProfilePictureFile] = React.useState(undefined);
  const [isUpdatePasswordDialogOpen, setIsUpdatePasswordDialogOpen] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [isProfileDirty, setIsProfileDirty] = React.useState(false);

  React.useEffect(() => {
    setIsProfileDirty(
      email !== workingProfile.email ||
        timezone !== workingProfile.timezone ||
        countryCode !== workingProfile.countryCode ||
        JSON.stringify(snsAccounts) !== JSON.stringify(workingProfile.snsAccounts) ||
        JSON.stringify(languages) !== JSON.stringify(workingProfile.languages) ||
        profilePictureFile !== undefined,
    );
  }, [email, timezone, countryCode, snsAccounts, languages, workingProfile, profilePictureFile]);

  // Once user Profile updates we ll need to update our working copy
  React.useEffect(() => {
    setWorkingProfile({
      email,
      timezone,
      countryCode,
      languages: dirtyClone(languages),
      snsAccounts: dirtyClone(snsAccounts),
    });
  }, [email, timezone, countryCode, snsAccounts, languages]);

  /**
   * Handle select a profile picture
   * @param {FileList} selectedFiles
   */
  const onProfilePictureFileSelect = (selectedFiles) => {
    if (selectedFiles.length !== 1) {
      return;
    }
    setProfilePictureFile(selectedFiles[0]);
  };

  /**
   * Send request to update user profile
   */
  const onSaveUserProfile = () => {
    dispatch(
      updateUserProfile({
        userID: ID,
        languages: workingProfile.languages,
        timezone: workingProfile.timezone,
        countryCode: workingProfile.countryCode,
        email: workingProfile.email,
        snsAccounts: workingProfile.snsAccounts,
        picture: profilePictureFile ? new Blob([profilePictureFile]) : undefined,
      }),
    );
    setProfilePictureFile(undefined);
  };

  /**
   * Send request to update a password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  const onUpdatePassword = (currentPassword, newPassword) => {
    const [updatePwdPromise] = updateUserProfile({ userID: ID, currentPassword, newPassword });
    updatePwdPromise
      .then(() => {
        setIsUpdatePasswordDialogOpen(false);
        dispatch(setStatusMessage("Password updated successfully"));
      })
      .catch(() => {
        dispatch(setErrorMessage("Error while updating the password"));
      })
      .finally(() => setIsUpdatingPassword(false));
    setIsUpdatingPassword(true);
  };

  return (
    <Grid container hidden={isHidden} spacing={2}>
      <Modal open={isSaveInProgress}>
        <Grid container justify="center" style={{ height: "100%" }}>
          <Grid item style={{ alignSelf: "center" }}>
            <CircularProgress color="inherit" />
            <Typography display="inline" color="textPrimary" variant="h5" style={{ marginLeft: theme.spacing(1) }}>
              Saving profile...
            </Typography>
          </Grid>
        </Grid>
      </Modal>
      <PasswordDialog
        isOpen={isUpdatePasswordDialogOpen}
        isOauth={isOauth}
        onSubmit={onUpdatePassword}
        isSaving={isUpdatingPassword}
        onClose={() => setIsUpdatePasswordDialogOpen(false)}
      />
      <Grid item xs={12} sm={3} md={4} style={{ justifyContent: "center" }}>
        <ProfilePictureSelect
          name={name}
          profilePictureFile={profilePictureFile}
          s3Key={ID}
          registrationDate={registrationDate}
          onChange={(event) => onProfilePictureFileSelect(event.target.files)}
        />
      </Grid>
      <Grid item xs={12} sm={9} md={8}>
        <Paper style={{ padding: theme.spacing(1) }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h1">
                Profile
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={6}>
              <TextField disabled label="Name" defaultValue={name} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="email"
                onChange={(evt) => setWorkingProfile({ ...workingProfile, ...{ email: evt.target.value } })}
                error={!checkIsEmailValid(workingProfile.email)}
                value={workingProfile.email}
              />
            </Grid>
            <Grid item xs={6}>
              <AutocompleteTimezone
                availableTimezones={k_AVAILABLE_TIMEZONES}
                value={workingProfile.timezone}
                defaultTimezone={k_DETECTED_TZ}
                onChange={(evt, value) => setWorkingProfile({ ...workingProfile, ...{ timezone: value } })}
              />
            </Grid>
            <Grid item xs={6}>
              <AutocompleteCountry
                availableCountryCodes={k_AVAILABLE_COUNTRY_CODE}
                value={{
                  cCode: workingProfile.countryCode,
                  name: resolveCountryCode(workingProfile.countryCode),
                }}
                onChange={(evt, value) => setWorkingProfile({ ...workingProfile, ...{ countryCode: value.cCode } })}
              />
            </Grid>
            <Grid item xs={12}>
              <AutocompleteLanguage
                isFullWidth
                selectedLanguages={workingProfile.languages}
                isSmallChip
                availableLanguages={k_AVAILABLE_LANGUAGES}
                onChange={(values) => setWorkingProfile({ ...workingProfile, ...{ languages: values } })}
              />
            </Grid>
          </Grid>
        </Paper>
        <Paper style={{ padding: theme.spacing(2), marginTop: theme.spacing(2) }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h4">
                SNS presence
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={4}>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon>
                        <Icon className="fab fa-twitch" />
                      </Icon>
                    </InputAdornment>
                  ),
                }}
                value={workingProfile.snsAccounts.twitchName}
                onChange={(event) =>
                  setWorkingProfile({
                    ...workingProfile,
                    snsAccounts: {
                      ...workingProfile.snsAccounts,
                      twitchName: event.target.value,
                    },
                  })
                }
                name="twitchName"
                label="Twitch"
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TwitterIcon />
                    </InputAdornment>
                  ),
                }}
                value={workingProfile.snsAccounts.twitterName}
                onChange={(event) =>
                  setWorkingProfile({
                    ...workingProfile,
                    snsAccounts: {
                      ...workingProfile.snsAccounts,
                      twitterName: event.target.value,
                    },
                  })
                }
                name="twitterName"
                label="Twitter"
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <YouTubeIcon />
                    </InputAdornment>
                  ),
                }}
                value={workingProfile.snsAccounts.youtubeName}
                onChange={(event) =>
                  setWorkingProfile({
                    ...workingProfile,
                    snsAccounts: {
                      ...workingProfile.snsAccounts,
                      youtubeName: event.target.value,
                    },
                  })
                }
                name="youtubeName"
                label="Youtube"
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>
        <Grid container spacing={1} style={{ marginTop: theme.spacing(1) }} justify="flex-end">
          <Grid item style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() => setIsUpdatePasswordDialogOpen(true)}
              color="primary"
              startIcon={<LockIcon />}
            >
              Password
            </Button>
          </Grid>
          <Grid item style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              disabled={isSaveInProgress || !isProfileDirty}
              onClick={onSaveUserProfile}
              color="secondary"
              startIcon={<SaveIcon />}
            >
              Update profile
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item sm={1} md={1} lg={3} />
    </Grid>
  );
}

UserProfileTab.propTypes = {
  isHidden: PropTypes.bool.isRequired,
  isSaveInProgress: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  userProfile: userProfilePropTypes.isRequired,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(UserProfileTab);
