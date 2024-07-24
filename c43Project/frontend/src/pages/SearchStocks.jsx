import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardActionArea,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";

import api from "../api";
import AddToStockList from "../components/AddToStockListDialog";
import StockGraph from "../components/stockGraph copy";

function SearchStock() {
  const [search, setSearch] = React.useState("");
  const [symbol, setSymbol] = React.useState("");
  const [stocks, setStocks] = React.useState([]);
  const [dialogSymbol, setDialogSymbol] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (search) {
      console.log(`search for: ${search}`);
      try {
        setSymbol(search);
        const response = await api.get(`/stocks/?symbol=${search}`);
        console.log(response.data);
        setStocks(response.data);
      } catch (error) {
        console.error("Error fetching stocks", error);
      }
      setSearch("");
    }
  };
  const handleOpenDialog = (symbol) => {
    setDialogSymbol(symbol);
    setOpenDialog(true);
  };

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };

  const handleStockNavigation = (symbol, strikePrice) => {
    navigate(`/Stock?symbol=${symbol}&strikePrice=${strikePrice}`);
  };
  return (
    <Box
      sx={{
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={2}>
        <Button onClick={handleHome} variant="outlined">
          Back to Home
        </Button>
        <Stack spacing={2}>
          <form role="search" id="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              id="outlined-search"
              label="Search for a stock"
              type="search"
              onChange={handleChange}
              value={search}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button variant="contained" type="submit">
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </form>
          {symbol && (
            <Typography
              sx={{
                fontFamily: "monospace",
                fontWeight: "bold",
                fontSize: "2rem",
              }}
            >
              Search Results for: {symbol}
            </Typography>
          )}
          {stocks.length != 0 &&
            stocks.map((stock) => (
              <Card
                key={stock.symbol}
                sx={{
                  minHeight: "50px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IconButton
                  aria-label="Create Stock List"
                  size="large"
                  onClick={() => handleOpenDialog(stock.symbol)}
                >
                  <AddCircleIcon color="primary" />
                </IconButton>
                <AddToStockList
                  open={openDialog}
                  handleClose={() => setOpenDialog(false)}
                  symbol={dialogSymbol}
                />

                <CardActionArea
                  onClick={() =>
                    handleStockNavigation(stock.symbol, stock.strike_price)
                  }
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          fontSize: "1.5rem",
                        }}
                      >
                        {stock.symbol}
                      </Typography>
                      <Typography>{stock.strike_price}</Typography>
                    </Box>
                    <StockGraph symbol={stock.symbol} />
                  </Stack>
                </CardActionArea>
              </Card>
            ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default SearchStock;
