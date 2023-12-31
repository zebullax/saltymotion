// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
// MUI
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PersonIcon from "@mui/icons-material//Person";
import SupervisorAccountIcon from "@mui/icons-material//SupervisorAccount";
import NotificationsIcon from "@mui/icons-material//Notifications";
import MonetizationOnIcon from "@mui/icons-material//MonetizationOn";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
// Saltymotion
import ReviewerProfileTab from "./reviewerProfileTab";
import WalletTab from "./walletTab";
import UserProfileTab from "./userProfileTab";
import { parseQueryString } from "../../lib/utility";
import NotificationTab from "./notificationTab";
import { updateUserProfile } from "../../lib/api/saltymotionApi";
import { linkStripeAccount, setUser } from "../../state/userProfile/action";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";
import { userProfilePropTypes } from "../../../typedef/propTypes";

const tab = {
  general: { ID: 0, label: "general" },
  reviewer: { ID: 1, label: "reviewer" },
  wallet: { ID: 2, label: "wallet" },
  notification: { ID: 3, label: "notification" },
};

/**
 * Container for the page user profile
 * @param {function} dispatch
 * @param {UserProfile} userProfile
 * @param {boolean} isProfileUpdateInProgress
 * @return {JSX.Element}
 * @constructor
 */
function ProfilePageContainer({ userProfile, dispatch, isProfileUpdateInProgress }) {
  const location = useLocation();
  const theme = useTheme();
  const history = useHistory();
  const { category } = useParams();

  const [queryParameters] = React.useState(parseQueryString(location.search));
  const [isSavingInProgress, setIsSavingInProgress] = React.useState(false);
  // User notification state
  const [isNotifyOnReviewOpportunity, setIsNotifyOnReviewOpportunity] = React.useState(
    userProfile.notificationPreference.isNotifyOnReviewOpportunity,
  );
  const [isNotifyOnReviewComplete, setIsNotifyOnReviewComplete] = React.useState(
    userProfile.notificationPreference.isNotifyOnReviewComplete,
  );
  const [isNotifyOnNewComment, setIsNotifyOnNewComment] = React.useState(
    userProfile.notificationPreference.isNotifyOnNewComment,
  );
  const [isNotifyOnFavoriteActivity, setIsNotifyOnFavoriteReview] = React.useState(
    userProfile.notificationPreference.isNotifyOnFavoriteActivity,
  );

  React.useEffect(() => {
    if (queryParameters?.linkStripeAccountStatus === "ok") {
      const { ID } = queryParameters;
      dispatch(linkStripeAccount(ID));
    } else if (queryParameters?.linkStripeAccountStatus === "error") {
      dispatch(setErrorMessage("Your Stripe account was not connected"));
    }
  }, [queryParameters, dispatch]);

  const onSaveNotificationPreference = () => {
    const notificationPreference = {
      isNotifyOnFavoriteActivity,
      isNotifyOnNewComment,
      isNotifyOnReviewComplete,
      isNotifyOnReviewOpportunity,
    };
    const [updatePromise] = updateUserProfile({ userID: userProfile.ID, notificationPreference });
    updatePromise
      .then((updatedProfile) => {
        dispatch(setStatusMessage("Notification preference successfully updated"));
        dispatch(setUser(updatedProfile));
      })
      .catch((err) => {
        console.error(err);
        dispatch(setErrorMessage("Error while updating notification preference"));
      })
      .finally(() => {
        setIsSavingInProgress(false);
      });
    setIsSavingInProgress(true);
  };

  // FIXME userprofile props is not refreshed even after IO persist and reload !
  const isNotificationPreferenceDirty = () =>
    isNotifyOnFavoriteActivity !== userProfile.notificationPreference.isNotifyOnFavoriteActivity ||
    isNotifyOnNewComment !== userProfile.notificationPreference.isNotifyOnNewComment ||
    isNotifyOnReviewComplete !== userProfile.notificationPreference.isNotifyOnReviewComplete ||
    isNotifyOnReviewOpportunity !== userProfile.notificationPreference.isNotifyOnReviewOpportunity;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h2" style={{ fontWeight: "bold" }} component="h1">
          User profile
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Tabs onChange={(evt, value) => history.push(`/profile/${tab[value].label}`)} value={category}>
          <Tab
            disabled={isSavingInProgress}
            value={tab.general.label}
            label={tab.general.label}
            icon={<PersonIcon />}
          />
          <Tab
            disabled={isSavingInProgress}
            value={tab.reviewer.label}
            label={tab.reviewer.label}
            icon={<SupervisorAccountIcon />}
          />
          <Tab
            disabled={isSavingInProgress}
            value={tab.wallet.label}
            label={tab.wallet.label}
            icon={<MonetizationOnIcon />}
          />
          <Tab
            disabled={isSavingInProgress}
            value={tab.notification.label}
            label={tab.notification.label}
            icon={<NotificationsIcon />}
          />
        </Tabs>
      </Grid>
      <Grid item xs={12} alignItems="flex-start">
        <Container maxWidth="md">
          <UserProfileTab isHidden={category !== tab.general.label} isSaveInProgress={isProfileUpdateInProgress} />
          <ReviewerProfileTab userProfile={userProfile} isHidden={category !== tab.reviewer.label} />
          <WalletTab isHidden={category !== tab.wallet.label} />
          <NotificationTab
            isHidden={category !== tab.notification.label}
            isSaveEnabled={isNotificationPreferenceDirty()}
            onSaveNotificationPreference={onSaveNotificationPreference}
            onNotifyOnReviewOpportunity={setIsNotifyOnReviewOpportunity}
            isNotifyOnReviewOpportunity={isNotifyOnReviewOpportunity}
            onNotifyOnNewComment={setIsNotifyOnNewComment}
            isNotifyOnNewComment={isNotifyOnNewComment}
            onNotifyOnReviewComplete={setIsNotifyOnReviewComplete}
            isNotifyOnReviewComplete={isNotifyOnReviewComplete}
            onNotifyOnFavoriteActivity={setIsNotifyOnFavoriteReview}
            isNotifyOnFavoriteActivity={isNotifyOnFavoriteActivity}
          />
        </Container>
      </Grid>
    </Grid>
  );
}

ProfilePageContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userProfile: userProfilePropTypes.isRequired,
  isProfileUpdateInProgress: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
  isProfileUpdateInProgress: state.application.userProfileUpdateStatus === ApiCallStatus.COMPLETE,
});

export default connect(mapStateToProps)(ProfilePageContainer);
