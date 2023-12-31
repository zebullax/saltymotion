// React
import React from "react";
import PropTypes from "prop-types";
// MUI
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
// Saltymotion
import { makeS3Link, s3LinkCategory } from "../../lib/utility";
import { buildSocialBadge } from "../widget/utility";
import ReviewerHook from "../../lib/hooks/reviewer";

/**
 * Render the 'about reviewer' tab in view Atelier
 * @param {string} reviewerID
 * @return {JSX.Element}
 * @constructor
 */
export default function AboutReviewerTab({ reviewerID }) {
  const theme = useTheme();
  const [reviewerProfile, isLoading] = ReviewerHook.useProfileLoader({ ID: reviewerID });
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
        {isLoading ? <Avatar /> : <Avatar src={makeS3Link(s3LinkCategory.profilePicture, reviewerProfile.ID)} />}
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
            <Typography variant="h6">{reviewerProfile.name}</Typography>
            <Typography variant="body2">{reviewerProfile.selfIntroduction ?? "No self introduction..."}</Typography>
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
            reviewerSnsAccounts: reviewerProfile.snsAccounts,
            fontSize: theme.spacing(3),
            isVertical: true,
            isSpread: false,
          })}
      </div>
    </div>
  );
}

AboutReviewerTab.propTypes = {
  reviewerID: PropTypes.string.isRequired,
};
