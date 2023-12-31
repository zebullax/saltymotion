// React
import React from "react";
import PropTypes from "prop-types";
// Saltymotion
// MUI
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material//Delete";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
// Misc
import moment from "moment";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";

/**
 * Construct a card for atelier comment
 * @params {string} ID
 * @params {string} userID
 * @params {string} userNickname
 * @params {string} timestamp
 * @params {string} content
 * @params {boolean} isSelf
 * @params {function} onDelete
 * @return {JSX.Element}
 */
export default function WorkshopCommentCard({ ID, userID, userNickname, timestamp, content, isSelf, onDelete }) {
  const [isActionVisible, setIsActionVisible] = React.useState(false);
  const theme = useTheme();
  return (
    <Grid
      container
      onMouseEnter={() => setIsActionVisible(true)}
      onMouseLeave={() => setIsActionVisible(false)}
      justify="flex-start"
      alignItems="flex-start"
      spacing={1}
      style={{ paddingBottom: theme.spacing(1) }}
    >
      <Grid item xs={2} sm={1}>
        <Avatar src={makeS3Link(s3LinkCategory.profilePicture, userID)} />
      </Grid>
      <Grid item xs={9} sm={10}>
        <Paper elevation={0} style={{ backgroundColor: "unset" }}>
          <div className="display_flex">
            <Typography variant="subtitle2" color="textPrimary">
              {userNickname}
              &nbsp;
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {moment(new Date(timestamp)).fromNow()}
            </Typography>
          </div>
          <Typography variant="subtitle2" color="textSecondary">
            {content}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={1}>
        <IconButton
          style={{ visibility: isSelf && isActionVisible ? "visible" : "hidden" }}
          onClick={() => onDelete(ID)}
        >
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

WorkshopCommentCard.propTypes = {
  ID: PropTypes.number.isRequired,
  userID: PropTypes.string.isRequired,
  userNickname: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  isSelf: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};
