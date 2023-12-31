// React
import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink, useHistory } from "react-router-dom";
// MUI
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import FavoriteIcon from "@mui/icons-material//Favorite";
import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import AvatarGroup from "@mui/material/AvatarGroup";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
// Saltymotion
import Tag from "./tag";
import { userPublicProfilePropTypes } from "../../../typedef/propTypes";
import { resolveCountryCode } from "../../lib/countryCode";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import { buildSocialBadge } from "./utility";

/**
 * Render a reviewer card with details section overlay
 * @param {boolean} isFollowing
 * @param {boolean} isFollowingDisabled
 * @param {boolean} isGamePoolAvatarDisplayed
 * @param {function} onFavoriteClick
 * @param {UserPublicProfile} reviewer
 * @return {JSX.Element}
 */
export default function ReviewerCardsSmallFormat({
  isFollowing,
  isFollowingDisabled,
  isGamePoolAvatarDisplayed,
  onFavoriteClick,
  reviewer,
}) {
  const history = useHistory();
  const gamePoolAvatars = React.useMemo(() => {
    if (isGamePoolAvatarDisplayed) {
      return reviewer.gamePool.map((game) => (
        <Avatar key={game.ID} alt={game.name} src={makeS3Link(s3LinkCategory.gameCover, game.ID)} />
      ));
    }
    return null;
  }, [isGamePoolAvatarDisplayed, reviewer]);

  return (
    <Card style={{ position: "relative" }}>
      <CardHeader
        avatar={<AvatarGroup max={3}>{gamePoolAvatars}</AvatarGroup>}
        action={
          <IconButton aria-label="Follow" disabled={isFollowingDisabled} onClick={onFavoriteClick}>
            <FavoriteIcon fontSize="large" color={isFollowing ? "primary" : "disabled"} />
          </IconButton>
        }
        subheader={reviewer.timezone}
        title={
          <Typography
            onClick={() => history.push(`/reviewer/${reviewer.ID}`)}
            style={{ cursor: "pointer" }}
            noWrap
            color="textPrimary"
          >
            {reviewer.name}
          </Typography>
        }
      />
      <CardMedia image={makeS3Link(s3LinkCategory.profilePicture, reviewer.ID)} sx={{ height: "200px" }} />
    </Card>
  );
}

ReviewerCardsSmallFormat.propTypes = {
  isFollowing: PropTypes.bool,
  isFollowingDisabled: PropTypes.bool,
  isGamePoolAvatarDisplayed: PropTypes.bool,
  onFavoriteClick: PropTypes.func.isRequired,
  reviewer: userPublicProfilePropTypes.isRequired,
};

ReviewerCardsSmallFormat.defaultProps = {
  isGamePoolAvatarDisplayed: false,
  isFollowingDisabled: false,
  isFollowing: false,
};

/**
 *********************************************************************************************************
 *********************************************************************************************************
 *********************************************************************************************************
 * */

/**
 * Render a horizontal chip like card for reviewer
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export function ReviewerChip(props) {
  return (
    <Card>
      <div>
        <CardContent>
          <Typography variant={props.isDense ? "subtitle1" : "h6"}>{props.reviewer.name}</Typography>
          {props.isTimezoneDisplay && (
            <Typography variant={props.isDense ? "subtitle2" : "subtitle1"} color="textSecondary">
              {props.reviewer.timezone}
            </Typography>
          )}
        </CardContent>
        {props.hasControls === true && (
          <div>
            <IconButton aria-label="save to favorite">
              <FavoriteIcon />
            </IconButton>
          </div>
        )}
      </div>
      <CardMedia image={makeS3Link(s3LinkCategory.profilePicture, props.reviewer.ID)} title={props.reviewer.name} />
    </Card>
  );
}

ReviewerChip.propTypes = {
  hasControls: PropTypes.bool,
  isDense: PropTypes.bool,
  isTimezoneDisplay: PropTypes.bool,
  reviewer: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nbReview: PropTypes.number.isRequired,
    avgScore: PropTypes.number, // could be null
    timezone: PropTypes.string.isRequired,
  }),
};

ReviewerChip.defaultProps = {
  hasControls: true,
  isDense: false,
  isTimezoneDisplay: true,
};

/**
 *********************************************************************************************************
 *********************************************************************************************************
 *********************************************************************************************************
 * */

/**
 * Render a chip used to show ranked reviewers
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export function RankReviewerChip(props) {
  const theme = useTheme();
  return (
    <Grid container style={{ marginBottom: theme.spacing(1) }} spacing={1} alignItems="flex-end">
      <Grid item xs={2} style={{ alignSelf: "center" }}>
        <Avatar src={makeS3Link(s3LinkCategory.profilePicture, props.reviewer.ID)} />
      </Grid>
      <Grid item xs={5}>
        <Grid item>
          <Link variant="subtitle1" component={RouterLink} to={`/reviewer/${props.reviewer.ID}`}>
            {props.reviewer.name}
          </Link>
        </Grid>
      </Grid>
      <Grid item xs={5} container spacing={1}>
        <Grid item>
          <Typography variant={props.isDense ? "subtitle2" : "h6"}>{props.reviewer.nbReview} </Typography>
        </Grid>
        <Grid item>
          <Icon className="fas fa-arrow-circle-up" color="primary" />
        </Grid>
        <Grid item>
          <Typography variant={props.isDense ? "subtitle2" : "h6"}>
            {Number.isNaN(props.reviewer.avgScore) ? "N/A" : props.reviewer.avgScore}
          </Typography>
        </Grid>
        <Grid item>
          <Icon className="far fa-star" color="secondary" />
        </Grid>
      </Grid>
    </Grid>
  );
}

RankReviewerChip.propTypes = {
  isDense: PropTypes.bool,
  reviewer: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    registrationDate: PropTypes.instanceOf(Date).isRequired,
    nbReview: PropTypes.number.isRequired,
    avgScore: PropTypes.number,
    timezone: PropTypes.string.isRequired,
  }),
};

RankReviewerChip.defaultProps = {
  isDense: false,
};

/**
 * Render the ranked reviewers for non dense mode
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
export function TopReviewers(props) {
  const buildTopReviewersCards = (reviewers) =>
    reviewers.map((reviewer, idx) => <RankReviewerChip isDense={false} reviewer={reviewer} key={idx} />);

  return <Grid container>{buildTopReviewersCards(props.reviewers)}</Grid>;
}

TopReviewers.propTypes = {
  isDense: PropTypes.bool.isRequired,
  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      ID: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      nbReview: PropTypes.number.isRequired,
      avgScore: PropTypes.number,
    }),
  ).isRequired,
};

/**
 *********************************************************************************************************
 *********************************************************************************************************
 *********************************************************************************************************
 * */

/**
 * Render reviewer card
 * @param {Reviewer} reviewer
 * @return {JSX.Element}
 * @constructor
 */
function ReviewerCardV2({ reviewer }) {
  const theme = useTheme();
  const history = useHistory();
  return (
    <div onClick={() => history.push(`/reviewer/${reviewer.ID}`)} style={{ cursor: "pointer" }}>
      <div
        style={{
          paddingTop: "75%",
          borderRadius: "4px 4px 0 0",
          position: "relative",
          backgroundColor: alpha(theme.palette.text.secondary, 0.15),
          backgroundSize: "cover",
          backgroundPositionY: "center",
          backgroundImage: `url(${makeS3Link(s3LinkCategory.profilePicture, reviewer.ID)})`,
        }}
      />
      {/* 30 is half the avatar size and 8 is padding */}
      <Paper
        style={{
          padding: theme.spacing(1),
          borderRadius: "0 0 4px 4px",
          marginTop: "-38px",
          textAlign: "center",
        }}
      >
        <Avatar
          imgProps={{ crossOrigin: "anonymous" }}
          src={makeS3Link(s3LinkCategory.gameCover, reviewer.gamePool[0].ID)}
          style={{
            position: "relative",
            height: "60px",
            width: "60px",
            marginLeft: "auto",
            marginRight: "auto",
            borderStyle: "solid",
            borderColor: "black",
          }}
        />
        <Typography variant="h6" component="span" noWrap style={{ fontWeight: "bold" }}>
          {reviewer.name}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {resolveCountryCode(reviewer.countryCode)}
        </Typography>
      </Paper>
    </div>
  );
}

ReviewerCardV2.propTypes = {
  reviewer: PropTypes.object.isRequired,
};

export { ReviewerCardV2 };

/**
 * Build the reviewer card used in profile
 * @param {UserPublicProfile} reviewer
 * @param {boolean} isFollowingDisabled
 * @param {boolean} isFavorite
 * @param {function} onSetFavorite
 * @return {JSX.Element}
 * @constructor
 */
function ReviewerCardV3({ reviewer, isFollowingDisabled, isFavorite, onSetFavorite }) {
  const theme = useTheme();
  const buildTags = (tags) =>
    [...Array(Math.min(tags.length, 5)).keys()].map((idx) => (
      <Grid item key={idx}>
        <Tag size="small" name={tags[idx].name} id={tags[idx].ID} color="primary" />
      </Grid>
    ));

  const tooltipText = isFollowingDisabled
    ? "You can't add yourself as favorite"
    : isFavorite
    ? "Remove from favorite"
    : "Add to favorite";
  return (
    <div style={{ maxWidth: "250px" }}>
      <div
        style={{
          width: "100%",
          paddingTop: "100%",
          borderRadius: "4px 4px 0 0",
          position: "relative",
          backgroundSize: "cover",
          backgroundPositionY: "center",
          backgroundImage: `url(${makeS3Link(s3LinkCategory.profilePicture, reviewer.ID)})`,
          backgroundColor: alpha(theme.palette.text.secondary, 0.15),
        }}
      >
        <Typography
          variant="h6"
          component="span"
          noWrap
          style={{
            fontWeight: "bold",
            position: "absolute",
            bottom: "0",
            left: 0,
            paddingLeft: "10px",
            paddingBottom: "10px",
            width: "100%",
            background: `linear-gradient(90deg, ${alpha(
              theme.palette.background.default,
              0.85,
            )}, rgba(255,255,255,0) 100%)`,
          }}
        >
          {reviewer.name}
        </Typography>
        <Tooltip
          title={tooltipText}
          style={{
            position: "absolute",
            top: "0",
            right: 0,
            paddingRight: "10px",
            paddingTop: "10px",
          }}
        >
          <span>
            <IconButton disabled={isFollowingDisabled} onClick={() => onSetFavorite(!isFavorite)}>
              <FavoriteIcon fontSize="large" color={isFavorite ? "primary" : "disabled"} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
      <Paper style={{ padding: `${theme.spacing(1)} ${theme.spacing(2)}` }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="caption" style={{ fontWeight: "bold" }}>
              Self introduction
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginTop: theme.spacing(1) }}>
              {reviewer.selfIntroduction ?? "No self introduction yet..."}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" style={{ fontWeight: "bold" }}>
              Top tags
            </Typography>
            {reviewer.tags.length !== 0 && (
              <Grid container spacing={1} style={{ marginTop: theme.spacing(1) }}>
                {buildTags(reviewer.tags)}
              </Grid>
            )}
            {reviewer.tags.length === 0 && (
              <Typography variant="body2" color="textSecondary" style={{ marginTop: theme.spacing(1) }}>
                {reviewer.selfIntroduction ?? "No tags yet..."}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {buildSocialBadge({ reviewerSnsAccounts: reviewer.snsAccounts, fontSize: theme.spacing(3) })}
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

ReviewerCardV3.propTypes = {
  isFollowingDisabled: PropTypes.bool.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  reviewer: userPublicProfilePropTypes.isRequired,
  onSetFavorite: PropTypes.func.isRequired,
};

export { ReviewerCardV3 };

/**
 * Render reviewer card
 * @param {Reviewer} reviewer
 * @param {number} defaultBounty
 * @param {number} bounty
 * @param {function} onBountyUpdate
 * @param {function} onRemove
 * @return {JSX.Element}
 * @constructor
 */
function ReviewerCardWithBountyV2({ reviewer, defaultBounty, bounty, onBountyUpdate, onRemove }) {
  const theme = useTheme();
  return (
    <>
      <div
        style={{
          paddingTop: "75%",
          borderRadius: "4px 4px 0 0",
          position: "relative",
          backgroundColor: "#333333",
          backgroundSize: "cover",
          backgroundPositionY: "center",
          backgroundImage: `url(${makeS3Link(s3LinkCategory.profilePicture, reviewer.ID)})`,
        }}
      />
      {/* 30 is half the avatar size and 8 is padding */}
      <Paper
        style={{
          padding: theme.spacing(1),
          borderRadius: "0 0 4px 4px",
          marginTop: "-38px",
          textAlign: "center",
        }}
      >
        <Avatar
          src={makeS3Link(s3LinkCategory.gameCover, reviewer.gamePool[0].ID)}
          style={{
            position: "relative",
            height: "60px",
            width: "60px",
            marginLeft: "auto",
            marginRight: "auto",
            borderStyle: "solid",
            borderColor: "black",
          }}
        />
        <Typography variant="h6" component="span" noWrap style={{ fontWeight: "bold" }}>
          {reviewer.name}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {resolveCountryCode(reviewer.countryCode)}
        </Typography>
        <TextField
          sx={{ marginTop: theme.spacing(2) }}
          variant="filled"
          label="bounty"
          required
          fullWidth
          defaultValue={defaultBounty}
          onChange={(evt) => onBountyUpdate(reviewer.ID, evt.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        >
          {bounty}
        </TextField>
      </Paper>
    </>
  );
}

ReviewerCardWithBountyV2.propTypes = {
  reviewer: PropTypes.object.isRequired,
  defaultBounty: PropTypes.number.isRequired,
  bounty: PropTypes.number,
  onBountyUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export { ReviewerCardWithBountyV2 };

/**
 * Render a skeleton placeholder for reviewer with bounty
 * @return {JSX.Element}
 * @constructor
 */
function ReviewerCardWithBountyV2Skeleton() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <>
      <div
        style={{
          paddingTop: "75%",
          borderRadius: "4px 4px 0 0",
          position: "relative",
          backgroundColor: isDarkMode ? "#333333" : "#f0f0f0",
          backgroundSize: "cover",
          backgroundPositionY: "center",
          // backgroundImage: `url(${makeS3Link(s3LinkCategory.profilePicture, reviewer.ID)})`,
        }}
      />
      {/* 30 is half the avatar size and 8 is padding */}
      <Paper
        style={{
          padding: theme.spacing(1),
          borderRadius: "0 0 4px 4px",
          marginTop: "-38px",
          textAlign: "center",
        }}
      >
        <Skeleton
          animation={false}
          variant="circular"
          style={{
            position: "relative",
            height: "60px",
            width: "60px",
            marginLeft: "auto",
            marginRight: "auto",
            borderStyle: "solid",
            borderColor: "black",
          }}
        />
        <Typography variant="h6" component="span" noWrap style={{ fontWeight: "bold" }}>
          <Skeleton animation={false} variant="text" />
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          <Skeleton animation={false} variant="text" />
        </Typography>
        <TextField
          sx={{ marginTop: theme.spacing(2) }}
          variant="filled"
          label="bounty"
          required
          disabled
          fullWidth
          defaultValue={0}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        >
          0
        </TextField>
      </Paper>
    </>
  );
}

export { ReviewerCardWithBountyV2Skeleton };
