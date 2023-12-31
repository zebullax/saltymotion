// React
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import PropTypes from "prop-types";
// MUI
import Paper from "@mui/material/Paper";
import ArrowUpwardIcon from "@mui/icons-material//ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material//ArrowDownward";
import Grid from "@mui/material/Grid";
import { green, red } from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";

/**
 * Render an element for the wallet charge
 * {number} amount
 * {string} date
 * {string} url
 * @return {JSX.Element}
 */
function WalletCharge({ amount, date, url }) {
  const theme = useTheme();
  return (
    <Paper style={{ padding: theme.spacing(1), marginBottom: theme.spacing(1) }}>
      <Grid container alignItems="center">
        <ArrowUpwardIcon style={{ color: green[500] }} fontSize="large" />
        <Typography variant="h6" display="inline">{`\u00a5 ${amount}`}</Typography>
      </Grid>
      <Typography color="textSecondary" variant="subtitle1">
        Created on {new Date(date).toLocaleString()}
      </Typography>
      <Link target="_blank" href={url}>
        See details
      </Link>
    </Paper>
  );
}

WalletCharge.propTypes = {
  amount: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

/**
 * Render an element for the wallet payment
 * {number} amount
 * {string} date
 * {object} atelier
 * {number} atelier.ID
 * @return {JSX.Element}
 */
function WalletPayment({ amount, atelier, date }) {
  const theme = useTheme();
  return (
    <Paper style={{ padding: theme.spacing(1), marginBottom: theme.spacing(1) }}>
      <Grid container alignItems="center">
        <ArrowDownwardIcon style={{ color: red[500] }} fontSize="large" />
        <Typography variant="h6" display="inline">{`\u00a5 ${amount}`}</Typography>
      </Grid>
      <Grid container>
        <Typography color="textSecondary" variant="subtitle1">
          Created on {new Date(date).toLocaleString()}
        </Typography>
        <Link component={RouterLink} to={`/workshop/${atelier.ID}`}>
          Atelier #{atelier.ID}
        </Link>
      </Grid>
    </Paper>
  );
}

WalletPayment.propTypes = {
  amount: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  atelier: PropTypes.shape({
    ID: PropTypes.number.isRequired,
  }).isRequired,
};

export { WalletCharge, WalletPayment };
