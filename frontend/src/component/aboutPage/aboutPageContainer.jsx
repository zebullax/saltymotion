// React-Redux
import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
// MUI
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PrivacyPolicy from "./privacyPolicy";
// Saltymotion
import TermsOfUse from "./termsOfUse";
import { APPLICATION_BAR_HEIGHT } from "../../lib/appTheme";
import AboutUs from "./aboutUs";

// TODO Could factorize...
const AboutPageTab = [{ url: "/about/use" }, { url: "/about/privacy" }, { url: "/about/us" }];

/**
 * Create the page for policy
 * @param {number} selectedTabIndex
 * @return {JSX.Element}
 * @constructor
 */
export default function AboutPageContainer({ selectedTabIndex }) {
  const history = useHistory();
  return (
    <Grid container spacing={1}>
      <Grid item xs={2}>
        <Tabs
          orientation="vertical"
          style={{ paddingTop: APPLICATION_BAR_HEIGHT }}
          value={selectedTabIndex}
          onChange={(evt, newValue) => {
            history.push(AboutPageTab[newValue].url);
          }}
        >
          <Tab value={0} label="Terms of use" />
          <Tab value={1} label="Privacy" />
          <Tab value={2} label="About us" />
        </Tabs>
      </Grid>
      <Grid item xs={10} hidden={selectedTabIndex !== 0}>
        <TermsOfUse />
      </Grid>
      <Grid item xs={10} hidden={selectedTabIndex !== 1}>
        <PrivacyPolicy />
      </Grid>
      <Grid item xs={10} hidden={selectedTabIndex !== 2}>
        <AboutUs />
      </Grid>
    </Grid>
  );
}

AboutPageContainer.propTypes = {
  selectedTabIndex: PropTypes.number,
};

AboutPageContainer.defaultProps = {
  selectedTabIndex: 0,
};
