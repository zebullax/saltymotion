// React/Redux
import React from "react";
import PropTypes from "prop-types";
// Mui
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// Saltymotion
import { EmptyReviewsSet } from "../placeholder/emptyResult";
import AtelierCard from "../widget/atelierCard";
import { atelierPropTypes, gamePropTypes } from "../../../typedef/propTypes";

export default function ReviewSection({ game, reviews }) {
  const theme = useTheme();
  const hasNoWorkshops = reviews.length === 0;

  const buildWorkshops = (items) =>
    items.map((item) => (
      <Grid item xs={12} sm={6} lg={3} xl={2} key={item.ID} style={{ marginBottom: theme.spacing(4) }}>
        <AtelierCard atelier={item} />
      </Grid>
    ));

  return (
    <Box mt={theme.spacing(1)}>
      <Grid container spacing={1} pb={theme.spacing(2)}>
        <Grid item>
          <Typography variant="h6" fontWeight="bold">
            Reviews
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {`(${reviews.length})`}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {hasNoWorkshops && <EmptyReviewsSet label={game.name} category="game" alternativeLink="/browse/game" />}
        {!hasNoWorkshops && buildWorkshops(reviews)}
      </Grid>
    </Box>
  );
}

ReviewSection.propTypes = {
  game: gamePropTypes.isRequired,
  reviews: PropTypes.arrayOf(atelierPropTypes),
};

ReviewSection.defaultProps = {
  reviews: [],
};
