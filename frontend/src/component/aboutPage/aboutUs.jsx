/* eslint-disable max-len */
/* eslint-disable react/no-unescaped-entities */

// React
import React from "react";
// MUI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

/**
 * Create the about us page
 * @return {JSX.Element}
 * @constructor
 */
export default function AboutUs() {
  return (
    <Grid container spacing={1} justify="space-around">
      <Grid item xs={12} md={8} style={{ paddingBottom: 16 }}>
        <Typography variant="h3" fontWeight="bold">
          Saltymotion
        </Typography>
        <Typography variant="body2">
          SaltyMotion is a platform that allows players to improve on their e-sports path. Using the browser they can
          upload matches to be reviewed on w/o additional software or expensive streaming setup...
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h6">What's a SaltyMotion ?</Typography>
        <Typography variant="body2">
          Once you register, you can start uploading your videos (we call that 'atelier') ! When you're done uploading
          that sweet replay, select some potential reviewers you would like to analyze your matches, and wait until one
          accept your bounty !
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h6">The what bounty now ?</Typography>
        <Typography variant="body2">
          Well yes... Reviewers will spend time analyzing your replays, share their knowledge on some niche situations:
          We want to reward that. We also want to push for a self sustaining e-sports environment. So you will need to
          put a bounty on those uploads and reviewers will get paid.
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h6">Ok... how much?</Typography>
        <Typography variant="body2">
          Up to you and the reviewers :D Reviewers will specify a minimum bounty they would accept to review a replay.
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h6">Is it safe ?</Typography>
        <Typography variant="body2">
          We use Stripe to handle charging coins on your SaltyMotion account, we won't handle any of your payment
          details, we will never know what your visa looks like so you don't need to worry about that. We also use
          Stripe for reviewers payment.
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h6">So... I need a stripe account ?</Typography>
        <Typography variant="body2">
          You only need a Stripe account if you want to get paid, if you want to increase your coin to pay bounty you
          don't need any Stripe account.
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Typography variant="h6">Does it work on Mobile ?</Typography>
        <Typography variant="body2">
          Yes and no... On IOS some of the functions we need to let you review videos aren't supported, so that's a NO.
          On some Android though, we heard some positive things... You can check out videos and browse, but so far,
          reviewing and create ateliers, is not supported on mobile.
        </Typography>
      </Grid>
    </Grid>
  );
}
