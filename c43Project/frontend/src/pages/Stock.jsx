import React from "react";
import { Stack, Typography, Divider, Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import StockGraph from "../components/stockGraph2";

function Stock() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const symbol = queryParams.get("symbol");
  const strikePrice = queryParams.get("strikePrice");

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };

  const handleStocks = () => {
    console.log("Stocks");
    navigate("/stocks");
  };

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Stack spacing={2}>
        <Button variant="outlined" onClick={handleHome}>
          Back to Home
        </Button>
        <Button variant="outlined" onClick={handleStocks}>
          Back to Search
        </Button>
        <Typography
          sx={{ fontFamily: "monospace", fontSize: "3rem", fontWeight: "bold" }}
        >
          {" "}
          {symbol}
        </Typography>
        <Typography sx={{ fontFamily: "monospace", fontSize: "1rem" }}>
          Strike Price: {strikePrice}
        </Typography>
        <Divider variant="middle" />
        <StockGraph symbol={symbol}></StockGraph>
      </Stack>
    </Box>
  );
}

export default Stock;
