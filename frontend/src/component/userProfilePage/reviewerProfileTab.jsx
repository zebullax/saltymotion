// React
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import ExitToAppIcon from "@mui/icons-material//ExitToApp";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
// Saltymotion
import AutocompleteGame from "../autocomplete/autocompleteGame";
import { ReviewerProfileGameCard, ReviewerProfileGameCardSkeleton } from "../widget/gameCard";
import { MAXIMUM_NB_GAMES_REVIEWABLE_POOL } from "../../lib/property";
import { userProfilePropTypes } from "../../../typedef/propTypes";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import GameHook from "../../lib/hooks/game";
import LoadingScreen from "../placeholder/loadingScreen";
import { updateUserProfile } from "../../lib/api/saltymotionApi";
import { setErrorMessage } from "../../state/app/action";
import { unlinkStripeAccount } from "../../state/userProfile/action";
import { ApiCallStatus } from "../../lib/api/xhrWrapper";

const ReviewerProfileTab = ({ userProfile, dispatch, isHidden, isUpdateInProgress }) => {
  const theme = useTheme();

  const [games, isLoadingGames] = GameHook.useLoader({
    normalizer: React.useCallback((loadedGames) => loadedGames.map((game) => ({ ...game, minimumBounty: 1 })), []),
  });

  const [isUpdateGamePoolEnabled, setIsUpdateGamePoolEnabled] = React.useState(false);
  const [selectedGames, setSelectedGames] = React.useState(userProfile.gamePool);
  const [selfIntroduction, setSelfIntroduction] = React.useState(userProfile.selfIntroduction);

  /**
   * Handle user selecting a game to add in pool of reviewable games
   * @param {[{ID: number, name: string}]} updatedSelection
   */
  const onGameSelect = (updatedSelection) => {
    if (selectedGames.length === MAXIMUM_NB_GAMES_REVIEWABLE_POOL) {
      return;
    }
    setSelectedGames(updatedSelection);
    setIsUpdateGamePoolEnabled(true);
  };

  /**
   * Update minimum bounty for a game in reviewer pool
   * @param {number} gameID
   * @param {number} minimumBounty
   */
  const onMinimumBountyChange = (gameID, minimumBounty) => {
    const idx = selectedGames.findIndex((value) => value.ID === gameID);
    if (idx === -1) {
      return;
    }
    const updatedSelectedGames = [...selectedGames];
    updatedSelectedGames[idx].minimumBounty = minimumBounty;
    setSelectedGames(updatedSelectedGames);
    setIsUpdateGamePoolEnabled(true);
  };

  /**
   * Update the game pool
   */
  const onUpdateGamePool = () => {
    dispatch(
      updateUserProfile({
        userID: userProfile.ID,
        gamePool: selectedGames,
      }),
    );
  };

  /**
   * Handle user removing game from pool of reviewable games
   * @param {number} gameID
   */
  const onGameRemove = (gameID) => {
    const idx = selectedGames.findIndex((value) => value.ID === gameID);
    if (idx === -1) {
      dispatch(setErrorMessage("Game to remove not found"));
      return;
    }
    const updatedSelectedGames = [...selectedGames];
    updatedSelectedGames.splice(idx, 1);
    setSelectedGames(updatedSelectedGames);
    setIsUpdateGamePoolEnabled(true);
  };

  const gamePoolPlaceholderCards = (selectedGamesLength) =>
    [...Array(MAXIMUM_NB_GAMES_REVIEWABLE_POOL - selectedGamesLength).keys()].map((val, idx) => (
      <Grid item xs={6} sm={4} md={2} key={idx + selectedGamesLength}>
        <ReviewerProfileGameCardSkeleton />
      </Grid>
    ));

  const gamePoolSelectedCards = (poolGames) =>
    poolGames.map((game) => (
      <Grid key={game.ID} item xs={6} sm={4} md={2}>
        <ReviewerProfileGameCard onMinimumBountyChange={onMinimumBountyChange} onDelete={onGameRemove} game={game} />
      </Grid>
    ));

  const onUpdateReviewerSelfIntroduction = () =>
    dispatch(
      updateUserProfile({
        userID: userProfile.ID,
        selfIntroduction: selfIntroduction.trim(),
      }),
    );

  return (
    <Grid container hidden={isHidden} spacing={1}>
      <LoadingScreen loadingText="LoadingGames" isOpen={isLoadingGames} />
      <LoadingScreen loadingText="Saving profile" isOpen={isUpdateInProgress} />
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12} style={{ marginBottom: theme.spacing(1) }}>
            <Typography variant="h6" component="span">
              Self introduction
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              This is used when our users look for a reviewer, so write here what you want to share with players. Who
              are you, your process to analyse gameplay, how long you usually take to review a replay, etc...
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="filled"
              multiline
              InputProps={{ disableUnderline: true }}
              rows={5}
              hiddenLabel
              aria-label="Self introduction"
              onChange={(e) => setSelfIntroduction(e.target.value)}
              value={selfIntroduction}
              fullWidth
            />
          </Grid>
          <Grid item container xs={12} style={{ justifyContent: "flex-end" }}>
            <Grid item>
              <Button
                variant="contained"
                disabled={isUpdateInProgress || selfIntroduction.trim() === userProfile.selfIntroduction}
                onClick={onUpdateReviewerSelfIntroduction}
                color="primary"
              >
                Update Self Introduction
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ marginBottom: theme.spacing(4) }}>
            <Divider />
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          <Grid item xs={12} style={{ marginBottom: theme.spacing(1) }}>
            <Typography variant="h6" component="span">
              Game pool
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Select up to 6 games you feel you can review and make people progress. Once those games are added here,
              users will be able to pick you to review any of those. You also need to tell us what is the minimal bounty
              you would accept to review those games.
            </Typography>
          </Grid>
          <Grid item xs={6} md={4}>
            <AutocompleteGame
              isMultiple
              isLoading={isLoadingGames}
              isTagHidden
              isDisabled={selectedGames.length === MAXIMUM_NB_GAMES_REVIEWABLE_POOL}
              placeholder="Add a game"
              isGameAvatarVisible={false}
              availableGames={isLoadingGames ? [] : games}
              selectedGames={selectedGames}
              onGameSelect={onGameSelect}
            />
          </Grid>
          <Grid item xs={6} md={8} />
          {gamePoolSelectedCards(selectedGames)}
          {gamePoolPlaceholderCards(selectedGames.length)}
          <Grid item xs={8} />
          <Grid item xs={4} style={{ display: "flex", justifyContent: "flex-end", marginBottom: theme.spacing(2) }}>
            <Button
              variant="contained"
              disabled={isUpdateInProgress || !isUpdateGamePoolEnabled}
              onClick={onUpdateGamePool}
              color="primary"
            >
              Update game pool
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} style={{ marginBottom: theme.spacing(4) }}>
          <Divider />
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: theme.spacing(1) }}>
        <Typography variant="h6" component="h2">
          Payment
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {/* eslint-disable-next-line max-len */}
          Make sure that your Stripe Connect account is linked here otherwise we won&apos;t be able to pay you your
          bounties. Keep in mind that bounties are paid once a month and only when the total is over a threshold.
        </Typography>
      </Grid>
      <Grid item xs={12} container spacing={1} style={{ justifyContent: "flex-end" }}>
        {userProfile.isStripeAccountLinked && (
          <>
            <Grid item style={{ alignSelf: "flex-end" }}>
              <Typography variant="h6" component="h3" color="secondary">
                Your Stripe account is currently linked.
              </Typography>
            </Grid>
            <Grid item style={{ alignSelf: "flex-end" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => dispatch(unlinkStripeAccount(userProfile.ID))}
                startIcon={<ExitToAppIcon />}
              >
                Unlink
              </Button>
            </Grid>
          </>
        )}
        {!userProfile.isStripeAccountLinked && (
          <Grid item>
            <Button
              startIcon={
                <Avatar
                  style={{ height: "50px", width: "50px" }}
                  src={makeS3Link(s3LinkCategory.staticPicture, "loginButton/stripe.png")}
                  alt="Login with Stripe"
                />
              }
              variant="outlined"
              color="primary"
              onClick={() => Document.location.assign("/auth/linkStripeAccount")}
            >
              Connect your stripe account
            </Button>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

ReviewerProfileTab.propTypes = {
  isHidden: PropTypes.bool.isRequired,
  userProfile: userProfilePropTypes.isRequired,
  isUpdateInProgress: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
  isUpdateInProgress: state.application.userProfileUpdateStatus === ApiCallStatus.IN_PROGRESS,
});

export default connect(mapStateToProps)(ReviewerProfileTab);
