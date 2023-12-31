// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
// MUI
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import ReplayIcon from "@mui/icons-material//Replay";
import CloudUploadIcon from "@mui/icons-material//CloudUpload";
import Modal from "@mui/material/Modal";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Fab from "@mui/material/Fab";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
// Misc
import { Helmet } from "react-helmet";
// Saltymotion
import { tagPropTypes, userProfilePropTypes } from "../../../typedef/propTypes";
import {
  abort,
  addReviewer,
  buildInitialState,
  createAtelierStateReducer as viewReducer,
  loadReviewer,
  removeReviewer,
  resetCharacteristics,
  setVideoURL,
  submit,
  updateCharacteristics,
  updateReviewerBounty,
} from "./state";
import { AUTO_COMPLETION_THRESHOLD, MAX_CANDIDATE_REVIEWERS } from "../../lib/property";
import { ReviewerCardWithBountyV2, ReviewerCardWithBountyV2Skeleton } from "../widget/reviewerCard";
import AutocompleteGame from "../autocomplete/autocompleteGame";
import AutocompleteReviewer from "../autocomplete/autocompleteReviewer";
import { searchReviewer } from "../../lib/api/saltymotionApi";
import AutocompleteTag from "../autocomplete/autocompleteTag";
import FileSelector from "../widget/fileSelector";
import { setErrorMessage } from "../../state/app/action";

/**
 * Render the redirection to new atelier dialog
 * @param {number} atelierID
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onAccept
 * @return {JSX.Element}
 * @constructor
 */
function RedirectionDialog({ atelierID, isOpen, onClose, onAccept }) {
  return (
    <Dialog keepMounted open={isOpen} onClose={onClose}>
      <DialogTitle>Check your newly created atelier ?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Atelier {atelierID ?? ""} was created successfully, do you want to check it out ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onAccept} color="primary">
          Go
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RedirectionDialog.propTypes = {
  atelierID: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
};

RedirectionDialog.defaultProps = {
  atelierID: undefined,
};

/**
 * Helper to pick the minimum bounty from the game pool
 * @param {Game[]} gamePool
 * @param {number} gameID
 * @return {number}
 */
function findMinBounty(gamePool, gameID) {
  const gameIdx = gamePool.findIndex((game) => game.ID === gameID);
  return gamePool[gameIdx].minimumBounty;
}

/**
 * Render the create atelier page
 * @param {number} autoCompletionThreshold
 * @param {Object} [initialStateOverride]
 * @param {UserProfile} userProfile
 * @param {Game[]} games
 * @param {Tag[]} tags
 * @param {function} dispatch
 * @return {JSX.Element}
 * @constructor
 */
function CreateWorkshopPageContainer({
  autoCompletionThreshold,
  initialStateOverride,
  userProfile,
  games,
  tags,
  dispatch,
}) {
  const theme = useTheme();
  const history = useHistory();
  const isDownLg = useMediaQuery(theme.breakpoints.down("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"));

  const [viewState, viewDispatch] = React.useReducer(viewReducer, buildInitialState(initialStateOverride));
  // We don't keep this in reducer as we don't want to clone it every time
  const [videoFile, setVideoFile] = React.useState(undefined);

  const [autocompleteReviewersOptions, setAutocompleteReviewersOptions] = React.useState([]);
  const [autocompleteReviewerInputValue, setAutocompleteReviewerInputValue] = React.useState("");
  const [atelierID, setAtelierID] = React.useState(undefined);
  const [isGotoAtelierDialogOpen, setIsGotoAtelierDialogOpen] = React.useState(false);
  const [isLoadingReviewersOption, setIsLoadingReviewersOption] = React.useState(false);

  /**
   * @param {FileList} file
   */
  const onVideoFileSelect = (file) => {
    if (file.length === 0) {
      return;
    }
    setVideoFile(file[0]);
    viewDispatch(setVideoURL(window.URL.createObjectURL(file[0])));
  };

  /**
   * @callback
   * @type {(function(error) | function(undefined, Reviewer))}
   */
  const onReviewerLoad = React.useCallback(
    (err, reviewer) => {
      if (err) {
        console.error(err);
        dispatch(setErrorMessage("Error while loading reviewer profile"));
      } else {
        viewDispatch(addReviewer(reviewer));
      }
      setAutocompleteReviewerInputValue("");
      setAutocompleteReviewersOptions([]);
    },
    [dispatch, viewDispatch, setAutocompleteReviewerInputValue, setAutocompleteReviewersOptions],
  );

  /**
   * Handle autocomplete input selection for reviewer
   * @param {object} selectedReviewer
   */
  const onReviewerSelect = (selectedReviewer) => {
    if (selectedReviewer === null) {
      return;
    }
    if (selectedReviewer.ID === userProfile.ID) {
      dispatch(setErrorMessage("You can't select yourself as a reviewer"));
      return;
    }
    viewDispatch(loadReviewer(selectedReviewer.ID, onReviewerLoad));
  };

  /**
   * @param {number} reviewerID
   */
  const onReviewerDelete = (reviewerID) => {
    viewDispatch(removeReviewer(reviewerID));
  };

  /**
   * @callback
   * @param {(Error|undefined)} err
   * @param {{ID: number}} result
   */
  const onSubmitComplete = React.useCallback(
    (err, result) => {
      if (err) {
        console.error(err);
        dispatch(setErrorMessage("Error while uploading atelier"));
        viewDispatch(abort());
      } else {
        viewDispatch(resetCharacteristics());
        setAtelierID(result.ID);
        setIsGotoAtelierDialogOpen(true);
      }
    },
    [dispatch, viewDispatch, setAtelierID, setIsGotoAtelierDialogOpen],
  );

  /**
   * Handle submission of atelier create
   */
  const onSubmitAtelierCreate = () => {
    viewDispatch(
      submit(
        {
          title: viewState.title,
          description: viewState.description,
          game: viewState.game,
          reviewers: viewState.reviewers,
          tags: viewState.tags,
          isPrivate: viewState.isPrivate,
        },
        videoFile,
        onSubmitComplete,
      ),
    );
  };

  /**
   * Handle input change on reviewer autocomplete input
   * If input length is over a threshold we ll look for that reviewer
   *   If found in the cache, that will be returned, otherwise we ll query server
   * @param {string} value
   * @param {string} reason
   */
  const onReviewerAutocompleteInputChange = (value, reason) => {
    // Not a user input change, skip
    if (reason !== "input") {
      if (reason === "clear") {
        setAutocompleteReviewerInputValue("");
      }
      return;
    }

    // Less than threshold characters we wont start auto-completing, we just update the input value
    if (value.length < autoCompletionThreshold) {
      setAutocompleteReviewersOptions([]);
      setAutocompleteReviewerInputValue(value);
      return;
    }
    const hint = value;
    const [getReviewerPromise] = searchReviewer({
      hint,
      gameID: viewState.game.ID,
      limit: undefined,
      offset: 0,
    });
    getReviewerPromise
      .then((reviewer) => {
        if (Object.keys(reviewer).length === 0) {
          setAutocompleteReviewersOptions([]);
        } else {
          setAutocompleteReviewersOptions([...reviewer]);
        }
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Unknown error while loading reviewers..."));
      })
      .finally(() => {
        setIsLoadingReviewersOption(false);
      });
    // Meanwhile, open the autocomplete input and display loading wheel
    setAutocompleteReviewerInputValue(value);
    setIsLoadingReviewersOption(true);
  };

  /**
   * Handle change on reviewer Bounty
   * @param {number} reviewerID
   * @param {string} bounty
   */
  const onReviewerBountyChange = (reviewerID, bounty) => {
    viewDispatch(updateReviewerBounty(reviewerID, Number.parseInt(bounty, 10)));
  };

  const header = () => {
    // eslint-disable-next-line max-len
    const content = "Create workshop, pick a game, select your video and some potential reviewers and get started";
    const title = "Saltymotion - Create workshop";
    return (
      <Helmet>
        <meta name="description" content={content} />
        <meta name="og:description" content={content} />
        <meta name="twitter:description" content={content} />
        <meta name="title" content={title} />
        <meta name="og:title" content={title} />
        <meta name="twitter:title" content={title} />
      </Helmet>
    );
  };

  const reviewerCards = () => {
    const reviewerPlaceholderCard = [];
    for (let i = 0; i !== MAX_CANDIDATE_REVIEWERS - viewState.reviewers.length; ++i) {
      reviewerPlaceholderCard.push(
        <Grid item xs={12} md={4} key={i}>
          <ReviewerCardWithBountyV2Skeleton />
        </Grid>,
      );
    }

    const selectedReviewerCard = viewState.reviewers.map((reviewer) => (
      <Grid item xs={12} md={4} key={reviewer.ID}>
        <ReviewerCardWithBountyV2
          onBountyUpdate={onReviewerBountyChange}
          onRemove={onReviewerDelete}
          defaultBounty={findMinBounty(reviewer.gamePool, viewState.game.ID)}
          bounty={reviewer.bounty}
          reviewer={reviewer}
        />
      </Grid>
    ));
    return (
      <>
        {selectedReviewerCard}
        {reviewerPlaceholderCard}
      </>
    );
  };

  return (
    <>
      <Grid container spacing={1}>
        {header()}
        <Modal
          style={{
            position: "fixed",
            right: "25%",
            top: "50%",
            left: "25%",
          }}
          open={viewState.isSubmitting}
        >
          <LinearProgress variant="indeterminate" />
        </Modal>
        <RedirectionDialog
          isOpen={isGotoAtelierDialogOpen}
          onAccept={() => history.push(`/workshop/${atelierID}`)}
          onClose={() => setIsGotoAtelierDialogOpen(false)}
          atelierID={atelierID}
        />
        <Grid item xs={12} style={{ paddingBottom: theme.spacing(2) }}>
          <Typography variant="h2" style={{ fontWeight: "bold" }} component="h1">
            Create workshop
          </Typography>
          <Grid container>
            <Typography variant="subtitle2" color="textSecondary" display="inline">
              Select a game, add some candidate reviewers, assign a loot, upload your video and wait for the review
            </Typography>
          </Grid>
          <Divider />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12} md={6} container spacing={1}>
          <Grid item>
            <Typography variant="h6">Basic information</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="atelierTitle"
              value={viewState.title}
              onChange={(evt) => viewDispatch(updateCharacteristics({ title: evt.target.value }))}
              placeholder="Enter a title for your video"
              label="Title"
              variant="filled"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="atelierDescription"
              multiline
              rows={3}
              value={viewState.description}
              onChange={(evt) => viewDispatch(updateCharacteristics({ description: evt.target.value }))}
              placeholder="Describe what you want to improve or focus on, what is special about this video"
              label="Description"
              variant="filled"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <AutocompleteGame
              onGameSelect={(game) => viewDispatch(updateCharacteristics({ game }))}
              isGameAvatarVisible
              isMultiple={false}
              isLoading={viewState.isLoadingGames}
              selectedGames={viewState.game}
              availableGames={games}
              placeholder="Game"
            />
          </Grid>
          <Grid item xs={12}>
            <AutocompleteTag
              id="tagInputID"
              maxTags={3}
              isLoading={viewState.isLoadingTags}
              selectedTags={viewState.tags.map((tag) => ({ ID: tag.ID, name: tag.name }))}
              onTagSelect={(selectedTags) => viewDispatch(updateCharacteristics({ tags: selectedTags }))}
              availableTags={tags.map((tag) => ({ ID: tag.ID, name: tag.name }))}
              placeholder={viewState.tags.length === 0 ? "Tags" : ""}
            />
          </Grid>
          <Grid item xs={12} container>
            <Grid item flexGrow={1}>
              <Typography variant="subtitle1" display="inline" sx={{ fontWeight: "bold", color: "primary.main" }}>
                {"\u00A0Private\u00A0"}
              </Typography>
              <Typography variant="subtitle1" display="inline">
                workshops can only be accessed by the reviewer and you.
              </Typography>
              {!isMobile && <br />}
              <Typography variant="subtitle1" display="inline" sx={{ fontWeight: "bold", color: "secondary.main" }}>
                {"\u00A0Public\u00A0"}
              </Typography>
              <Typography variant="subtitle1" display="inline">
                workshops are accessible by everybody.
              </Typography>
            </Grid>
            <Grid item flexGrow={isMobile ? 1 : 0} sx={{ paddingBottom: theme.spacing(2), textAlign: "right" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={viewState.isPrivate}
                    onChange={() => viewDispatch(updateCharacteristics({ isPrivate: !viewState.isPrivate }))}
                  />
                }
                label="Private"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6} container style={{ padding: theme.spacing(4) }}>
          {isDownLg && (
            <Grid item sx={{ width: "100%" }}>
              <Divider>Video</Divider>
            </Grid>
          )}
          {viewState.videoURL.length !== 0 ? (
            <Grid container>
              <video controls style={{ width: "100%", height: "100%", margin: "auto" }} src={viewState.videoURL} />
            </Grid>
          ) : (
            <FileSelector
              onFileSelected={onVideoFileSelect}
              helperText="Drop or click to select your replay video"
              selectOnlyHelperText="Select video"
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Reviewers</Typography>
        </Grid>
        <Grid item xs={12}>
          <AutocompleteReviewer
            onReviewerAutocompleteSelect={onReviewerSelect}
            onReviewerInputChange={onReviewerAutocompleteInputChange}
            isWaitingOnMoreCharacter={autocompleteReviewerInputValue.length < autoCompletionThreshold}
            selectedReviewers={viewState.reviewers}
            isLoading={isLoadingReviewersOption}
            disabled={viewState.game == null || viewState.reviewers.length === MAX_CANDIDATE_REVIEWERS}
            inputValue={autocompleteReviewerInputValue}
            reviewersOption={autocompleteReviewersOptions}
          />
        </Grid>
        <Grid item xs={12} container spacing={1}>
          {reviewerCards()}
        </Grid>
      </Grid>
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Grid container columns={2} spacing={2}>
          <Grid item xs={1}>
            <Fab color="secondary" aria-label="redo" onClick={() => viewDispatch(resetCharacteristics())}>
              <ReplayIcon />
            </Fab>
          </Grid>
          <Grid item xs={1}>
            <Fab
              color="primary"
              aria-label="create"
              onClick={onSubmitAtelierCreate}
              disabled={!viewState.isConstructable || viewState.isSubmitting}
            >
              <CloudUploadIcon />
            </Fab>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

CreateWorkshopPageContainer.propTypes = {
  autoCompletionThreshold: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  initialStateOverride: PropTypes.object,
  userProfile: userProfilePropTypes.isRequired,
  games: PropTypes.arrayOf(
    PropTypes.shape({
      ID: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      nbAtelier: PropTypes.number.isRequired,
    }),
  ).isRequired,
  tags: PropTypes.arrayOf(tagPropTypes).isRequired,
  dispatch: PropTypes.func.isRequired,
};

CreateWorkshopPageContainer.defaultProps = {
  autoCompletionThreshold: AUTO_COMPLETION_THRESHOLD,
  initialStateOverride: undefined,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(CreateWorkshopPageContainer);
