// React
import React from "react";
import { useHistory } from "react-router-dom";
// MUI
import { alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
// Misc
import moment from "moment";
// Saltymotion
import Tag from "../widget/tag";
import { atelierPropTypes } from "../../../typedef/propTypes";
import { makeS3Link, s3LinkCategory } from "../../lib/utility";

/**
 * UI component for top page hero section
 * @param {NormalizedAtelierDescription} atelier
 * @return {JSX.Element}
 */
const TopHeroSection = ({ atelier }) => {
  const theme = useTheme();
  const history = useHistory();
  return (
    <Grid
      container
      spacing={1}
      alignItems="center"
      style={{
        position: "relative",
        padding: theme.spacing(4),
        backgroundImage:
          `linear-gradient(to right, ${alpha(theme.palette.background.default, 1)} 20%,` +
          `${alpha(theme.palette.background.default, 0.5)} 50%, ${alpha(theme.palette.background.default, 1)} 80%), ` +
          `linear-gradient(to top, ${alpha(theme.palette.background.default, 1)} 20%, ` +
          `${alpha(theme.palette.background.default, 0)} 80%), ` +
          `url(${makeS3Link(s3LinkCategory.gameBackdrop, atelier.game.ID)})`,
        backgroundSize: "cover",
        marginLeft: -24, // We want to stretch the cover picture outside of usual main container padding...
        marginTop: -16,
        width: "calc(100% + 48px)",
        backgroundPositionX: "center",
      }}
    >
      <Grid
        item
        xs={6}
        onClick={() => history.push(`/workshop/${atelier.ID}`)}
        style={{
          animationName: "slideInLeft",
          animationDuration: "1s",
          animationTimingFunction: "ease",
        }}
      >
        <Typography variant="h4" fontWeight={900} fontFamily="Montserrat" style={{ textTransform: "uppercase" }}>
          {atelier.title}
        </Typography>
        <ul className="tag_list">
          {atelier.tags.length !== 0 && <Tag id={atelier.tags[0].ID} name={atelier.tags[0].name} />}
        </ul>
        <Box marginTop={theme.spacing(2)}>
          <Typography variant="subtitle2" noWrap>
            {atelier.stats.nbViews} views ·{moment(atelier.creationTimestamp).fromNow()}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <video
          src={`https://saltymotion-atelier-review.s3-ap-northeast-1.amazonaws.com/${atelier.s3Key}`}
          playsInline
          autoPlay
          muted
          loop
          style={{
            width: "100%",
            height: "auto",
            boxShadow: "0 0 3vh black",
          }}
        />
      </Grid>
    </Grid>
  );
};

TopHeroSection.propTypes = {
  atelier: atelierPropTypes.isRequired,
};

export default TopHeroSection;
