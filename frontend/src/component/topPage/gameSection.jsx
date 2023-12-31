// React/Redux
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
// Mui
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
// Saltymotion
import BrowseGameCard, { TopGameCard } from "../widget/gameCard";
import { getGameStatistics, sampleGames } from "../../lib/api/saltymotionApi";
import { GAME_SAMPLE_COUNT, TOP_PAGE__MAX_GAME_DISPLAYED } from "../../lib/property";
import { setErrorMessage } from "../../state/app/action";

/**
 * Render the game section on top page, dedicated to desktop version
 * @param {UserProfile} [userProfile]
 * @param {function} dispatch
 * @return {JSX.Element}
 * @constructor
 */
function GameSection({ dispatch }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [games, setGames] = React.useState([]);
  const [statistics, setStatistics] = React.useState({});
  const [isLoadingGames, setIsLoadingGames] = React.useState(true);

  // Initially sampling games
  React.useEffect(() => {
    const [gamesPromise, gamesXHR] = sampleGames({ count: GAME_SAMPLE_COUNT });
    gamesPromise
      .then((result) => {
        setGames(result);
      })
      .catch((e) => {
        console.error(e);
        dispatch(setErrorMessage("Error while sampling games"));
      })
      .finally(() => setIsLoadingGames(false));
    return () => gamesXHR.abort();
  }, [dispatch]);

  // Load statistics when samples are set
  React.useEffect(() => {
    if (isLoadingGames) return;
    const gamesStatisticsPromise = Promise.allSettled(
      games.map(({ ID }) => {
        const [statisticsPromise] = getGameStatistics({ gameID: ID });
        return statisticsPromise;
      }),
    );

    gamesStatisticsPromise.then((results) => {
      // Build a statistics look up table
      const resolvedStats = {};
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "fulfilled") {
          const { ID, ...val } = results[i].value;
          resolvedStats[ID] = val;
        }
      }
      setStatistics(resolvedStats);
    });
  }, [games, isLoadingGames]);

  const buildGameCardsCarousel = (items) => {
    // Clamped to 8 maximum
    const gameCards = [...Array(Math.min(items.length, TOP_PAGE__MAX_GAME_DISPLAYED)).keys()].map((idx) => (
      <BrowseGameCard game={items[idx]} xs={6} sm={2} key={items[idx].ID} />
    ));

    return (
      <Box>
        <Grid container spacing={1} pb={theme.spacing(2)}>
          <Grid item>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Featured
            </Typography>
          </Grid>
          <Grid item>
            <Link component={RouterLink} to="/browse/game" variant="h6" style={{ fontWeight: "bold" }}>
              Games
            </Link>
          </Grid>
        </Grid>
        <Grid spacing={1} container sx={{ flexWrap: "nowrap", overflowX: "scroll" }}>
          {gameCards}
        </Grid>
      </Box>
    );
  };

  const buildGameCards = (items) => {
    // Clamped to 8 maximum
    const gameCards = [...Array(Math.min(items.length, TOP_PAGE__MAX_GAME_DISPLAYED)).keys()].map((idx) => (
      <Grid key={items[idx].ID} item xs={1}>
        <TopGameCard game={items[idx]} statistics={statistics[items[idx].ID]} />
      </Grid>
    ));
    return (
      <Box>
        <Grid container spacing={1} pb={theme.spacing(2)}>
          <Grid item>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Featured
            </Typography>
          </Grid>
          <Grid item>
            <Link component={RouterLink} to="/browse/game" variant="h6" style={{ fontWeight: "bold" }}>
              Games
            </Link>
          </Grid>
        </Grid>
        <Grid container columns={8} spacing={1} pl={theme.spacing(1)}>
          {gameCards}
        </Grid>
      </Box>
    );
  };
  return isMobile ? buildGameCardsCarousel(games) : buildGameCards(games);
}

GameSection.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(GameSection);
