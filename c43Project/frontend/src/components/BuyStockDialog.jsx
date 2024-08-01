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

function BuyStock({ open, handleClose, symbol }) {
  const [shares, setShares] = React.useState(0);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [portfolio, setPortfolio] = React.useState([]);
  const [totalCost, setTotalCost] = React.useState(0);
  const [price, setPrice] = React.useState(0);
  const [cashBalance, setCashBalance] = React.useState(0);

  React.useEffect(() => {
    getPortfolio();
    getPrice();
  }, []);

  React.useEffect(() => {
    getTotalPrice();
  }, [shares]);

  React.useEffect(() => {
    if (selectedValue) {
      getCashBalance();
    }
  }, [selectedValue]);

  const getTotalPrice = () => {
    const cost = shares * price;
    setTotalCost(cost.toFixed(2));
  };

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

  const getPrice = async () => {
    try {
      const response = await api.get(`strike-price/${symbol}/`);
      console.log(response.data.strike_price);
      setPrice(response.data.strike_price);
    } catch (error) {
      console.error("Error getting strike price", error.response.data);
    }
  };

  const getCashBalance = async () => {
    try {
      const response = await api.get(`/cash-account/${selectedValue}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCashBalance(response.data.balance.toFixed(2));
    } catch (error) {
      console.error("Error fetching stock holdings:", error.response.data);
    }
  };

  const handleSubmit = async () => {
    if (selectedValue != "" && shares != 0) {
      console.log(selectedValue);
      try {
        const response = await api.post(
          `buy-stock/${selectedValue}/${symbol}/${shares}/`
        );
        console.log("Success:", response.data);
        setMessage(
          `Successfully bought ${shares} shares of ${symbol} with a total cost of: ${totalCost}!`
        );
        setSnackSeverity("success");
        setOpenSnackbar(true);
        handleClose();
      } catch (error) {
        if (error.response) {
          if (error.response.data.error == "Insufficient balance.") {
            setMessage(`Insufficient funds!`);
          }
        } else {
          console.error("Error:", error);
          setMessage(`Error when buying ${shares} shares of ${symbol}!`);
          handleClose();
        }
        setSnackSeverity("error");
        setOpenSnackbar(true);
      }
    } else {
      if (selectedValue == "") {
        setMessage("Please select a portfolio to add to");
      } else {
        setMessage("Please provide a number of shares to buy");
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
        <DialogTitle>Buy Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <DialogContentText>Select a Portfolio:</DialogContentText>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={selectedValue}
                onChange={handleChange}
                displayEmpty
              >
                {portfolio.map((portfolio) => (
                  <MenuItem key={portfolio.pid} value={portfolio.pid}>
                    {portfolio.pname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogContentText>
              Portfolio you selected has a cash balance of: ${cashBalance}
            </DialogContentText>
            <DialogContentText>
              Select the number of shares to buy:
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
                onClick={() => setShares(shares + 1)}
              >
                <AddIcon />
              </IconButton>
            </Stack>
            <DialogContentText>Total cost: ${totalCost}</DialogContentText>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            sx={{ backgroundColor: "green" }}
            variant="contained"
          >
            Buy
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
export default BuyStock;
