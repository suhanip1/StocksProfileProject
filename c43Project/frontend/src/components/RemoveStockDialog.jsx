import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  OutlinedInput,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  TextField,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";

import AddIcon from "@mui/icons-material/Add";

import api from "../api";
import host from "../utils/links";

function RemoveStock({
  open,
  handleClose,
  onSave,
  id,
  symbol,
  curr_shares,
  sell,
}) {
  const [shares, setShares] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [price, setPrice] = React.useState(0);
  const [totalEarnings, setTotalEarnings] = React.useState(0);

  //React.useEffect(() => {
   // if (sell) {
  //    getPrice();
   // }
  //}//, [symbol]);

  React.useEffect(() => {
    if (sell) {
      getPrice();
    }
    getTotalEarnings();

  }, [shares, symbol, price]);

  const getTotalEarnings =  () => {
    const earnings = shares * price;
    setTotalEarnings(earnings.toFixed(2));
  };

  const getPrice = async () => {
    try {
      const response = await api.get(`strike-price/${symbol}/`);
      setPrice(response.data.strike_price);
    } catch (error) {
      console.error("Error getting strike price", error.response.data);
    }
  };

  const handleSubmit = async () => {
    if (!sell) {
      if (shares != 0) {
        try {
          const response = await api.post(
            `remove-stock-list-item/${id}/${symbol}/${shares}/`
          );
          setMessage(`Successfully removed ${shares} shares of ${symbol}!`);
          setSnackSeverity("success");
          setOpenSnackbar(true);
          if (onSave) onSave();
        } catch (error) {
          console.error("Error:", error);
          setMessage(`Error when removing ${shares} shares of ${symbol}!`);
          setSnackSeverity("error");
          setOpenSnackbar(true);
        }

        handleClose();
      } else {
        setMessage("Please provide a number of shares to remove");

        setSnackSeverity("error");
        setOpenSnackbar(true);
        return;
      }
    } else {
      if (shares != 0) {
        try {
          const response = await api.post(
            `sell-stock/${id}/${symbol}/${shares}/`
          );
          setMessage(`Successfully sold ${shares} shares of ${symbol}!`);
          setSnackSeverity("success");
          setOpenSnackbar(true);
          if (onSave) onSave();
        } catch (error) {
          console.error("Error:", error);
          setMessage(`Error when removing ${shares} shares of ${symbol}!`);
          setSnackSeverity("error");
          setOpenSnackbar(true);
        }

        handleClose();
      } else {
        setMessage("Please provide a number of shares to remove");

        setSnackSeverity("error");
        setOpenSnackbar(true);
        return;
      }
    }
  };

  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {sell ? "sell" : "remove"} {symbol}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <DialogContentText>
              Select the number of shares to {sell ? "sell" : "remove"}:
            </DialogContentText>
            <Stack
              direction={"row"}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              spacing={1}
            >
              <IconButton
                size="small"
                sx={{ maxHeight: "35px" }}
                onClick={() => {
                  shares > 0 && setShares(shares - 1);
                }}
                disabled={shares == 0}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                id="outlined-basic"
                variant="outlined"
                value={shares}
                onChange={(e) => {
                  setShares(Number(e.target.value));
                }}
                sx={{ maxWidth: "50px" }}
              />
              <IconButton
                size="small"
                sx={{ maxHeight: "35px" }}
                onClick={() => shares < curr_shares && setShares(shares + 1)}
                disabled={shares == curr_shares}
              >
                <AddIcon />
              </IconButton>
            </Stack>
            {sell && (
              <DialogContentText>
                Total earnings: ${totalEarnings}
              </DialogContentText>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            sx={{ backgroundColor: "green" }}
            variant="contained"
          >
            {sell ? "sell" : "remove"} {symbol}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackSeverity} onClose={handleCloseSnackbar}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}
export default RemoveStock;
