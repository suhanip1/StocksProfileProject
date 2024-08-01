import React from "react";
import { Stack, Typography, Divider, Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Statistics from "../components/getData";

import StockGraph from "../components/stockGraph";

function Stock() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const symbol = queryParams.get("symbol");
  const strikePrice = queryParams.get("strikePrice");
  const navigatePath = queryParams.get("navigatePath");

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };

  const handleBack = () => {
    console.log(navigatePath);
    navigate(navigatePath);
  };

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleBack}>
            Back
          </Button>
          <Button variant="outlined" onClick={handleHome}>
            Back to Home
          </Button>
        </Stack>

        <Typography
          sx={{ fontFamily: "monospace", fontSize: "3rem", fontWeight: "bold" }}
        >
          {" "}
          {symbol}
        </Typography>
        <Typography sx={{ fontFamily: "monospace", fontSize: "1rem" }}>
          Present Market Value: {strikePrice}
        </Typography>
        <Divider variant="middle" />
        <StockGraph symbol={symbol}></StockGraph>
      </Stack>
    </Box>
  );
}

export default Stock;
