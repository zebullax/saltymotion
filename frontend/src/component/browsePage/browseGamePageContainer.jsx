// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// Saltymotion
// MUI
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
// Misc
import InfiniteScroll from "react-infinite-scroller";
import { setErrorMessage } from "../../state/app/action";
import { EmptyGamesSet } from "../placeholder/emptyResult";
import { BROWSE_GAME_INITIAL_LOAD_CHUNK_SIZE } from "../../lib/property";
import { getGames, getTags } from "../../lib/api/saltymotionApi";
import BrowseGameCard from "../widget/gameCard";
import AutocompleteTag from "../autocomplete/autocompleteTag";

/**
 * Create main container for browse game page
 * @param {function} dispatch
 * @return {JSX.Element}
 * @constructor
 */
function BrowseGamePageContainer({ dispatch }) {
  const [games, setGames] = React.useState([]);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [availableTags, setAvailableTags] = React.useState([]);
  const [isLoadingTag, setIsLoadingTag] = React.useState(false);
  const [hasMoreItems, setHasMoreItems] = React.useState(true);
  const [isLoadingGames, setIsLoadingGames] = React.useState(false);

  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("xl"));
  const isOverXS = useMediaQuery(theme.breakpoints.up("sm"));
  // eslint-disable-next-line max-len
  const isMacBookPro = useMediaQuery(
    "(min-width: 1680px) and (-webkit-min-device-pixel-ratio: 2), (min-width: 1680px) and (min-resolution: 192dpi)",
  );
  const isBigScreen = isLarge || isMacBookPro;

  // Get all tags on mount
  React.useEffect(() => {
    const [tagsPromise, tagsXHR] = getTags({});
    tagsPromise
      .then((results) => {
        setAvailableTags(results.map((tag) => ({ ID: tag.ID, label: tag.label })));
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Unknown error while loading tags"));
      })
      .finally(() => {
        setIsLoadingTag(false);
      });
    setIsLoadingTag(true);

    return () => tagsXHR.abort();
  }, [dispatch]);

  React.useEffect(() => {
    const [gamesPromise, gamesXHR] = getGames({
      tagsID: selectedTags.map((tag) => tag.ID),
      offset: 0,
      limit: BROWSE_GAME_INITIAL_LOAD_CHUNK_SIZE,
    });
    gamesPromise
      .then((results) => {
        const newGames = [...results];
        setGames(newGames);
        setHasMoreItems(results.length === BROWSE_GAME_INITIAL_LOAD_CHUNK_SIZE);
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Unknown error while loading games"));
      })
      .finally(() => {
        setIsLoadingGames(false);
      });
    setIsLoadingGames(true);

    return () => gamesXHR.abort();
  }, [dispatch, selectedTags]);

  const nbGamesMaxPerRow = isBigScreen ? 8 : isOverXS ? 6 : 2;
  const nbFullRow = Math.floor(games.length / nbGamesMaxPerRow);
  const hasPartialRow = games.length > nbFullRow * nbGamesMaxPerRow;

  const buildGames = () => {
    const nbPlaceholders = nbGamesMaxPerRow - (games.length - nbFullRow * nbGamesMaxPerRow);
    const fullRowCards = (gameSlice, rowIdx) => (
      <Grid
        item
        xs={12}
        key={rowIdx}
        container
        spacing={isBigScreen ? 0 : 1}
        style={
          isBigScreen
            ? { marginBottom: theme.spacing(4), justifyContent: "space-between" }
            : { marginBottom: theme.spacing(3) }
        }
      >
        {gameSlice.map((game, idx) => (
          <BrowseGameCard
            game={game}
            key={rowIdx * nbGamesMaxPerRow + idx}
            sm={2}
            xs={6}
            lg={isBigScreen ? 1 : 2}
            overrideXsFlexBasis={isBigScreen ? 11 : undefined}
          />
        ))}
      </Grid>
    );

    const partialRow = (gameSlice, rowIdx) => (
      <Grid
        item
        xs={12}
        container
        key={rowIdx}
        spacing={isBigScreen ? 0 : 1}
        style={isBigScreen ? { justifyContent: "space-between" } : {}}
      >
        {gameSlice.map((game, idx) => (
          <BrowseGameCard
            game={game}
            key={rowIdx * nbGamesMaxPerRow + idx}
            overrideXsFlexBasis={isBigScreen ? 11 : undefined}
            sm={2}
            xs={6}
            lg={isBigScreen ? 1 : 2}
          />
        ))}
        {[...Array(nbPlaceholders).keys()].map((idx) => (
          <Grid
            item
            sm={2}
            xs={6}
            lg={isBigScreen ? 1 : 2}
            key={rowIdx * nbGamesMaxPerRow + idx + gameSlice.length}
            style={isBigScreen ? { flexBasis: "11%", maxWidth: "11%" } : {}}
          />
        ))}
      </Grid>
    );

    return (
      <>
        {[...Array(nbFullRow).keys()].map((rowIdx) =>
          fullRowCards(games.slice(rowIdx * nbGamesMaxPerRow, (rowIdx + 1) * nbGamesMaxPerRow), rowIdx),
        )}
        {hasPartialRow && partialRow(games.slice(nbFullRow * nbGamesMaxPerRow, games.length), nbFullRow)}
      </>
    );
  };

  /**
   * Filter game list on selected tags
   * @param {{ID: number, label: string}[]} tags
   */
  const onTagSelect = (tags) => {
    setSelectedTags(tags);
  };

  /**
   * Load the next slice of items
   */
  const loadGames = () => {
    if (isLoadingGames) {
      return;
    }
    const offset = games.length;
    const limit = BROWSE_GAME_INITIAL_LOAD_CHUNK_SIZE;
    const [getGamesPromise] = getGames({ tagsID: selectedTags.map((tag) => tag.ID), offset, limit });
    getGamesPromise
      .then((results) => {
        const newGames = [...games, ...results];
        setGames(newGames);
        setHasMoreItems(results.length === BROWSE_GAME_INITIAL_LOAD_CHUNK_SIZE);
      })
      .catch((error) => {
        console.error(error);
        dispatch(setErrorMessage("Unknown error while loading games"));
      })
      .finally(() => {
        setIsLoadingGames(false);
      });
    setIsLoadingGames(true);
  };

  return (
    <Grid container spacing={1} data-testid="browseGamePageContainerTestID">
      <Backdrop open={isLoadingGames} style={{ zIndex: 99999 }} transitionDuration={{ exit: 1000 }}>
        <CircularProgress color="secondary" />
      </Backdrop>
      <Grid item xs={12} style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h2" style={{ fontWeight: "bold" }} component="h1">
          Games
        </Typography>
      </Grid>
      <Grid item container spacing={1} xs={12} alignItems="center" pb={theme.spacing(2)}>
        <Grid item>
          <Typography variant="caption" fontWeight="bold">
            Filter by
          </Typography>
        </Grid>
        <Grid item style={{ minWidth: 200 }}>
          <AutocompleteTag
            isPadded={false}
            availableTags={availableTags}
            onTagSelect={onTagSelect}
            isLoading={isLoadingTag}
            isDisabled={isLoadingGames}
            selectedTags={selectedTags}
            placeholder={selectedTags.length === 0 ? "Search tags" : ""}
          />
        </Grid>
      </Grid>
      <InfiniteScroll
        pageStart={0}
        initialLoad={false}
        loadMore={loadGames}
        hasMore={hasMoreItems}
        style={{ width: "100%" }}
      >
        <Grid item xs={12}>
          {games.length === 0 && <EmptyGamesSet />}
          {buildGames()}
        </Grid>
      </InfiniteScroll>
    </Grid>
  );
}

BrowseGamePageContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(BrowseGamePageContainer);
