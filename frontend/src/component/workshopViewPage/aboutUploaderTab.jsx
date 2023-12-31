// React/Redux
import React from "react";
import PropTypes from "prop-types";
// MUI
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
// Saltymotion
import { buildSocialBadge } from "../widget/utility";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import UserHook from "../../lib/hooks/user";

/**
 * Render the uploader tab
 * @param {string} uploaderID
 * @constructor
 */
export default function AboutUploaderTab({ uploaderID }) {
  const theme = useTheme();
  const [uploaderProfile, isLoading] = UserHook.useProfileLoader({ ID: uploaderID });
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          flexGrow: 0,
          flexBasis: "auto",
          flexShrink: 0,
          padding: theme.spacing(2),
        }}
      >
        {isLoading ? <Avatar /> : <Avatar src={makeS3Link(s3LinkCategory.profilePicture, uploaderProfile.ID)} />}
      </div>
      <div
        style={{
          flexGrow: 1,
          flexBasis: "100%",
          flexShrink: 1,
          padding: theme.spacing(2),
        }}
      >
        {isLoading && (
          <>
            <div>
              <Skeleton variant="text" style={{ width: "20%" }} />
            </div>
            <div>
              <Skeleton variant="text" style={{ width: "80%" }} />
            </div>
          </>
        )}
        {!isLoading && (
          <>
            <Typography variant="h6">{uploaderProfile.nickname}</Typography>
            <Typography variant="body2">No self introduction...</Typography>
          </>
        )}
      </div>
      <div
        style={{
          flexGrow: 0,
          flexBasis: "auto",
          flexShrink: 0,
          paddingRight: theme.spacing(2),
        }}
      >
        {!isLoading &&
          buildSocialBadge({
            reviewerSnsAccounts: uploaderProfile.snsAccounts,
            fontSize: theme.spacing(3),
            isVertical: true,
            isSpread: false,
          })}
      </div>
    </div>
  );
}
AboutUploaderTab.propTypes = {
  uploaderID: PropTypes.string.isRequired,
};
