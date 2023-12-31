// React
import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
// MUI
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
// Misc
import moment from "moment";
// Saltymotion
import { makeS3Link, s3LinkCategory } from "../../lib/utility";

/**
 * Render a single activity item from the activity dropdown
 * @param {object} activity
 * @return {JSX.Element}
 * @constructor
 */
function NotificationItemNoRef(activity) {
  return (
    <MenuItem alignItems="flex-start" component={RouterLink} to={activity.href}>
      <ListItemIcon>
        <Avatar
          alt={activity.sourceActor.user.name}
          src={makeS3Link(s3LinkCategory.profilePicture, activity.sourceActor.user.ID)}
        />
      </ListItemIcon>
      <ListItemText
        primary={activity.summary}
        secondary={
          <>
            <Typography style={{ display: "inline" }} component="span" variant="body2" color="textPrimary">
              {activity.sourceActor.user.name}
            </Typography>
            &nbsp;-&nbsp;
            {moment(activity.timestamp).fromNow()}
          </>
        }
      />
    </MenuItem>
  );
}

NotificationItemNoRef.propTypes = {
  // summary: PropTypes.string.isRequired,
  // href: PropTypes.string.isRequired,
  // timestamp: PropTypes.string.isRequired,
  sourceActor: PropTypes.shape({
    user: PropTypes.shape({
      ID: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const NotificationItem = React.forwardRef((props, ref) => (
  <div ref={ref}>
    <NotificationItemNoRef {...props} />
  </div>
));

NotificationItem.displayName = "NotificationItem";

/**
 * Create a placeholder to allow user to load additional notifications
 * @param {function} onClick
 * @param {boolean} [isLoading = false]
 * @constructor
 */
function NotificationAdditionalLoaderNoRef({ onClick, isLoading }) {
  return (
    <MenuItem alignItems="flex-start" style={{ cursor: "pointer", justifyContent: "center" }} onClick={onClick}>
      <ListItemIcon>{isLoading && <CircularProgress color="primary" />}</ListItemIcon>
      <ListItemText
        primary={
          <Typography style={{ display: "inline" }} component="span" variant="body2" color="textPrimary">
            Load more...
          </Typography>
        }
      />
    </MenuItem>
  );
}

NotificationAdditionalLoaderNoRef.propTypes = {
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

NotificationAdditionalLoaderNoRef.defaultProps = {
  isLoading: false,
};

const NotificationAdditionalLoader = React.forwardRef((props, ref) => (
  <div ref={ref}>
    <NotificationAdditionalLoaderNoRef {...props} />
  </div>
));

NotificationAdditionalLoader.displayName = "NotificationAdditionalLoader";

/**
 * Create a placeholder item for empty notifications
 * @return {JSX.Element}
 * @constructor
 */
export function NotificationItemPlaceholderNoRef() {
  return (
    <MenuItem component="div" alignItems="flex-start">
      <ListItemIcon>
        <Avatar />
      </ListItemIcon>
      <ListItemText
        primary="You have no activities"
        secondary={
          <Typography style={{ display: "inline" }} component="span" variant="body2" color="textPrimary">
            Why not comment on some workshop videos ?
          </Typography>
        }
      />
    </MenuItem>
  );
}

const NotificationItemPlaceholder = React.forwardRef((props, ref) => (
  <div ref={ref}>
    <NotificationItemPlaceholderNoRef {...props} />
  </div>
));

NotificationItemPlaceholder.displayName = "NotificationItemPlaceholder";

/**
 * Render a skeleton notification item
 * @return {JSX.Element}
 * @constructor
 */
function NotificationItemSkeletonNoRef() {
  return (
    <MenuItem>
      <ListItemIcon>
        <Avatar />
      </ListItemIcon>
      <ListItemText
        primary={<Skeleton variant="text" animation="wave" />}
        secondary={<Skeleton variant="text" animation="wave" />}
      />
    </MenuItem>
  );
}

const NotificationItemSkeleton = React.forwardRef((props, ref) => (
  <div ref={ref}>
    <NotificationItemSkeletonNoRef {...props} />
  </div>
));

NotificationItemSkeleton.displayName = "NotificationItemSkeleton";

export {
  NotificationItem as default,
  NotificationItemPlaceholder,
  NotificationItemSkeleton,
  NotificationAdditionalLoader,
};
