// React
import React from "react";
// MUI
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Grid from "@mui/material/Grid";

/**
 * Render the SNS badges
 * @param {snsAccounts} reviewerSnsAccounts
 * @param {number} fontSize
 * @param {boolean} [isVertical=false]
 * @param {boolean} [isDense=false]
 * @param {boolean} [isSpread=false]
 * @return {JSX.Element|null}
 */
export function buildSocialBadge({
  reviewerSnsAccounts,
  fontSize,
  isVertical = false,
  isDense = true,
  isSpread = true,
}) {
  const sns = [
    { fieldName: "youtubeName", icons: "fab fa-youtube" },
    { fieldName: "twitchName", icons: "fab fa-twitch" },
    { fieldName: "twitterName", icons: "fab fa-twitter" },
  ];
  const snsElements = sns.reduce((accu, curr) => {
    if (reviewerSnsAccounts[curr.fieldName].length !== 0) {
      accu.push(
        <IconButton>
          <Icon className={curr.icons} style={{ fontSize }} />
        </IconButton>,
      );
    }
    return accu;
  }, []);

  if (snsElements.length !== 0) {
    return (
      <Grid
        container
        spacing={isDense ? 0 : 1}
        justifyContent={isSpread ? "space-between" : "flex-start"}
        direction={isVertical ? "column" : "row"}
      >
        {snsElements.map((elem, idx) => (
          <Grid item key={idx}>
            {elem}
          </Grid>
        ))}
      </Grid>
    );
  }
  return null;
}
