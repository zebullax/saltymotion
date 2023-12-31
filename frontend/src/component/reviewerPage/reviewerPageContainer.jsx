// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import TextField from "@mui/material/TextField";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import HistoryIcon from "@mui/icons-material//History";
import ListItemText from "@mui/material/ListItemText";
import LocationOnIcon from "@mui/icons-material//LocationOn";
import TranslateIcon from "@mui/icons-material//Translate";
import List from "@mui/material/List";
import Link from "@mui/material/Link";
// Misc
import { Helmet } from "react-helmet";
import moment from "moment";
// Saltymotion
import Hidden from "../abstract/Hidden";
import { TopGameCard } from "../widget/gameCard";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import { userProfilePropTypes, userPublicProfilePropTypes } from "../../../typedef/propTypes";
import { resolveCountryCode } from "../../lib/countryCode";
import { MAXIMUM_NB_GAMES_REVIEWABLE_POOL, WORKSHOP_LOAD_CHUNK_SIZE } from "../../lib/property";
import { AtelierStatus } from "../../lib/atelierStatus";
import { EmptyReviewsSet } from "../placeholder/emptyResult";
import { addReviewerToFavorite, removeReviewerFromFavorite, searchAtelier } from "../../lib/api/saltymotionApi";
import ReviewerCardsSmallFormat, { ReviewerCardV3 } from "../widget/reviewerCard";
import Tag from "../widget/tag";
import AtelierCard from "../widget/atelierCard";
import { addFavoriteReviewerToUser, removeFavoriteReviewerToUser } from "../../state/userProfile/action";
import { setErrorMessage } from "../../state/app/action";

/**
 * Render the reviewer profile section
 * @param {UserPublicProfile} profile
 * @param {boolean} isGutterDisabled
 * @param {boolean} isInline
 * @return {JSX.Element}
 */
function ReviewerPageContainerReviewerProfile({ profile, isGutterDisabled, isInline }) {
  return (
    <List disablePadding dense style={{ display: isInline ? "flex" : "block" }}>
      <ListItem disableGutters={isGutterDisabled}>
        <ListItemIcon>
          <HistoryIcon />
        </ListItemIcon>
        <ListItemText primary="Registration" secondary={moment(profile.registrationDate).fromNow()} />
      </ListItem>
      <ListItem disableGutters={isGutterDisabled}>
        <ListItemIcon>
          <LocationOnIcon />
        </ListItemIcon>
        <ListItemText primary={resolveCountryCode(profile.countryCode)} secondary={profile.timezone} />
      </ListItem>
      <ListItem disableGutters={isGutterDisabled}>
        <ListItemIcon>
          <TranslateIcon />
        </ListItemIcon>
        <ListItemText
          primary="Languages"
          secondary={
            profile.languages.length === 0
              ? "Unknown"
              : profile.languages.reduce((accu, val) => `${accu}${val.name}, `, "").slice(0, -2)
          }
        />
      </ListItem>
    </List>
  );
}
ReviewerPageContainerReviewerProfile.propTypes = {
  isGutterDisabled: PropTypes.bool,
  isInline: PropTypes.bool,
  profile: userProfilePropTypes.isRequired,
};

ReviewerPageContainerReviewerProfile.defaultProps = {
  isGutterDisabled: false,
  isInline: false,
};

/**
 * Create the container for the showcase game page
 * @param {UserPublicProfile} [reviewer]
 * @param {boolean} isLoading
 * @param {boolean} isVisitor
 * @param {boolean} isDarkMode
 * @param {UserProfile} [userProfile]
 * @param {function} dispatch
 * @return {JSX.Element}
 * @constructor
 */
function ReviewerPageContainer({ reviewer, isLoading, isVisitor, isDarkMode, userProfile, dispatch }) {
  const theme = useTheme();
  const isUpSM = useMediaQuery(theme.breakpoints.up("sm"));
  const isUpLG = useMediaQuery(theme.breakpoints.up("lg"));
  const [isFollowing, setIsFollowing] = React.useState(
    !isLoading && !isVisitor && userProfile.favoriteReviewers.findIndex((item) => item.ID === reviewer.ID) !== -1,
  );
  const [isLoadingReviews, setIsLoadingReviews] = React.useState(true);
  const [reviews, setReviews] = React.useState(undefined);

  React.useEffect(() => {
    if (isLoading || isVisitor) {
      return;
    }
    setIsFollowing(userProfile.favoriteReviewers.findIndex((item) => item.ID === reviewer.ID) !== -1);
  }, [isLoading, isVisitor, reviewer, userProfile]);

  const heroBackground = React.useMemo(() => {
    if (isLoading) {
      return "";
    }
    // TODO use something like alpha(theme.palette.common.white, 0.15)
    if (isDarkMode) {
      return (
        "linear-gradient(to right, rgb(19 19 19) 20%, rgba(19, 19, 19, 0.5)50%, rgb(19 19 19) 90%), " +
        "linear-gradient(180deg, rgb(19,19,19) 0%, rgba(19,19,19,0) 10%, rgba(19,19,19,1) 70%), " +
        `url(${makeS3Link(s3LinkCategory.gameBackdrop, reviewer.gamePool[0].ID)})`
      );
    }
    return (
      "linear-gradient(to right, rgb(255, 255, 255)20%, rgba(255, 255, 255, 0.5)50%, rgb(255, 255, 255) 90%), " +
      "linear-gradient(180deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 10%, rgba(255, 255, 255, 1) 70%), " +
      `url(${makeS3Link(s3LinkCategory.gameBackdrop, reviewer.gamePool[0].ID)})`
    );
  }, [isLoading, isDarkMode, reviewer]);

  React.useEffect(() => {
    if (isLoading) {
      return null;
    }
    setIsLoadingReviews(true);
    const [reviewsPromise, reviewsXHR] = searchAtelier({
      reviewerID: reviewer.ID,
      offset: 0,
      atelierStatus: AtelierStatus.Complete,
      limit: WORKSHOP_LOAD_CHUNK_SIZE,
    });
    let isActive = true;
    reviewsPromise.then((results) => {
      if (isActive) {
        setReviews(results.value);
        setIsLoadingReviews(false);
      }
    });
    return () => {
      isActive = false;
      reviewsXHR.abort();
    };
  }, [isLoading, reviewer]);

  /**
   * Handle user adding/removing reviewer as favorite
   * @callback
   * @param {boolean} isAdd - true if adding to favorites, false otherwise
   */
  const setReviewerFavorite = (isAdd) => {
    const func = isAdd ? addReviewerToFavorite : removeReviewerFromFavorite;
    const [favoritePromise] = func(userProfile.ID, reviewer.ID);
    favoritePromise
      .then(() => {
        if (isAdd) {
          dispatch(addFavoriteReviewerToUser(reviewer));
        } else {
          dispatch(removeFavoriteReviewerToUser(reviewer.ID));
        }
        setIsFollowing(isAdd);
      })
      .catch(() => {
        // eslint-disable-next-line max-len
        dispatch(
          setErrorMessage(
            `An unknown error happened while ${isAdd ? "adding" : "removing"} this reviewer to your favorite`,
          ),
        );
      });
  };

  const buildTags = (tags) => {
    const maxTagsCount = isUpLG ? 8 : isUpSM ? 6 : 3;
    return [...Array(Math.min(tags.length, maxTagsCount)).keys()].map((idx) => (
      <Tag key={idx} size="small" name={tags[idx].name} id={tags[idx].ID} color="primary" />
    ));
  };

  const header = () => {
    // eslint-disable-next-line max-len
    const content = "Reviewer showcase, you will find here details on his profile and most popular works.";
    const title = `Saltymotion - ${reviewer?.name ?? "Loading reviewer profile..."}`;
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

  const gameCards = (games) =>
    [...Array(Math.min(MAXIMUM_NB_GAMES_REVIEWABLE_POOL, games.length)).keys()].map((idx) => (
      <Grid item xs={1} key={games[idx].ID}>
        <TopGameCard game={games[idx]} />
      </Grid>
    ));

  const buildReviewerInfo = (profile) => (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold">
          Self Introduction
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: theme.spacing(1) }}>
        <TextField
          multiline
          disabled
          fullWidth
          InputProps={{ disableUnderline: true }}
          variant="standard"
          value={(profile.selfIntroduction?.length ?? 0) !== 0 ? profile.selfIntroduction : "No self introduction..."}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold">
          Game Pool
        </Typography>
      </Grid>
      <Grid container item xs={12} spacing={1} style={{ marginBottom: theme.spacing(1) }}>
        {profile.gamePool.map((game, idx) => (
          <Grid key={game.ID} item>
            <Link noWrap component={RouterLink} variant="subtitle1" to={`/game/${game.ID}`}>
              {game.name}({game.nbReview})
            </Link>
            {idx + 1 !== profile.gamePool.length && " \u00B7"}
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="bold">
          Top Tags
        </Typography>
      </Grid>
      <Grid item xs={12} className="tag_list" style={{ marginBottom: theme.spacing(1), marginTop: "4px" }}>
        {profile.tags.length !== 0 ? (
          buildTags(profile.tags)
        ) : (
          <TextField variant="standard" InputProps={{ disableUnderline: true }} disabled value="Empty..." />
        )}
      </Grid>
    </>
  );

  /**
   * ReviewsSection
   * @type {JSX.Element}
   */
  const ReviewsSection = React.useMemo(() => {
    if (isLoadingReviews) {
      return null;
    }
    if (reviews.length === 0) {
      return <EmptyReviewsSet label={reviewer.name} category="reviewer" alternativeLink="/browse/reviewer" />;
    }
    const marginBottom = 8 * 4; // Don't want to drag theme in deps for `theme.spacing(4)`
    const buildReviews = (workshops) =>
      workshops.map((workshop) => (
        <Grid item xs={12} sm={6} lg={3} xl={2} key={workshop.ID} style={{ marginBottom }}>
          <AtelierCard atelier={workshop} />
        </Grid>
      ));
    return buildReviews(reviews);
  }, [reviewer, reviews, isLoadingReviews]);

  return (
    <>
      {header()}
      <>
        <Hidden smDown>
          <Grid
            container
            spacing={1}
            alignItems="stretch"
            style={{
              position: "relative",
              alignItems: "flex-end",
              padding: theme.spacing(4),
              backgroundImage: heroBackground,
              backgroundSize: "cover",
              backgroundPositionX: "center",
              backgroundRepeat: "no-repeat",
              marginLeft: -24, // We want to stretch the cover picture outside of usual main container padding...
              marginTop: -16,
              width: "calc(100% + 48px)",
            }}
          >
            <Grid item md={3} xl={2}>
              <ReviewerCardV3
                isFavorite={isFollowing}
                isFollowingDisabled={isVisitor || userProfile.ID === reviewer.ID}
                reviewer={reviewer}
                onSetFavorite={setReviewerFavorite}
              />
            </Grid>
            <Grid item container md={9} xl={10} style={{ paddingBottom: theme.spacing(4) }} alignItems="flex-end">
              <Grid item md={8} xl={9}>
                <Typography variant="h4" component="h1" style={{ fontWeight: "bold" }}>
                  {reviewer.name}
                  &apos; profile
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  You will find here info and reviews related to this reviewer
                </Typography>
              </Grid>
              <Grid item md={4} xl={3}>
                <ReviewerPageContainerReviewerProfile profile={reviewer} />
              </Grid>
              <Grid item xs={12} container spacing={1} columns={MAXIMUM_NB_GAMES_REVIEWABLE_POOL} mt={theme.spacing(2)}>
                {gameCards(reviewer.gamePool)}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ marginTop: 16 }}>
            <Grid container spacing={2}>
              {ReviewsSection}
            </Grid>
          </Grid>
        </Hidden>
        <Hidden mdUp>
          <Grid container spacing={1} alignItems="stretch">
            <Grid item xs={12} style={{ marginBottom: 8 }}>
              <Typography variant="h4" component="h1" style={{ fontWeight: "bold" }}>
                {reviewer.name}
                &apos; profile
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                You will find here info and reviews related to this reviewer
              </Typography>
              <Divider />
            </Grid>
            <Hidden only="sm">
              <Grid item xs={12}>
                <ReviewerCardsSmallFormat
                  isFollowing={isFollowing}
                  isFollowingDisabled={isVisitor || userProfile.ID === reviewer.ID}
                  reviewer={reviewer}
                  isGamePoolAvatarDisplayed
                  onFavoriteClick={() => setReviewerFavorite(!isFollowing)}
                />
              </Grid>
              <Grid item xs={12}>
                {buildReviewerInfo(reviewer)}
              </Grid>
            </Hidden>
            <Hidden only="xs">
              <Grid item sm={4}>
                <ReviewerCardsSmallFormat
                  isFollowing={isFollowing}
                  isFollowingDisabled={isVisitor || userProfile.ID === reviewer.ID}
                  reviewer={reviewer}
                  isGamePoolAvatarDisplayed={false}
                  onFavoriteClick={() => setReviewerFavorite(!isFollowing)}
                />
              </Grid>
              <Grid item sm={8}>
                {buildReviewerInfo(reviewer)}
              </Grid>
              <Grid item sm={12}>
                <ReviewerPageContainerReviewerProfile profile={reviewer} isInline />
              </Grid>
            </Hidden>
            <Grid item xs={12} style={{ marginTop: theme.spacing(1) }}>
              <Divider />
            </Grid>
            <Grid item xs={12} style={{ marginTop: 16 }}>
              <Grid container spacing={2}>
                {ReviewsSection}
              </Grid>
            </Grid>
          </Grid>
        </Hidden>
      </>
    </>
  );
}

ReviewerPageContainer.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isVisitor: PropTypes.bool.isRequired,
  userProfile: userProfilePropTypes,
  dispatch: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  reviewer: userPublicProfilePropTypes.isRequired,
};

ReviewerPageContainer.defaultProps = {
  userProfile: null,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
  isVisitor: state.application.isVisitor,
  isDarkMode: state.application.isDarkMode,
});

export default connect(mapStateToProps)(ReviewerPageContainer);
