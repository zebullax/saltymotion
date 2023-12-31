// React
import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink, useHistory } from "react-router-dom";
// MUI
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
// Misc
import moment from "moment";
// Saltymotion
import { atelierPropTypes } from "../../../typedef/propTypes";
import { isAtelierComplete, isAtelierInProgress } from "../../lib/atelierStatus";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";

/**
 * Create default atelier card
 * @param {object} props
 * @return {JSX.Element}
 * @constructor
 */
function AtelierCard(props) {
  const history = useHistory();
  const statusLabel = isAtelierInProgress(props.atelier.currentStatus.ID)
    ? "In Progress"
    : isAtelierComplete(props.atelier.currentStatus.ID)
    ? "Complete"
    : "In Auction";
  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{ cursor: "pointer", position: "relative", paddingBottom: "56.25%" }}
        onClick={() => history.push(`/workshop/${props.atelier.ID}`)}
      >
        <img
          crossOrigin="anonymous"
          src={makeS3Link(s3LinkCategory.previewPicture, props.atelier.s3Key)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
          }}
          alt={props.atelier.title}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" noWrap>
          {props.atelier.title}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Link variant="subtitle2" component={RouterLink} to={`/game/${props.atelier.game.ID}`}>
          {props.atelier.game.name}
        </Link>
      </Grid>
      <Grid item xs={12} color="textSecondary">
        <Typography variant="subtitle2" noWrap>
          {/* eslint-disable-next-line max-len */}
          {moment(props.atelier.creationTimestamp).fromNow()} ·{props.atelier.stats.nbViews} views
          {props.isStatusDisplayed ? `· ${statusLabel}` : ""}
        </Typography>
      </Grid>
    </Grid>
  );
}

AtelierCard.propTypes = {
  showDescription: PropTypes.bool,
  isReviewable: PropTypes.bool,
  isStatusDisplayed: PropTypes.bool,
  atelier: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    creationTimestamp: PropTypes.string,
    s3Key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    currentStatus: PropTypes.shape({
      ID: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
    }),
    description: PropTypes.string,
    stats: PropTypes.shape({
      nbViews: PropTypes.number.isRequired,
      score: PropTypes.number.isRequired,
    }),
    game: PropTypes.shape({
      ID: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        ID: PropTypes.number,
        name: PropTypes.string,
      }),
    ),
  }),
};

AtelierCard.defaultProps = {
  isReviewable: false,
  isStatusDisplayed: false,
};

export default AtelierCard;

/**
 * Render an atelier card for recommended atelier
 * @param {object} props
 * @return {*}
 * @constructor
 */
export function RelatedAtelierCard(props) {
  const history = useHistory();
  return (
    <Card style={{ cursor: "pointer", display: "flex" }} onClick={() => history.push(`/workshop/${props.atelier.ID}`)}>
      <CardMedia
        image={`https://saltymotion-atelier-preview.s3-ap-northeast-1.amazonaws.com/${props.atelier.s3Key}`}
        style={{
          flexGrow: 0,
          flexShrink: 0,
          width: "170px",
          height: "100px",
        }}
        title={props.atelier.title}
      />
      <CardContent style={{ flexGrow: 1, maxWidth: "calc(100% - 170px)" }}>
        <Typography noWrap variant="subtitle2">
          {props.atelier.title}
        </Typography>
        <Typography noWrap variant="subtitle2" color="textSecondary">
          {props.atelier.uploaderNickname}
        </Typography>
        <Typography noWrap variant="subtitle2" color="textSecondary">
          {props.atelier.nbViews} views
        </Typography>
      </CardContent>
    </Card>
  );
}

RelatedAtelierCard.propTypes = {
  atelier: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    creationTimestamp: PropTypes.string,
    s3Key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    nbViews: PropTypes.number.isRequired,
    uploaderNickname: PropTypes.string.isRequired,
  }),
};

/**
 * Render a recommended workshop card
 * @param {AtelierDescription} atelier
 * @return {JSX.Element}
 * @constructor
 */
export function RecommendedWorkshop({ atelier }) {
  const history = useHistory();

  return (
    <Grid
      container
      columns={2}
      spacing={1}
      sx={{ cursor: "pointer" }}
      onClick={() => history.push(`/workshop/${atelier.ID}`)}
    >
      <Grid item xs={1}>
        <img
          crossOrigin="anonymous"
          src={`https://saltymotion-atelier-preview.s3-ap-northeast-1.amazonaws.com/${atelier.s3Key}`}
          alt={atelier.title}
          style={{ width: "100%", height: "100px", objectFit: "cover" }}
        />
      </Grid>
      <Grid item xs={1}>
        <Typography noWrap variant="subtitle2" fontWeight="bold">
          {atelier.title}
        </Typography>
        <Typography noWrap variant="subtitle2" color="textSecondary">
          {atelier.uploader.nickname}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" display="inline">
          {atelier.stats.nbViews}
          {"\u00A0views \u00B7\u00A0"}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" display="inline">
          {moment(atelier.creationTimestamp).fromNow()}
        </Typography>
      </Grid>
    </Grid>
  );
}

RecommendedWorkshop.propTypes = {
  atelier: atelierPropTypes.isRequired,
};
