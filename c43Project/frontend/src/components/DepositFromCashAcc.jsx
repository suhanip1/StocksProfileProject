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
  InputLabel,
  InputAdornment,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import api from "../api";
import { CustomOutlinedInput } from "./DepositFromBankAccDialog";

function DepositCashAcc({ open, handleClose, onSave, pid }) {
  const [amount, setAmount] = React.useState(null);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [portfolio, setPortfolio] = React.useState([]);

  React.useEffect(() => {
    getPortfolio();
  }, []);

  const getPortfolio = async () => {
    try {
      const response = await api.get("/portfolio/", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolios", error.response.data);
    }
  };

  const handleSubmit = async () => {
    if (selectedValue != "" && amount != 0 && amount) {
      console.log(selectedValue);
      try {
        const response = await api.post(
          `cash-account/transfer/${pid}/${selectedValue}/${amount.toString()}`
        );
        console.log("Success:", response.data);
        setMessage(`Successfully deposited $${amount}!`);
        setSnackSeverity("success");
        setOpenSnackbar(true);
        if (onSave) onSave();
      } catch (error) {
        console.error("Error:", error);
        setMessage(`Error when depositing!`);
        setSnackSeverity("error");
        setOpenSnackbar(true);
      }

      handleClose();
    } else {
      if (selectedValue == "") {
        setMessage("Please select a portfolio to transfer from");
      } else {
        setMessage("Please enter an amount to transfer");
      }

      setSnackSeverity("error");
      setOpenSnackbar(true);
      return;
    }
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Deposit from Other Cash Account</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <DialogContentText>Select a Portfolio:</DialogContentText>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={selectedValue}
                onChange={handleChange}
                displayEmpty
              >
                {portfolio.map(
                  (portfolio) =>
                    portfolio.pid != pid && (
                      <MenuItem key={portfolio.pid} value={portfolio.pid}>
                        {portfolio.pname}
                      </MenuItem>
                    )
                )}
              </Select>
            </FormControl>
            <DialogContentText>Amount to deposit: </DialogContentText>
            <FormControl
              fullWidth
              sx={{ m: 1 }}
              value={amount}
              onChange={(e) => {
                setAmount(Number(e.target.value));
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
                renderText={(value) => <OutlinedInput value={value} />}
                inputProps={{
                  "aria-label": "Amount",
                }}
              />
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            sx={{ backgroundColor: "green" }}
            variant="contained"
          >
            Deposit
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
export default DepositCashAcc;
