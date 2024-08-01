import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import host from "../utils/links";

import api from "../api";
import StockCard from "../components/stockCard";

function RecordDailyStock() {
  const [timestamp, setTimestamp] = React.useState("");
  const [open, setOpen] = React.useState(0);
  const [high, setHigh] = React.useState(0);
  const [low, setLow] = React.useState(0);
  const [close, setClose] = React.useState(0);
  const [volume, setVolume] = React.useState(0);
  const [symbol, setSymbol] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [date, setDate] = React.useState("");

  const navigate = useNavigate();

  React.useEffect(() => {
    getDate();
  }, []);

  const getDate = async () => {
    try {
      const response = await fetch(`${host}/get-date/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.latest_date) {
        const fetchedDate = new Date(data.latest_date);
        fetchedDate.setDate(fetchedDate.getDate() + 1);
        setTimestamp(fetchedDate.toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error fetching the date:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (true) {
      try {
        const response = await fetch(`${host}/stock-performace/add/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timestamp: timestamp,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: volume,
            symbol: symbol,
          }),
        });

        if (response.ok) {
          setMessage(
            `Successfully added new daily stock information for ${symbol}!`
          );
          setSnackSeverity("success");
        } else {
          const errorData = await response.json();
          setMessage(
            `Error adding daily stock information for ${symbol}: ${
              errorData.message || "Unknown error"
            }`
          );
          setSnackSeverity("error");
        }
        setOpenSnackbar(true);
        setOpen(0);
        setHigh(0);
        setLow(0);
        setClose(0);
        setVolume(0);
        setSymbol("");
      } catch (error) {
        console.error("Error adding daily stock information:", error);
        setMessage(`Error adding daily stock information for ${symbol}!`);
        setSnackSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };

  return (
    <div>
      <Stack
        spacing={2}
        sx={{
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button variant="outlined" onClick={handleHome}>
          Back to Home
        </Button>
        <Container maxWidth="sm" sx={{ mt: 5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 3,
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Record New Daily Stock Information
            </Typography>
            <form
              noValidate
              autoComplete="off"
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <TextField
                name="Timestamp"
                label="Timestamp"
                type="date"
                required
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                label="Open"
                variant="outlined"
                required
                fullWidth
                onChange={(e) => setOpen(e.target.value)}
                value={open}
              />
              <TextField
                label="High"
                variant="outlined"
                required
                fullWidth
                onChange={(e) => setHigh(e.target.value)}
                value={high}
              />
              <TextField
                label="Low"
                variant="outlined"
                required
                fullWidth
                onChange={(e) => setLow(e.target.value)}
                value={low}
              />
              <TextField
                label="Close"
                variant="outlined"
                required
                fullWidth
                onChange={(e) => setClose(e.target.value)}
                value={close}
              />
              <TextField
                label="Volume"
                variant="outlined"
                required
                fullWidth
                onChange={(e) => setVolume(e.target.value)}
                value={volume}
              />
              <TextField
                label="Symbol"
                variant="outlined"
                required
                fullWidth
                onChange={(e) => setSymbol(e.target.value)}
                value={symbol}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </form>
          </Box>
        </Container>
      </Stack>
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

export default RecordDailyStock;
