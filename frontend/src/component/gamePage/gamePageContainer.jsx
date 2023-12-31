// React/Redux
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
// Misc
import { Helmet } from "react-helmet";
// Saltymotion
import Hidden from "../abstract/Hidden";
import {
  gamePropTypes,
  gameStatisticsPropTypes,
  reviewerProfilePropTypes,
  tagPropTypes,
  userProfilePropTypes,
} from "../../../typedef/propTypes";
import { EmptyReviewsSet } from "../placeholder/emptyResult";
import { AtelierStatus } from "../../lib/atelierStatus";
import { WORKSHOP_LOAD_CHUNK_SIZE } from "../../lib/property";
import { searchAtelier } from "../../lib/api/saltymotionApi";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import AtelierCard from "../widget/atelierCard";
import { followGame, unfollowGame } from "../../state/userProfile/action";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";
import { GameInfoMobileSection, GameInfoSection } from "./gameInfoSection";
import ReviewerSection from "./reviewerSection";
import ReviewSection from "./reviewSection";

/**
 * Helper to flag if a gameID is contained in a list of games
 * @param {Game[]} games
 * @param {number} gameID
 * @return {boolean}
 */
const isUserFollowing = (games, gameID) => games.findIndex((game) => game.ID === gameID) !== -1;

/**
 * Create the container for the showcase game page
 * @param {Game} game
 * @param {GameStatistics} statistics
 * @param {Reviewer[]} reviewers
 * @param {Tag[]} tags
 * @param {boolean} isVisitor
 * @param {UserProfile} [userProfile]
 * @param {function} dispatch
 * @return {JSX.Element}
 */
function GamePageContainer({ game, statistics, reviewers, tags, isVisitor, userProfile, dispatch }) {
  const theme = useTheme();
  const [isFollowing, setIsFollowing] = React.useState(
    !isVisitor && isUserFollowing(userProfile.favoriteGames, game.ID),
  );
  const [ateliers, setAteliers] = React.useState([]);
  const [isLoadingAteliers, setIsLoadingAteliers] = React.useState(true);
  const hasNoWorkshops = ateliers.length === 0;

  // Run effect to flag whether the game is being followed or not
  // Visitors are unable to follow games
  React.useEffect(() => {
    if (isVisitor || userProfile.favoriteGames === undefined) {
      setIsFollowing(undefined);
    } else {
      setIsFollowing(isUserFollowing(userProfile.favoriteGames, game.ID));
    }
  }, [isVisitor, userProfile?.favoriteGames, game]);

  // Run effects to load workshops on game change
  React.useEffect(() => {
    const [atelierPromise, atelierXHR] = searchAtelier({
      gameID: game.ID,
      offset: 0,
      atelierStatus: AtelierStatus.Complete,
      limit: WORKSHOP_LOAD_CHUNK_SIZE,
    });
    let isActive = true;
    atelierPromise
      .then((result) => {
        const { value } = result;
        if (isActive) {
          setAteliers([...value]);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isActive) {
          dispatch(setErrorMessage("Error while loading reviews"));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingAteliers(false);
        }
      });

    setIsLoadingAteliers(true);
    return () => {
      atelierXHR.abort();
      isActive = false;
    };
  }, [game, dispatch]);

  const buildAteliers = (items) =>
    items.map((item) => (
      <Grid item xs={12} sm={6} lg={3} xl={2} key={item.ID} style={{ marginBottom: theme.spacing(4) }}>
        <AtelierCard atelier={item} />
      </Grid>
    ));

  const header = (item) => {
    // eslint-disable-next-line max-len
    const content =
      "Game showcase, find here details on the work related to a particular title. Best reviewers, most popular reviews, etc.";
    const title = `Saltymotion - ${item.name}`;
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

  const onToggleFollow = (isFollow, userID, gameID, gameName) => {
    const onComplete = (e) => {
      // In case of error undo the first dispatch action
      // TODO ... Seems peculiar we dont do that anywhere else ?
      if (e) {
        if (isFollow) {
          dispatch(
            unfollowGame(userID, { ID: gameID, name: gameName }, () =>
              dispatch(setErrorMessage("Error while adding this game to your watch list")),
            ),
          );
        } else {
          dispatch(
            followGame(userID, { ID: gameID, name: gameName }, () =>
              dispatch(setErrorMessage("Error while removing this game from your watch list")),
            ),
          );
        }
      } else {
        dispatch(setStatusMessage(`Game was ${isFollow ? "added to" : "removed from"} your watch list`));
      }
    };
    if (isFollow) {
      dispatch(followGame(userID, { ID: gameID, name: gameName }, onComplete));
    } else {
      dispatch(unfollowGame(userID, { ID: gameID, name: gameName }, onComplete));
    }
  };

  return (
    <>
      {header(game)}
      {!isLoadingAteliers && (
        <>
          <Hidden only="xs">
            {" "}
            {/* Desktop version */}
            <Grid
              container
              spacing={1}
              alignItems="stretch"
              style={{
                position: "relative",
                padding: theme.spacing(4),
                backgroundImage:
                  `linear-gradient(to right, ${alpha(theme.palette.background.default, 1)} 10%, ` +
                  `${alpha(theme.palette.background.default, 0.5)} 50%, ` +
                  `${alpha(theme.palette.background.default, 1)} 90%), ` +
                  `linear-gradient(to top, ${alpha(theme.palette.background.default, 1)} 20%, ` +
                  `${alpha(theme.palette.background.default, 0)} 80%), ` +
                  `url(${makeS3Link(s3LinkCategory.gameBackdrop, game.ID)})`,
                backgroundPositionX: "center",
                backgroundRepeat: "no-repeat",
                marginLeft: -24, // We want to stretch the cover picture outside of usual main container padding...
                marginTop: -16,
                width: "calc(100% + 48px)",
              }}
            >
              <Grid item xs={12} container style={{ flexWrap: "nowrap" }}>
                <Grid
                  item
                  style={{
                    position: "relative",
                    flex: "175px 0 0",
                    width: "175px",
                    paddingTop: "245px",
                    height: 0,
                    marginRight: theme.spacing(4),
                  }}
                >
                  <img
                    crossOrigin="anonymous"
                    aria-label={game.name}
                    src={makeS3Link(s3LinkCategory.gameCover, game.ID)}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                      top: 0,
                      left: 0,
                      position: "absolute",
                    }}
                    alt={game.name}
                  />
                </Grid>
                <GameInfoSection
                  game={game}
                  tags={tags}
                  statistics={statistics}
                  isFollowing={isVisitor ? undefined : isFollowing}
                  onToggleFollow={isVisitor ? undefined : onToggleFollow}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} pb={theme.spacing(1)}>
              <Divider />
            </Grid>
            <ReviewerSection reviewers={reviewers} nbReviewers={statistics.nbReviewers} />
            <Grid item xs={12} pt={theme.spacing(1)}>
              <Divider />
            </Grid>
            <ReviewSection reviews={ateliers} game={game} />
          </Hidden>
          <Hidden smUp>
            {" "}
            {/* Cellphone version */}
            <Grid
              container
              spacing={1}
              alignItems="stretch"
              style={{
                position: "relative",
                padding: theme.spacing(2),
                backgroundImage:
                  `linear-gradient(to right, ${alpha(theme.palette.background.default, 1)} 10%, ` +
                  `${alpha(theme.palette.background.default, 0.5)} 50%, ` +
                  `${alpha(theme.palette.background.default, 1)} 90%), ` +
                  `linear-gradient(to top, ${alpha(theme.palette.background.default, 1)} 20%, ` +
                  `${alpha(theme.palette.background.default, 0)} 80%), ` +
                  `url(${makeS3Link(s3LinkCategory.gameBackdrop, game.ID)})`,
                backgroundSize: "cover",
                backgroundPositionX: "center",
                backgroundRepeat: "no-repeat",
                marginLeft: -24, // We want to stretch the cover picture outside of usual main container padding
                marginTop: -16,
                width: "calc(100% + 48px)",
              }}
            >
              <Grid item xs={12} container wrap="nowrap">
                <Grid
                  item
                  style={{
                    position: "relative",
                    flex: "125px 0 0",
                    width: "125px",
                    paddingTop: "175px",
                    height: 0,
                    marginRight: theme.spacing(4),
                  }}
                >
                  <img
                    crossOrigin="anonymous"
                    aria-label={game.name}
                    src={makeS3Link(s3LinkCategory.gameCover, game.ID)}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                      top: 0,
                      left: 0,
                      position: "absolute",
                    }}
                    alt={game.name}
                  />
                </Grid>
                <Grid item container>
                  <Typography variant="h4" component="h1" style={{ fontWeight: "bold", margin: "auto" }}>
                    {game.name}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} style={{ marginTop: theme.spacing(2) }}>
              <GameInfoMobileSection
                game={game}
                tags={tags}
                isFollowing={isFollowing}
                onToggleFollow={isVisitor ? undefined : onToggleFollow}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} style={{ marginTop: theme.spacing(2) }}>
              <Grid container spacing={2}>
                <Grid item container spacing={2} style={{ marginTop: theme.spacing(2) }}>
                  {!hasNoWorkshops ? (
                    buildAteliers(ateliers)
                  ) : (
                    <EmptyReviewsSet label={game.name} category="game" alternativeLink="/browse/game" />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Hidden>
        </>
      )}
    </>
  );
}

GamePageContainer.propTypes = {
  game: gamePropTypes.isRequired,
  reviewers: PropTypes.arrayOf(reviewerProfilePropTypes).isRequired,
  statistics: gameStatisticsPropTypes.isRequired,
  tags: PropTypes.arrayOf(tagPropTypes).isRequired,
  isVisitor: PropTypes.bool.isRequired,
  userProfile: userProfilePropTypes,
  dispatch: PropTypes.func.isRequired,
};

GamePageContainer.defaultProps = {
  userProfile: undefined,
};

const mapStateToProps = (state) => ({
  isVisitor: state.application.isVisitor,
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(GamePageContainer);
