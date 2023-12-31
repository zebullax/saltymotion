// React
import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
// MUI
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardHeader, { cardHeaderClasses } from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material//Delete";
import PublishIcon from "@mui/icons-material/Publish";
import InputAdornment from "@mui/material/InputAdornment";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import SsidChartIcon from "@mui/icons-material/SsidChart";
// Saltymotion
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import { gamePoolGamePropTypes, gameStatisticsPropTypes } from "../../../typedef/propTypes";

/**
 * Render a browse game card w/o all the grid units for top page
 * @param {Game} game
 * @param {GameStatistics} statistics
 * @return {JSX.Element}
 * @constructor
 */
export function TopGameCard({ game, statistics }) {
  const history = useHistory();
  return (
    <Box onClick={() => history.push(`/game/${game.ID}`)} sx={{ cursor: "pointer" }}>
      <Box style={{ overflow: "hidden", position: "relative", paddingTop: "133%" }}>
        <img
          src={makeS3Link(s3LinkCategory.gameCover, game.ID)}
          className="scaleUpOnHover"
          style={{
            objectFit: "cover",
            height: "100%",
            width: "100%",
            position: "absolute",
            left: 0,
            top: 0,
          }}
          crossOrigin="anonymous"
          alt={game.name}
        />
      </Box>
      <Typography variant="subtitle2" color="textPrimary" noWrap gutterBottom>
        {game.name}
      </Typography>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        {statistics.nbWorkshops} workshops
      </Typography>
    </Box>
  );
}

TopGameCard.propTypes = {
  game: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  statistics: gameStatisticsPropTypes,
};

TopGameCard.defaultProps = {
  statistics: { nbReviewers: 0, nbWorkshops: 0 },
};

/**
 * Render a game card used on browse page
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function BrowseGameCard(props) {
  const history = useHistory();
  return (
    <Grid
      container
      item
      xs={props.xs}
      lg={props.lg}
      sm={props.sm}
      style={
        props.overrideXsFlexBasis === undefined
          ? { cursor: "pointer", flexShrink: 0 }
          : { flexBasis: `${props.overrideXsFlexBasis}%`, maxWidth: `${props.overrideXsFlexBasis}%`, cursor: "pointer" }
      }
      onClick={() => history.push(`/game/${props.game.ID}`)}
    >
      <Grid item xs={12} style={{ overflow: "hidden", position: "relative", paddingTop: "133%" }}>
        <img
          src={makeS3Link(s3LinkCategory.gameCover, props.game.ID)}
          style={{
            objectFit: "cover",
            height: "100%",
            width: "100%",
            position: "absolute",
            left: 0,
            top: 0,
          }}
          crossOrigin="anonymous"
          alt={props.game.name}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2" color="textPrimary" noWrap gutterBottom>
          {props.game.name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {props.game.nbAtelier !== undefined && (
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {props.game.nbAtelier} ateliers
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

BrowseGameCard.propTypes = {
  xs: PropTypes.number,
  lg: PropTypes.number,
  sm: PropTypes.number,
  overrideXsFlexBasis: PropTypes.number,
  game: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nbAtelier: PropTypes.number,
  }),
};

/**
 * Render a game card used in reviewer requirement settings
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export function ReviewerProfileGameCard(props) {
  return (
    <Card>
      <CardHeader
        title={props.game.name}
        titleTypographyProps={{ noWrap: true, variant: "subtitle2" }}
        sx={{ [`& .${cardHeaderClasses.content}`]: { minWidth: 0 } }}
        action={
          <IconButton onClick={() => props.onDelete(props.game.ID)}>
            <DeleteIcon />
          </IconButton>
        }
      />
      <CardMedia
        image={makeS3Link(s3LinkCategory.gameCover, props.game.ID)}
        style={{ height: 150 }}
        title={props.game.name}
      />
      <CardContent>
        <TextField
          fullWidth
          label="Bounty"
          variant="standard"
          onChange={(event) => props.onMinimumBountyChange(props.game.ID, Number.parseInt(event.target.value, 10))}
          InputProps={{ startAdornment: <InputAdornment position="start">{"\u00a5"}</InputAdornment> }}
          placeholder="Minimum bounty"
          defaultValue={props.game.minimumBounty}
          type="number"
        />
      </CardContent>
    </Card>
  );
}

ReviewerProfileGameCard.propTypes = {
  game: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    minimumBounty: PropTypes.number.isRequired,
  }),
  onDelete: PropTypes.func.isRequired,
  onMinimumBountyChange: PropTypes.func.isRequired,
};

/**
 * Render a placeholder card for reviewable game to match `ReviewerProfileGameCard`
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export function ReviewerProfileGameCardSkeleton(props) {
  return (
    <Card>
      <CardHeader
        title={" "}
        action={
          <IconButton disabled>
            <DeleteIcon />
          </IconButton>
        }
      />
      <CardContent style={{ padding: 0 }}>
        <Skeleton animation={false} style={{ height: 150 }} variant="rect" />
      </CardContent>
      <CardContent>
        <TextField
          fullWidth
          label="Bounty"
          variant="standard"
          disabled
          InputProps={{ startAdornment: <InputAdornment position="start">¥</InputAdornment> }}
          placeholder="Min. bounty"
          type="number"
        />
      </CardContent>
    </Card>
  );
}

/**
 * Render a game card used in reviewer page
 * @param {ReviewerGame} game
 * @return {JSX.Element}
 */
export function ReviewerPageGameCard({ game }) {
  const heroBackground = `url(${makeS3Link(s3LinkCategory.gameCover, game.ID)})`;

  return (
    <Box
      sx={{
        overflow: "hidden",
        height: 0,
        backgroundImage: heroBackground,
        // backgroundSize: 'cover',
        backgroundPositionX: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        paddingTop: "150%",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backgroundSize: "cover",
        }}
      />
      <IconButton
        color="secondary"
        size="large"
        aria-label="Create workshop"
        style={{ position: "absolute", top: "16px", right: "16px" }}
      >
        <PublishIcon />
      </IconButton>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <Grid container sx={{ position: "absolute", bottom: 0 }}>
          <Grid item padding="16px">
            <Typography variant="subtitle2" component="span" fontWeight="bold">
              {game.name}
            </Typography>
          </Grid>
          <Grid item xs={12} container spacing={2} padding="16px">
            <Grid item>
              <SsidChartIcon color="primary" style={{ marginRight: "8px" }} />
              <Typography variant="subtitle2" fontWeight="bold" component="span">
                {game.score ?? 0}
                {" Score"}
              </Typography>
            </Grid>
            <Grid item>
              <VideoLibraryIcon color="primary" style={{ marginRight: "8px" }} />
              <Typography variant="subtitle2" fontWeight="bold" component="span">
                {game.nbWorkshops}
                {" Workshops"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

ReviewerPageGameCard.propTypes = {
  game: gamePoolGamePropTypes.isRequired,
};
