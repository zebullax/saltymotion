// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material//Save";
import Button from "@mui/material/Button";

const notificationSettings = (props) => [
  {
    value: props.isNotifyOnReviewOpportunity,
    // eslint-disable-next-line max-len
    description:
      "When an user creates an atelier and picks you as a potential reviewer, automatically receive a notification",
    label: "Send a mail on review opportunity",
    callback: () => props.onNotifyOnReviewOpportunity(!props.isNotifyOnReviewOpportunity),
  },
  {
    value: props.isNotifyOnReviewComplete,
    description: "When a reviewer completed and submitted your review, automatically receive a notification",
    label: "Send a mail on review completion",
    callback: () => props.onNotifyOnReviewComplete(!props.isNotifyOnReviewComplete),
  },
  {
    value: props.isNotifyOnNewComment,
    description: "When a user write a new comment on your review, automatically receive a notification",
    label: "Send a mail on review comment",
    callback: () => props.onNotifyOnNewComment(!props.isNotifyOnNewComment),
  },
  // {
  //   value: props.isNotifyOnFavoriteReviewerActivity,
  //   description: 'When one of your favorite reviewer publish a public review, automatically receive a notification',
  //   label: 'Send a mail on my favorites reviewer',
  //   callback: () => props.onNotifyOnFavoriteReviewerActivity(!props.isNotifyOnFavoriteReviewerActivity),
  // },
  // {
  //   value: props.isNotifyOnFavoriteGameActivity,
  //   description: 'When a new review is available among your favorite games, automatically receive a notification',
  //   label: 'Send a mail on my favorites game activity',
  //   callback: () => props.onNotifyOnFavoriteGameActivity(!props.isNotifyOnFavoriteGameActivity),
  // },
];

/**
 * Render Notification preference tabs
 * @param {Object} props
 * @return {JSX.Element}
 * @constructor
 */
export default function NotificationTab(props) {
  const theme = useTheme();
  const notificationRows = notificationSettings(props).map((notificationConfig, index) => (
    <Grid item xs={12} key={index}>
      <Typography variant="body2" color="textSecondary">
        {notificationConfig.description}
      </Typography>
      <FormControlLabel
        style={{ marginLeft: theme.spacing(2) }}
        control={<Checkbox checked={notificationConfig.value} onChange={notificationConfig.callback} />}
        label={notificationConfig.label}
      />
    </Grid>
  ));
  return (
    <Grid item xs={12} hidden={props.isHidden} container spacing={1}>
      <Grid item xs={12} style={{ marginBottom: theme.spacing(2) }}>
        <Typography variant="h6">Email notifications</Typography>
        <Divider />
      </Grid>
      {notificationRows}
      <Grid item container xs={12}>
        <Grid item>
          <Button
            variant="contained"
            disabled={!props.isSaveEnabled}
            onClick={props.onSaveNotificationPreference}
            color="secondary"
            startIcon={<SaveIcon />}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

NotificationTab.propTypes = {
  isHidden: PropTypes.bool,
  isSaveEnabled: PropTypes.bool,
  onSaveNotificationPreference: PropTypes.func.isRequired,
  isNotifyOnReviewOpportunity: PropTypes.bool,
  onNotifyOnReviewOpportunity: PropTypes.func.isRequired,
  isNotifyOnReviewComplete: PropTypes.bool,
  onNotifyOnReviewComplete: PropTypes.func.isRequired,
  isNotifyOnNewComment: PropTypes.bool,
  onNotifyOnNewComment: PropTypes.func.isRequired,
  isNotifyOnFavoriteActivity: PropTypes.bool,
  onNotifyOnFavoriteActivity: PropTypes.func.isRequired,
};

NotificationTab.defaultProps = {
  isHidden: false,
  isSaveEnabled: true,
  isNotifyOnReviewOpportunity: false,
  isNotifyOnReviewComplete: false,
  isNotifyOnNewComment: false,
  isNotifyOnFavoriteActivity: false,
};
