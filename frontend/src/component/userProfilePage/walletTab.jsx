// React
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// MUI
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import TuneIcon from "@mui/icons-material//Tune";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { AddShoppingCart } from "@mui/icons-material";
import { DialogContentText } from "@mui/material";
// Misc
import { sub } from "date-fns";
// Saltymotion
import { WalletCharge, WalletPayment } from "../widget/walletActivity";
import { WalletActivityType } from "../../lib/walletReference";
import { getWalletHistory } from "../../lib/api/saltymotionApi";
import { userProfilePropTypes } from "../../../typedef/propTypes";
import { setErrorMessage, setStatusMessage } from "../../state/app/action";
import { purchaseChip } from "../../state/userProfile/action";

/**
 * Render the list of activity from a user wallet
 * @param {WalletHistory} walletHistory
 * @return {JSX.Element}
 * @constructor
 */
const buildWalletActivity = (walletHistory) => {
  if (walletHistory === undefined) {
    return null;
  }
  const isCharge = (item) => item.type === WalletActivityType.charge;
  const items = [...walletHistory.outgoingBounties, ...walletHistory.charges].sort(
    (lhs, rhs) => rhs.date.valueOf() - lhs.date.valueOf(),
  );
  return (
    <>
      {items.map((item, idx) =>
        isCharge(item) ? (
          <Grid item key={idx} xs={12} sm={6} md={4}>
            <WalletCharge key={idx} {...item} />
          </Grid>
        ) : (
          <Grid item key={idx} xs={12} sm={6} md={4}>
            <WalletPayment key={idx} {...item} />
          </Grid>
        ),
      )}
    </>
  );
};

/**
 * Render the dialog for wallet filtering
 * @param {boolean} isOpen
 * @param {boolean} isChargeFetched
 * @param {boolean} isOutgoingBountyFetched
 * @param {Date} filterTimeFrom
 * @param {Date} filterTimeTo
 * @param {function} onClose
 * @param {function} onApplyFilter
 * @return {JSX.Element}
 * @constructor
 */
function WalletFilterDialog({
  isOpen,
  isChargeFetched,
  isOutgoingBountyFetched,
  filterTimeFrom,
  filterTimeTo,
  onClose,
  onApplyFilter,
}) {
  const [filterFrom, setFilterFrom] = React.useState(filterTimeFrom);
  const [filterTo, setFilterTo] = React.useState(filterTimeTo);
  const [isChargeIncluded, setIsChargeIncluded] = React.useState(isChargeFetched);
  const [isBountyIncluded, setIsBountyIncluded] = React.useState(isOutgoingBountyFetched);
  return (
    <Dialog onClose={onClose} open={isOpen}>
      <DialogTitle>Set history filters</DialogTitle>
      <DialogContent dividers>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From"
                value={filterFrom}
                onChange={setFilterFrom}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To"
                value={filterTo}
                onChange={setFilterTo}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <List>
              <ListItem divider disabled disableGutters>
                <ListItemText primary="Activity type" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Charges" />
                <ListItemSecondaryAction>
                  <Checkbox checked={isChargeIncluded} onChange={(evt) => setIsChargeIncluded(evt.target.checked)} />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Outgoing bounties" />
                <ListItemSecondaryAction>
                  <Checkbox checked={isBountyIncluded} onChange={(evt) => setIsBountyIncluded(evt.target.checked)} />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() =>
            onApplyFilter({
              filterTimeFrom: filterFrom,
              filterTimeTo: filterTo,
              isBountyIncluded,
              isChargeIncluded,
            })
          }
        >
          Apply
        </Button>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
WalletFilterDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isChargeFetched: PropTypes.bool.isRequired,
  isOutgoingBountyFetched: PropTypes.bool.isRequired,
  filterTimeFrom: PropTypes.instanceOf(Date).isRequired,
  filterTimeTo: PropTypes.instanceOf(Date).isRequired,
  onClose: PropTypes.func.isRequired,
  onApplyFilter: PropTypes.func.isRequired,
};

/**
 * Render dialog to confirm before redirecting to Stripe for chip purchase
 * @param {boolean} isOpen
 * @param {function} onAccept
 * @param {function} onDecline
 * @return {JSX.Element}
 */
function ConfirmPurchaseChipDialog({ isOpen, onAccept, onCancel }) {
  return (
    <Dialog
      open={isOpen}
      aria-labelledby="wallet_tab__confirm_purchase_title"
      aria-describedby="wallet_tab__confirm_purchase_description"
      onClose={onCancel}
    >
      <DialogTitle id="wallet_tab__confirm_purchase_title">Go to checkout</DialogTitle>
      <DialogContent>
        <DialogContentText id="wallet_tab__confirm_purchase_description">
          You will be redirected to Stripe platform to purchase chips
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={onAccept} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
ConfirmPurchaseChipDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

/**
 * Render the user wallet tab
 * @param {function} dispatch
 * @param {UserProfile} userProfile
 * @param {boolean} isHidden
 */
function WalletTab({ userProfile, dispatch, isHidden }) {
  const [walletHistoryFilter, setWalletHistoryFilter] = React.useState({
    isChargeIncluded: true,
    isBountyIncluded: true,
    from: new Date(sub(Date.now(), { months: 1 })),
    to: new Date(),
  });

  const [isLoadingWalletHistory, setIsLoadingWalletHistory] = React.useState(false);
  const [walletHistory, setWalletHistory] = React.useState(undefined);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [isAddChipsConfirmationDialogOpen, setIsAddChipsConfirmationDialogOpen] = React.useState(false);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const { wallet } = userProfile;

  const onSaveFilterFromFilterDialog = ({ filterTimeFrom, filterTimeTo, isBountyIncluded, isChargeIncluded }) => {
    setIsFilterDialogOpen(false);
    setWalletHistoryFilter({
      isChargeIncluded,
      isBountyIncluded,
      from: filterTimeFrom,
      to: filterTimeTo,
    });
  };

  React.useEffect(() => {
    if (isHidden) {
      return null;
    }
    if (!walletHistoryFilter.isChargeIncluded && !walletHistoryFilter.isBountyIncluded) {
      dispatch(setStatusMessage("No activity types were selected, nothing to query..."));
      return null;
    }
    setIsLoadingWalletHistory(true);
    const [historyPromise, historyXHR] = getWalletHistory({
      userID: userProfile.ID,
      chargesFilter: walletHistoryFilter.isChargeIncluded
        ? { from: walletHistoryFilter.from.toISOString(), to: walletHistoryFilter.to.toISOString() }
        : undefined,
      outgoingBountiesFilter: walletHistoryFilter.isBountyIncluded
        ? { from: walletHistoryFilter.from.toISOString(), to: walletHistoryFilter.to.toISOString() }
        : undefined,
    });
    let isActive = true;
    historyPromise
      .then((res) => isActive && setWalletHistory(res))
      .catch(() => isActive && dispatch(setErrorMessage("Unknown error while loading the wallet history")))
      .finally(() => setIsLoadingWalletHistory(false));
    return () => {
      isActive = false;
      historyXHR.abort();
    };
  }, [isHidden, dispatch, userProfile.ID, walletHistoryFilter]);

  return (
    <Grid container spacing={1} hidden={isHidden} alignItems="flex-start">
      <Typography variant="h5" style={{ marginTop: theme.spacing(2) }}>
        {isXs ? "Chip Summary" : "Summary"}
      </Typography>
      <Divider style={{ width: "100%" }} />
      <Grid item xs={4}>
        <Paper style={{ padding: theme.spacing(isXs ? 1 : 2) }}>
          <Typography variant="caption" color="textSecondary">{`Free ${isXs ? "" : "Chip"}`}</Typography>
          <Divider style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }} />
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            {"\u00a5"} {wallet.freeCoin}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper style={{ padding: theme.spacing(isXs ? 1 : 2) }}>
          <Typography variant="caption" color="textSecondary">{`Frozen ${isXs ? "" : "Chip"}`}</Typography>
          <Divider style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }} />
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            {"\u00a5"} {wallet.frozenCoin}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper style={{ padding: theme.spacing(isXs ? 1 : 2) }}>
          <Typography variant="caption" color="textSecondary">{`Redeemable ${isXs ? "" : "Chip"}`}</Typography>
          <Divider style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }} />
          <Typography variant="h5" style={{ fontWeight: "bold" }}>
            {"\u00a5"} {wallet.redeemableCoin}
          </Typography>
        </Paper>
      </Grid>
      <Grid container justifyContent="flex-end" pt={theme.spacing(2)}>
        <Button startIcon={<AddShoppingCart />} onClick={() => setIsAddChipsConfirmationDialogOpen(true)}>
          Add chips
        </Button>
      </Grid>
      <Grid item xs={12} style={{ marginTop: theme.spacing(2) }}>
        <Typography display="inline" variant="h5" style={{ marginTop: theme.spacing(2) }}>
          History
        </Typography>
        <IconButton
          aria-label="filter"
          disabled={isLoadingWalletHistory}
          color="primary"
          onClick={() => setIsFilterDialogOpen(true)}
        >
          <TuneIcon />
        </IconButton>
      </Grid>
      <Divider style={{ width: "100%" }} />
      <WalletFilterDialog
        isOpen={isFilterDialogOpen}
        isChargeFetched={walletHistoryFilter.isChargeIncluded}
        isOutgoingBountyFetched={walletHistoryFilter.isBountyIncluded}
        filterTimeFrom={walletHistoryFilter.from}
        filterTimeTo={walletHistoryFilter.to}
        onApplyFilter={onSaveFilterFromFilterDialog}
        onClose={() => setIsFilterDialogOpen(false)}
      />
      <ConfirmPurchaseChipDialog
        isOpen={isAddChipsConfirmationDialogOpen}
        onCancel={() => setIsAddChipsConfirmationDialogOpen(false)}
        onAccept={() => dispatch(purchaseChip({ userID: userProfile.ID }))}
      />
      <Grid item xs={12}>
        {isLoadingWalletHistory && <CircularProgress style={{ verticalAlign: "bottom" }} />}
      </Grid>
      <Grid item xs={12} container spacing={1}>
        {!isLoadingWalletHistory && buildWalletActivity(walletHistory)}
      </Grid>
    </Grid>
  );
}

WalletTab.propTypes = {
  isHidden: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  userProfile: userProfilePropTypes.isRequired,
};

WalletTab.defaultProps = {
  isHidden: false,
};

const mapStateToProps = (state) => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(WalletTab);
