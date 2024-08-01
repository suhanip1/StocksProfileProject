import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import api from "../api";
import StockCard from "../components/stockCard";

function SearchStock() {
  const [search, setSearch] = React.useState("");
  const [symbol, setSymbol] = React.useState("");
  const [stocks, setStocks] = React.useState([]);
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

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
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
              <div key={stock.symbol}>
                <StockCard stock={stock} navigatePath={"/stocks"} />
              </div>
            ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default SearchStock;
