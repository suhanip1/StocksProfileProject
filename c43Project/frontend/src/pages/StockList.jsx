import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Menu,
  MenuItem,
  Card,
  CardActionArea,
  IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";

function StockList() {
  const [stocklistItems, setStocklistItems] = React.useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slid = queryParams.get("slid");

  React.useEffect(() => {
    getStocklistItems();
  }, []);

  const getStocklistItems = async () => {
    try {
      const response = await api.get(`/stocklistitems/${slid}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      setStocklistItems(response.data);
    } catch (error) {
      console.error("Error fetching stock lists:", error.response.data);
    }
  };

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };

  const handleBack = () => {
    console.log("Go back to Home Page");
    navigate("/StockLists");
  };

  const handleStockNavigation = (symbol, strikePrice) => {
    navigate(`/Stock?symbol=${symbol}&strikePrice=${strikePrice}`);
  };

  return (
    <Stack
      spacing={2}
      sx={{
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Button variant="outlined" onClick={handleBack}>
          Back to Stock List
        </Button>
        <Button variant="outlined" onClick={handleHome}>
          Back to Home
        </Button>
      </Stack>

      {stocklistItems.map((item) => (
        <Card sx={{ minWidth: 500 }} key={item.slid_id}>
          <CardActionArea
            onClick={() => {
              handleStockNavigation(item.symbol_id, item.strike_price);
            }}
          >
            <Stack
              direction="row"
              sx={{
                color: "white",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <Stack spacing={0.5}>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                  }}
                >
                  {item.symbol_id}
                </Typography>
                <Typography sx={{ fontSize: "1rem", fontFamily: "monospace" }}>
                  Current price: {item.strike_price}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "1rem", fontFamily: "monospace" }}>
                {" "}
                Shares: {item.shares}
              </Typography>
            </Stack>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}

export default StockList;
