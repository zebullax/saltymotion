// React
import React from "react";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ErrorOutlineIcon from "@mui/icons-material//ErrorOutline";

/**
 * Error page component
 * @return {JSX.Element}
 * @constructor
 */
function ErrorPageContainer() {
  return (
    <Grid container spacing={1} style={{ textAlign: "center" }}>
      <Grid
        item
        xs={12}
        style={{
          paddingTop: 32,
          paddingBottom: 32,
          justifyContent: "center",
          alignItems: "flex-end",
        }}
        spacing={2}
        container
      >
        <Grid item>
          <ErrorOutlineIcon style={{ fontSize: 40 }} />
        </Grid>
        <Grid item>
          <Typography variant="h2" component="h1">
            Oops
          </Typography>
        </Grid>
        <Grid item>
          <ErrorOutlineIcon style={{ fontSize: 40 }} />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4">(╯°□°）╯︵ ┻━┻</Typography>
        <Typography variant="subtitle1">
          {/* eslint-disable-next-line max-len */}
          Well... An error (or something like that) occureth onto thee my dear... We are very sorry though, just so you
          know...
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {/* eslint-disable-next-line max-len */}
          You may want to refresh the page
        </Typography>
      </Grid>
    </Grid>
  );
}

export default ErrorPageContainer;
