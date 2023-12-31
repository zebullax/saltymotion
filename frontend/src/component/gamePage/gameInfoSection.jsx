/* eslint-disable spaced-comment */
// React/Redux
import React from "react";
import PropTypes from "prop-types";
// MUI
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import Tooltip from '@mui/material/Tooltip';
import TextField from "@mui/material/TextField";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
// import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
// import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
// Saltymotion
import TagSection from "./tagSection";
import { gamePropTypes, gameStatisticsPropTypes, tagPropTypes } from "../../../typedef/propTypes";

/**
 * Render the game info section for mobile
 * @param {string} userID
 * @param {Game} game
 * @param {Tag[]} tags
 * @param {boolean} isFollowing
 * @param {function} [onToggleFollow]
 * @return {JSX.Element}
 */
function GameInfoMobileSection({ userID, game, tags, isFollowing, onToggleFollow }) {
  const theme = useTheme();
  return (
    <Grid item xs={12} container style={{ textAlign: "center", marginUp: theme.spacing(2) }}>
      <Grid item xs={12} container spacing={1} alignItems="center">
        <Grid item>
          <Typography variant="subtitle1">
            {game.releaseYear} {"\u00B7"} {game.editor}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            color="primary"
            size="large"
            disabled={onToggleFollow === undefined}
            onClick={() => onToggleFollow(!isFollowing, userID, game.ID, game.name)}
          >
            {isFollowing ? <FavoriteIcon fontSize="inherit" /> : <HeartBrokenIcon fontSize="inherit" />}
          </IconButton>
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: theme.spacing(1) }}>
        <TextField
          multiline
          disabled
          fullWidth
          InputProps={{ disableUnderline: true }}
          variant="standard"
          value={game.introduction.length !== 0 ? game.introduction : "No introduction for this game..."}
        />
      </Grid>
      <Grid item xs={12} className="tag_list" style={{ marginBottom: theme.spacing(1), marginTop: "4px" }}>
        <TagSection tags={tags} />
      </Grid>
    </Grid>
  );
}

GameInfoMobileSection.propTypes = {
  userID: PropTypes.string,
  game: gamePropTypes.isRequired,
  tags: PropTypes.arrayOf(tagPropTypes).isRequired,
  isFollowing: PropTypes.bool,
  onToggleFollow: PropTypes.func,
};

GameInfoMobileSection.defaultProps = {
  userID: "",
  onToggleFollow: undefined,
  isFollowing: false,
};

/**
 * Render the game info section
 * @param {string} userID
 * @param {Game} game
 * @param {GameStatistics} statistics
 * @param {Tag[]} tags
 * @param {boolean} [isFollowing]
 * @param {function} [onToggleFollow]
 * @return {JSX.Element}
 */
function GameInfoSection({ userID, game, tags, isFollowing, onToggleFollow }) {
  const theme = useTheme();
  return (
    <Grid container alignContent="flex-end">
      <Grid item container mb={theme.spacing(1)} alignItems="center">
        <Grid item>
          <Typography variant="h4" component="span" style={{ fontWeight: "bold" }}>
            {game.name}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton
            color="primary"
            size="large"
            disabled={onToggleFollow === undefined}
            onClick={() => onToggleFollow(!isFollowing, userID, game.ID, game.name)}
          >
            {isFollowing ? <FavoriteIcon fontSize="inherit" /> : <HeartBrokenIcon fontSize="inherit" />}
          </IconButton>
        </Grid>
      </Grid>
      {/*<Grid container alignItems="center" spacing={2}>*/}
      {/*  <Grid item display="flex" alignItems="baseline">*/}
      {/*    <Tooltip title="Number of reviewers">*/}
      {/*      <HeadsetMicIcon />*/}
      {/*    </Tooltip>*/}
      {/*    <Typography component="span">*/}
      {/*      {statistics.nbReviewers}*/}
      {/*    </Typography>*/}
      {/*  </Grid>*/}
      {/*  <Grid item display="flex" alignItems="baseline">*/}
      {/*    <Tooltip title="Number of workshops">*/}
      {/*      <VideoLibraryIcon />*/}
      {/*    </Tooltip>*/}
      {/*    <Typography component="span">*/}
      {/*      {statistics.nbWorkshops}*/}
      {/*    </Typography>*/}
      {/*  </Grid>*/}
      {/*</Grid>*/}
      <Grid item xs={12} style={{ marginBottom: theme.spacing(1), maxWidth: 500 }}>
        <TextField
          multiline
          disabled
          fullWidth
          InputProps={{ disableUnderline: true }}
          variant="standard"
          value={game.introduction.length !== 0 ? game.introduction : "No introduction for this game..."}
        />
      </Grid>
      <Grid container alignItems="center" spacing={2}>
        <Grid item display="flex" alignItems="baseline">
          <Typography variant="subtitle1">
            {game.releaseYear} {"\u00B7"} {game.editor}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className="tag_list" style={{ marginBottom: theme.spacing(1), marginTop: "4px" }}>
        <TagSection tags={tags} />
      </Grid>
    </Grid>
  );
}

GameInfoSection.propTypes = {
  userID: PropTypes.string,
  statistics: gameStatisticsPropTypes.isRequired,
  game: gamePropTypes.isRequired,
  tags: PropTypes.arrayOf(tagPropTypes).isRequired,
  isFollowing: PropTypes.bool,
  onToggleFollow: PropTypes.func,
};

GameInfoSection.defaultProps = {
  userID: "",
  onToggleFollow: undefined,
  isFollowing: false,
};

export { GameInfoMobileSection, GameInfoSection };
