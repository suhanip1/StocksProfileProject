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
  InputAdornment,
} from "@mui/material";
import { NumericFormat } from "react-number-format";

import api from "../api";
export const CustomOutlinedInput = React.forwardRef((props, ref) => (
  <OutlinedInput
    {...props}
    ref={ref}
    startAdornment={<InputAdornment position="start">$</InputAdornment>}
  />
));

function Withdraw({ open, handleClose, onSave, pid }) {
  const [amount, setAmount] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");

  const handleSubmit = async () => {
    if (amount != "" && amount != "$0.00") {
      console.log(amount);
      try {
        const response = await api.post(
          `cash-account/withdraw/${pid}/${amount}`
        );
        console.log("Success:", response.data);
        setMessage(`Successfully withdrew ${amount}!`);
        setSnackSeverity("success");
        setOpenSnackbar(true);
        if (onSave) onSave();
      } catch (error) {
        console.error("Error:", error);
        setMessage(`Error when withdrawing ${amount}`);
        setSnackSeverity("error");
        setOpenSnackbar(true);
      }

      handleClose();
    } else {
      setMessage("Please provide an amount to withdraw");
      setSnackSeverity("error");
      setOpenSnackbar(true);
      return;
    }
  };

  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Withdraw to External Bank Account</DialogTitle>
        <DialogContent>
          <DialogContentText>Amount to Withdraw: </DialogContentText>
          <FormControl
            fullWidth
            sx={{ m: 1 }}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          >
            <NumericFormat
              customInput={CustomOutlinedInput}
              id="outlined-adornment-amount"
              value={amount}
              onValueChange={(values) => {
                setAmount(values.value);
              }}
              thousandSeparator={true}
              decimalSeparator="."
              decimalScale={2}
              fixedDecimalScale={true}
              inputProps={{
                "aria-label": "Amount",
              }}
            />
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            sx={{ backgroundColor: "green" }}
            variant="contained"
          >
            Withdraw
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
export default Withdraw;
