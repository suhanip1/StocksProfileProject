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

function AddToStockList({ open, handleClose, symbol }) {
  const [shares, setShares] = React.useState(0);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [stockLists, setStockLists] = React.useState([]);

  React.useEffect(() => {
    getStockLists();
  }, []);

  const getStockLists = async () => {
    try {
      const response = await api.get("/stocklists/", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setStockLists(response.data);
    } catch (error) {
      console.error("Error fetching stock lists:", error.response.data);
    }
  };

  const handleSubmit = async () => {
    if (selectedValue != "" && shares != 0) {
      console.log(selectedValue);
      const data = {
        slid: selectedValue,
        symbol: symbol,
        shares: shares,
      };
      try {
        const response = await api.post("/stocklistitems/add-or-update/", data);
        console.log("Success:", response.data);
        setMessage(`Successfully added ${shares} shares of ${symbol}!`);
        setSnackSeverity("success");
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error:", error);
        setMessage(`Error when adding ${shares} shares of ${symbol}!`);
        setSnackSeverity("error");
        setOpenSnackbar(true);
      }

      handleClose();
    } else {
      if (selectedValue == "") {
        setMessage("Please select a stock list to add to");
      } else {
        setMessage("Please provide a number of shares to add");
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
        <DialogTitle>Add to Stock List</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <DialogContentText>Select a Stock List:</DialogContentText>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={selectedValue}
                onChange={handleChange}
                displayEmpty
              >
                {stockLists.map((stockList) => (
                  <MenuItem key={stockList.slid} value={stockList.slid}>
                    {stockList.sl_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogContentText>Select the number of shares:</DialogContentText>
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
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            sx={{ backgroundColor: "green" }}
            variant="contained"
          >
            Add
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
export default AddToStockList;
