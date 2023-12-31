// React
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// Saltymotion
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import InfiniteScroll from "react-infinite-scroller";
import AutocompleteTag from "../autocomplete/autocompleteTag";
import { getGames, getTags, searchReviewer } from "../../lib/api/saltymotionApi";
import AutocompleteGame from "../autocomplete/autocompleteGame";
import { BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE } from "../../lib/property";
import { EmptyReviewersSet } from "../placeholder/emptyResult";
import { ReviewerCardV2 } from "../widget/reviewerCard";

// MUI
import Hidden from "../abstract/Hidden";
// Misc
import { setErrorMessage } from "../../state/app/action";

/**
 * Container element for the browse reviewer page
 * @return {JSX.Element}
 * @param {function} dispatch
 * @constructor
 */
function BrowseReviewerPageContainer({ dispatch }) {
  const theme = useTheme();
  const [isLoadingResults, setIsLoadingResults] = React.useState(false);
  const [isLoadingTags, setIsLoadingTags] = React.useState(false);
  const [isLoadingGames, setIsLoadingGames] = React.useState(false);
  const [hasMoreItems, setHasMoreItems] = React.useState(true);
  const [availableTags, setAvailableTags] = React.useState([]);
  const [availableGames, setAvailableGames] = React.useState([]);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [selectedGame, setSelectedGame] = React.useState(undefined);
  const [reviewers, setReviewers] = React.useState([]);

  React.useEffect(() => {
    const [tagsPromise, tagsXHR] = getTags({});
    tagsPromise
      .then((results) => {
        setAvailableTags(results.map((tag) => ({ ID: tag.ID, label: tag.label })));
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Error while loading available tags"));
      })
      .finally(() => {
        setIsLoadingTags(false);
      });

    const [gamesPromise, gamesXHR] = getGames({ tagsID: [] });
    gamesPromise
      .then((games) => {
        setAvailableGames(games);
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Error while loading available games"));
      })
      .finally(() => {
        setIsLoadingGames(false);
      });

    const [reviewerPromise, reviewerXHR] = searchReviewer({
      tagsID: [],
      offset: 0,
      limit: BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE,
    });
    reviewerPromise
      .then((items) => {
        setReviewers([...items]);
        setHasMoreItems(items.length === BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE); // corner case when % = 0
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Error while loading reviewers"));
      })
      .finally(() => {
        setIsLoadingResults(false);
      });

    setIsLoadingGames(true);
    setIsLoadingTags(true);
    setIsLoadingResults(true);
    return () => {
      tagsXHR.abort();
      gamesXHR.abort();
      reviewerXHR.abort();
    };
  }, [dispatch]);

  /**
   * Query backends for reviewers based on filters
   * @param {number[]} tagsID
   * @param {number} [gameID]
   * @param {boolean} [resetFirst = true]
   * @param {number} offset
   * @param {number} limit
   */
  const runSearch = (tagsID, gameID, resetFirst, offset, limit) => {
    const [getReviewerPromise] = searchReviewer({
      tagsID,
      gameID,
      fetchLanguages: true,
      offset,
      limit,
    });
    getReviewerPromise
      .then((rawReviewers) => {
        const pushReviewerHelper = (startFrom) => [...startFrom, ...rawReviewers];

        setReviewers((currentReviewers) => pushReviewerHelper(resetFirst ? [] : currentReviewers));
        setHasMoreItems(rawReviewers.length === BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE); // corner case when % = 0
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Error while loading results..."));
      })
      .finally(() => {
        setIsLoadingResults(false);
      });
  };

  /**
   * Filter reviewers list on selected tags
   * @param {{ID: number, label: string}[]} tags
   */
  const onTagSelect = (tags) => {
    setSelectedTags(tags);
    setIsLoadingResults(true);
    runSearch(
      tags.map((tag) => tag.ID),
      selectedGame?.ID,
      true,
      0,
      BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE,
    );
  };

  /**
   * Handle user selecting game for filter
   * @callback
   * @param {{name: string, ID: number}} game
   */
  const onGameSelect = (game) => {
    setIsLoadingResults(true);
    setSelectedGame(game);
    runSearch(
      selectedTags.map((tag) => tag.ID),
      game?.ID,
      true,
      0,
      BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE,
    );
  };

  /**
   * Load the next slice of items
   */
  const onScrollEnd = () => {
    if (isLoadingResults) {
      return;
    }
    const offset = reviewers.length;
    // if (offset === 0) {
    //   return;
    // }
    const limit = BROWSE_REVIEWER_INITIAL_LOAD_CHUNK_SIZE;
    const tagsID = selectedTags.map((tag) => tag.ID);
    const gameID = selectedGame?.ID;
    runSearch(tagsID, gameID, false, offset, limit);
    setIsLoadingResults(true);
  };

  return (
    <Grid container spacing={1}>
      <Backdrop open={isLoadingResults} style={{ zIndex: 99999 }} transitionDuration={{ exit: 1000 }}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <Grid item xs={12} style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h2" style={{ fontWeight: "bold" }} component="h1">
          Reviewers
        </Typography>
      </Grid>
      {/* Phone version: full len filter bar */}
      <Hidden smUp>
        <Grid item container spacing={1} xs={12} alignItems="center" pb={theme.spacing(2)}>
          <Grid item>
            <Typography variant="caption">Filter by</Typography>
          </Grid>
          <Grid item xs={12}>
            <AutocompleteTag
              isPadded={false}
              selectedTags={selectedTags}
              availableTags={availableTags}
              onTagSelect={onTagSelect}
              isLoading={isLoadingTags}
              placeholder={selectedTags.length === 0 ? "Search tags" : ""}
            />
          </Grid>
          <Grid item xs={12}>
            <AutocompleteGame
              onGameSelect={onGameSelect}
              isDisabled={isLoadingResults}
              isLoading={isLoadingGames}
              isNoPadded
              availableGames={availableGames}
              placeholder={!selectedGame ? "Search games" : ""}
            />
          </Grid>
        </Grid>
      </Hidden>
      <Hidden smDown>
        <Grid item container spacing={1} xs={12} alignItems="center" pb={theme.spacing(2)}>
          <Grid item>
            <Typography variant="caption">Filter by</Typography>
          </Grid>
          <Grid item style={{ minWidth: 200 }}>
            <AutocompleteTag
              isPadded={false}
              selectedTags={selectedTags}
              availableTags={availableTags}
              onTagSelect={onTagSelect}
              isLoading={isLoadingTags}
              placeholder={selectedTags.length === 0 ? "Search tags" : ""}
            />
          </Grid>
          <Grid item style={{ minWidth: 200 }}>
            <AutocompleteGame
              onGameSelect={onGameSelect}
              isDisabled={isLoadingResults}
              isLoading={isLoadingGames}
              isGameAvatarVisible={false}
              isPadded={false}
              availableGames={availableGames}
              placeholder={!selectedGame ? "Search games" : ""}
            />
          </Grid>
        </Grid>
      </Hidden>
      <Grid item lg={4} xl={6} />
      <InfiniteScroll
        pageStart={0}
        initialLoad={false} // Offloaded to useEffect for initial load
        loadMore={onScrollEnd}
        hasMore={hasMoreItems}
        style={{ width: "100%" }}
      >
        <Grid style={{ marginTop: theme.spacing(2) }} container columns={{ xs: 12, lg: 8 }} spacing={{ xs: 1, lg: 2 }}>
          {reviewers.length === 0 && <EmptyReviewersSet />}
          {reviewers.map((reviewer) => (
            <Grid item xs={6} sm={4} md={3} lg={1} key={reviewer.ID}>
              <ReviewerCardV2 reviewer={reviewer} />
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Grid>
  );
}

BrowseReviewerPageContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(BrowseReviewerPageContainer);
