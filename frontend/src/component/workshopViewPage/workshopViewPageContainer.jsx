// React/Redux
import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";
// MUI
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material//Close";
import CheckIcon from "@mui/icons-material//Check";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
// Saltymotion
import WorkshopCommentContainer from "./WorkshopCommentContainer";
import AboutUploaderTab from "./aboutUploaderTab";
import AboutReviewerTab from "./aboutReviewerTab";
import { atelierPropTypes, userProfilePropTypes } from "../../../typedef/propTypes";
import Tag from "../widget/tag";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import { AtelierStatus } from "../../lib/atelierStatus";
import { RecommendedWorkshop } from "../widget/atelierCard";
import {
  getRecommendedAtelier,
  postAtelierAccept,
  postAtelierDecline,
  updateWorkshopRatings,
} from "../../lib/api/saltymotionApi";
import { RECOMMENDATION_LOAD_CHUNK_SIZE } from "../../lib/property";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";

const TAB_INDEX = {
  ABOUT_USER: 0,
  COMMENT: 1,
};

/**
 * Render the review opportunity dialog
 * @param {boolean} isCandidateReviewer
 * @param {boolean} isOpportunityDismissed
 * @param {function} onClose
 * @param {number} candidateBounty
 * @param {function} onAccept
 * @param {function} onDecline
 * @return {JSX.Element}
 */
function ReviewOpportunityDialog({
  isCandidateReviewer,
  isOpportunityDismissed,
  onClose,
  candidateBounty,
  onAccept,
  onDecline,
}) {
  return (
    <Dialog open={isCandidateReviewer && isOpportunityDismissed === false} onClose={onClose}>
      <DialogTitle>Review Opportunity</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography component="span">
            You&apos;ve been asked to review this match for a bounty of {candidateBounty}, you can accept or decline.
          </Typography>
          <Typography component="span">
            If you want to check the video first, just click away or press escape and have a look. Reload the page and
            that dialog will pop again (until you decline) !
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="text" size="small" color="primary" startIcon={<CheckIcon />} onClick={onAccept}>
          Accept
        </Button>
        <Button variant="text" color="secondary" size="small" startIcon={<CloseIcon />} onClick={onDecline}>
          Decline
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ReviewOpportunityDialog.propTypes = {
  isCandidateReviewer: PropTypes.bool.isRequired,
  isOpportunityDismissed: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  candidateBounty: PropTypes.number,
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};

/**
 * Container element for the view atelier page
 * @param {function} dispatch
 * @param {UserProfile} userProfile
 * @param {NormalizedAtelierDescription} atelier
 * @return {JSX.Element}
 * @constructor
 */
function WorkshopViewPageContainer({ dispatch, userProfile, atelier }) {
  const theme = useTheme();
  const history = useHistory();
  const isOverMD = useMediaQuery(theme.breakpoints.up("md"));
  const [currentTabIdx, setCurrentTabIdx] = React.useState(TAB_INDEX.ABOUT_USER);
  const { ID } = userProfile;
  const { ID: gameID } = atelier.game;
  const candidateIdx = atelier.auctions.findIndex((auction) => auction.ID === ID);

  const isComplete = atelier.currentStatus.ID === AtelierStatus.Complete;

  const [recommendedAteliers, setRecommendedAteliers] = React.useState([]);
  const [isAcceptingAuction, setIsAcceptingAuction] = React.useState(false);
  const [isDecliningAuction, setIsDecliningAuction] = React.useState(false);
  const [isCandidateReviewer, setIsCandidateReviewer] = React.useState(
    atelier.currentStatus.ID === AtelierStatus.InAuction && candidateIdx !== -1,
  );
  const [isOpportunityDismissed, setIsOpportunityDismissed] = React.useState(false);
  const candidateBounty = atelier.auctions[candidateIdx]?.bounty ?? null;
  // FIXME the workshop score should ultimately be sourced straight from the atelier property
  // FIXME BUT the hook in loader doesnt re-run on score update since ultimately the ID didnt change...
  const [isUpdatingScore, setIsUpdatingScore] = React.useState(false);

  // Load recommended ateliers on atelier change
  React.useEffect(() => {
    const [recommendationPromise, recommendationXHR] = getRecommendedAtelier({
      gameID,
      isShortFormat: false,
      offset: 0,
      limit: RECOMMENDATION_LOAD_CHUNK_SIZE,
    });
    recommendationPromise
      .then(({ value }) => {
        setRecommendedAteliers((currentRecommendations) => [...value, ...currentRecommendations]);
      })
      .catch((error) => {
        console.error(`Error while loading chunk of recommended atelier: ${error}`);
        dispatch(setErrorMessage("Error while loading chunk of recommended atelier"));
      });
    return () => recommendationXHR.abort();
  }, [dispatch, gameID]);

  /**
   * Process user acceptance to review an atelier
   */
  const acceptAtelierAuction = () => {
    if (!isCandidateReviewer || isAcceptingAuction) {
      return;
    }
    const [postAcceptAtelierPromise] = postAtelierAccept(atelier.ID);
    postAcceptAtelierPromise
      .then(() => {
        dispatch(setStatusMessage("Bounty successfully accepted, redirecting to review..."));
        // setTimeout(() => history.push(`/workshop/${atelier.ID}`, 1500)); // Same URL wont get refreshed
        setTimeout(() => document.location.assign(`/workshop/${atelier.ID}`, 1500));
      })
      .catch((error) => {
        console.error(`Error while accepting auction: ${error}`);
        dispatch(setErrorMessage("An error happened while accepting atelier bounty, please retry later...."));
      })
      .finally(() => {
        setIsAcceptingAuction(false);
      });
    setIsAcceptingAuction(true);
  };

  /**
   * Process user refusal to review an atelier
   */
  const declineAtelierAuction = () => {
    if (!isCandidateReviewer || isDecliningAuction) {
      return;
    }
    const [postDeclineAtelierPromise] = postAtelierDecline(atelier.ID);
    postDeclineAtelierPromise
      .then(() => {
        setIsCandidateReviewer(false);
        dispatch(setStatusMessage("Auction successfully declined, you will be redirected to top page shortly !"));
        setTimeout(() => history.push("/"), 3000);
      })
      .catch((error) => {
        console.error(`Error while declining auction: ${error}`);
        dispatch(setErrorMessage("An error happened while declining atelier, please retry later...."));
      })
      .finally(() => {
        setIsDecliningAuction(false);
      });
    setIsDecliningAuction(true);
  };

  /**
   * Update atelier score
   * @param {number} newScore
   */
  const updateAtelierRating = (newScore) => {
    if (isUpdatingScore) {
      return;
    }
    const [updateAtelierRatingPromise] = updateWorkshopRatings({ ID: atelier.ID, rating: newScore });
    updateAtelierRatingPromise
      .then(() => {})
      .catch((error) => {
        console.error(`Error while updating workshop score: ${error}`);
        dispatch(setErrorMessage("An error happened while updating workshop score, please retry later...."));
      })
      .finally(() => {
        setIsUpdatingScore(false);
      });
    setIsUpdatingScore(true);
  };

  const tags = (items) => items.map((tag) => <Tag key={tag.ID} size="small" name={tag.name} id={tag.ID} />);
  const header = () => {
    const content = atelier.title;
    const title = `Saltymotion - ${atelier.title}`;
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

  const recommendedVideos = (ateliers) =>
    ateliers.map((atelier) => (
      <Box style={{ paddingBottom: theme.spacing(2) }} key={atelier.ID}>
        <RecommendedWorkshop atelier={atelier} />
      </Box>
    ));

  return (
    <>
      {header()}
      <Grid container spacing={1}>
        <Grid
          item
          xs={12}
          container
          spacing={1}
          alignContent="flex-start"
          style={
            isOverMD
              ? {
                  paddingRight: theme.spacing(4),
                  flexGrow: 1,
                  maxWidth: "calc(100% - 400px)",
                }
              : {}
          }
        >
          <Grid item xs={12}>
            <ReviewOpportunityDialog
              isCandidateReviewer={isCandidateReviewer}
              isOpportunityDismissed={isOpportunityDismissed}
              onClose={() => setIsOpportunityDismissed(true)}
              candidateBounty={candidateBounty}
              onAccept={acceptAtelierAuction}
              onDecline={declineAtelierAuction}
            />
            <video
              controls
              autoPlay
              playsInline
              style={{ width: "100%" }}
              src={makeS3Link(isComplete ? s3LinkCategory.reviewVideo : s3LinkCategory.matchVideo, atelier.s3Key)}
            />
          </Grid>
          <Grid item xs={12} container spacing={1}>
            <Grid item xs={12} container>
              {isComplete && (
                <Grid item xs={6} md={10}>
                  <Typography variant="h6" component="h1">
                    {atelier.title}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={6} md={2} style={{ textAlign: "end" }}>
                {isComplete && atelier.uploader.ID === userProfile.ID && (
                  <Rating
                    name="atelier_rating"
                    onChange={(e, value) => updateAtelierRating(value)}
                    defaultValue={atelier.stats.score}
                  />
                )}
              </Grid>
              {!isComplete && (
                <Grid item xs={12}>
                  <Typography variant="h6" component="h1">
                    {atelier.title}
                  </Typography>
                </Grid>
              )}
              {atelier.description.length !== 0 && (
                <Grid item xs={12} sx={{ marginBottom: theme.spacing(3) }}>
                  <Typography variant="caption">{atelier.description}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Link component={RouterLink} to={`/game/${atelier.game.ID}`}>
                  {atelier.game.name}
                </Link>
              </Grid>
              <Grid item xs={12} container spacing={1}>
                <Grid item style={{ alignSelf: "flex-end" }}>
                  <Typography variant="caption">{atelier.stats.nbViews} views</Typography>
                </Grid>
                <Grid item style={{ alignSelf: "flex-end" }}>
                  <Typography variant="caption">•</Typography>
                </Grid>
                <Grid item style={{ alignSelf: "flex-end" }}>
                  <Typography variant="caption">{new Date(atelier.creationTimestamp).toDateString()}</Typography>
                </Grid>
                <Grid item className="tag_list" style={{ alignSelf: "flex-end" }}>
                  {tags(atelier.tags)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {/* Tab here ==> */}
          <Grid item xs={12}>
            <Tabs value={currentTabIdx} onChange={(evt, val) => setCurrentTabIdx(val)}>
              <Tab
                id="about-user-tab-ID"
                aria-controls="about-user-tabpanel-ID"
                label={`About the ${isComplete ? "reviewer" : "uploader"}`}
                value={TAB_INDEX.ABOUT_USER}
              />
              <Tab
                id="comments-tab-ID"
                aria-controls="comments-tabpanel-ID"
                label="Comments"
                value={TAB_INDEX.COMMENT}
              />
            </Tabs>
          </Grid>
          <Grid
            role="tabpanel"
            id="about-user-tabpanel-ID"
            aria-labelledby="about-user-tab-ID"
            item
            xs={12}
            hidden={currentTabIdx !== TAB_INDEX.ABOUT_USER}
          >
            {isComplete && <AboutReviewerTab reviewerID={atelier.reviewer.ID} />}
            {!isComplete && <AboutUploaderTab uploaderID={atelier.uploader.ID} />}
          </Grid>
          <Grid
            item
            role="tabpanel"
            id="comments-tabpanel-ID"
            aria-labelledby="comments-tab-ID"
            xs={12}
            hidden={currentTabIdx !== TAB_INDEX.COMMENT}
          >
            <WorkshopCommentContainer
              userID={userProfile.ID}
              userNickname={userProfile.nickname}
              atelierID={atelier.ID}
              isHidden={currentTabIdx !== TAB_INDEX.COMMENT}
            />
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          style={
            isOverMD
              ? {
                  paddingRight: theme.spacing(4),
                  flexGrow: 0,
                  maxWidth: "400px",
                }
              : {}
          }
        >
          {recommendedVideos(recommendedAteliers)}
        </Grid>
      </Grid>
    </>
  );
}

WorkshopViewPageContainer.propTypes = {
  atelier: atelierPropTypes.isRequired,
  userProfile: userProfilePropTypes.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(WorkshopViewPageContainer);

/**
 * Render the visitor view for atelier container
 * @param {function} dispatch
 * @param {AtelierDescription} atelier
 * @return {JSX.Element}
 * @constructor
 */
function ViewAtelierVisitorPageContainer({ dispatch, atelier }) {
  const theme = useTheme();
  const history = useHistory();
  const isOverMD = useMediaQuery(theme.breakpoints.up("md"));
  const [currentTabIdx, setCurrentTabIdx] = React.useState(TAB_INDEX.ABOUT_USER);
  const { ID: gameID } = atelier.game;
  const isComplete = atelier.currentStatus.ID === AtelierStatus.Complete;
  const [recommendedAteliers, setRecommendedAteliers] = React.useState([]);

  // Visitors cant access non complete workshops
  if (!isComplete) {
    history.replace("/");
  }

  // Load recommended ateliers on game change
  // TODO make a hook
  React.useEffect(() => {
    const [recommendationPromise, recommendationXHR] = getRecommendedAtelier({
      gameID,
      isShortFormat: false,
      offset: 0,
      limit: RECOMMENDATION_LOAD_CHUNK_SIZE,
    });
    recommendationPromise
      .then(({ value }) => {
        setRecommendedAteliers((currentRecommendations) => [...value, ...currentRecommendations]);
      })
      .catch((error) => {
        console.error(`Error while loading chunk of recommended atelier: ${error}`);
        dispatch(setErrorMessage("Error while loading chunk of recommended atelier"));
      });
    return () => recommendationXHR.abort();
  }, [dispatch, gameID]);

  const tags = (items) => items.map((tag) => <Tag key={tag.ID} size="small" name={tag.name} id={tag.ID} />);
  const recommendedVideos = (ateliers) =>
    ateliers.map((atelier) => (
      <Box style={{ paddingBottom: theme.spacing(2) }} key={atelier.ID}>
        <RecommendedWorkshop atelier={atelier} />
      </Box>
    ));
  const header = () => {
    const content = atelier.title;
    const title = `Saltymotion - ${atelier.title}`;
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

  return (
    <>
      {header()}
      <Grid container spacing={1}>
        <Grid
          item
          xs={12}
          md={9}
          container
          spacing={1}
          alignContent="flex-start"
          style={
            isOverMD
              ? {
                  paddingRight: theme.spacing(4),
                  flexGrow: 1,
                  maxWidth: "calc(100% - 400px)",
                }
              : {}
          }
        >
          <Grid item xs={12} container spacing={1}>
            <Grid item xs={12} container>
              <video
                controls
                autoPlay
                playsInline
                style={{ width: "100%" }}
                src={makeS3Link(isComplete ? s3LinkCategory.reviewVideo : s3LinkCategory.matchVideo, atelier.s3Key)}
              />
              <Grid item xs={12}>
                <Typography variant="h6" component="h1">
                  {atelier.title}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Link component={RouterLink} to={`/game/${atelier.game.ID}`}>
                  {atelier.game.name}
                </Link>
              </Grid>
              <Grid item xs={12} container spacing={1}>
                <Grid item style={{ alignSelf: "flex-end" }}>
                  <Typography variant="caption">{atelier.stats.nbViews} views</Typography>
                </Grid>
                <Grid item style={{ alignSelf: "flex-end" }}>
                  <Typography variant="caption">•</Typography>
                </Grid>
                <Grid item style={{ alignSelf: "flex-end" }}>
                  <Typography variant="caption">{new Date(atelier.creationTimestamp).toDateString()}</Typography>
                </Grid>
                <Grid item className="tag_list" style={{ alignSelf: "flex-end" }}>
                  {tags(atelier.tags)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {/* Tab here ==> */}
          <Grid item xs={12}>
            <Tabs value={currentTabIdx} onChange={(evt, val) => setCurrentTabIdx(val)}>
              <Tab
                id="about-user-tab-ID"
                aria-controls="about-user-tabpanel-ID"
                label={`About the ${isComplete ? "reviewer" : "uploader"}`}
                value={TAB_INDEX.ABOUT_USER}
              />
              <Tab
                id="comments-tab-ID"
                aria-controls="comments-tabpanel-ID"
                label="Comments"
                value={TAB_INDEX.COMMENT}
              />
            </Tabs>
          </Grid>
          <Grid
            role="tabpanel"
            id="about-user-tabpanel-ID"
            aria-labelledby="about-user-tab-ID"
            item
            xs={12}
            hidden={currentTabIdx !== TAB_INDEX.ABOUT_USER}
          >
            {isComplete ? (
              <AboutReviewerTab reviewerID={atelier.reviewer.ID} />
            ) : (
              <AboutUploaderTab uploaderID={atelier.uploader.ID} />
            )}
          </Grid>
          <Grid
            item
            role="tabpanel"
            id="comments-tabpanel-ID"
            aria-labelledby="comments-tab-ID"
            xs={12}
            hidden={currentTabIdx !== TAB_INDEX.COMMENT}
          >
            <WorkshopCommentContainer atelierID={atelier.ID} />
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
          container
          spacing={1}
          alignContent="flex-start"
          style={
            isOverMD
              ? {
                  paddingRight: theme.spacing(4),
                  flexGrow: 0,
                  maxWidth: "400px",
                }
              : {}
          }
        >
          {recommendedVideos(recommendedAteliers)}
        </Grid>
      </Grid>
    </>
  );
}

ViewAtelierVisitorPageContainer.propTypes = {
  atelier: atelierPropTypes.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const ConnectedViewAtelierVisitorPageContainer = connect()(ViewAtelierVisitorPageContainer);
export { ConnectedViewAtelierVisitorPageContainer as ViewAtelierVisitorPageContainer };
