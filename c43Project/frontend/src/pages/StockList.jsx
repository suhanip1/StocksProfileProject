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
  Popover,
  TextField,
  Divider,
  CardContent,
} from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import RemoveStock from "../components/RemoveStockDialog";
import Statistics from "../components/getData";
import StockMatrix from "../components/StatisticMatrix";

function StockList() {
  const [stocklistItems, setStocklistItems] = React.useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slid = queryParams.get("slid");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [symbolRemove, setSymbolRemove] = React.useState("");
  const [sharesRemove, setSharesRemove] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [interval, setInterval] = React.useState("month");
  const [marketValue, setMarketValue] = React.useState(0);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  React.useEffect(() => {
    getStocklistItems();
    getMarketValue();
  }, [interval]);

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
    navigate(
      `/Stock?symbol=${symbol}&strikePrice=${strikePrice}&navigatePath=/StockList?slid=${slid}`
    );
  };

  const handleRemove = (symbol, shares) => {
    setSymbolRemove(symbol);
    setSharesRemove(shares);
    setOpenDialog(true);
  };

  const handleSave = () => {
    getStocklistItems();
    getMarketValue();
    setOpenDialog(false);
  };

  const getMarketValue = async () => {
    try {
      const response = await api.get(`stocklist/${slid}/market_value/`);
      setMarketValue(response.data.market_value.toFixed(2));
    } catch (error) {
      console.error("Error fetching market value:", error.response.data);
    }
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
      <Stack direction="row" spacing={2}>
        <Card>
          <CardContent>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontWeight: "bold",
                fontSize: "2rem",
                marginBottom: "1rem",
              }}
            >
              Stocklist Statistics{" "}
              <TextField
                select
                label="Interval"
                variant="outlined"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              >
                <MenuItem value="week">1 Week</MenuItem>
                <MenuItem value="month">1 Month</MenuItem>
                <MenuItem value="quarter">3 Months</MenuItem>
                <MenuItem value="year">1 Year</MenuItem>
                <MenuItem value="five_years">5 Years</MenuItem>
              </TextField>
            </Typography>
            <Divider variant="middle" />
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "1.5rem",
                marginTop: "1rem",
                marginBottom: "2rem",
              }}
            >
              Present Market Value: ${marketValue}
            </Typography>
            <StockMatrix id={slid} interval={interval} type={"stocklist"} />
          </CardContent>
        </Card>
        <Stack spacing={2}>
          {stocklistItems.map((item) => (
            <Card sx={{ minWidth: 700 }} key={item.symbol_id}>
              <Stack
                direction="row"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
                      <Typography
                        sx={{ fontSize: "1rem", fontFamily: "monospace" }}
                      >
                        Current price: {item.strike_price}
                      </Typography>
                      <Statistics symbol={item.symbol_id} interval={interval} />
                    </Stack>
                    <Typography
                      sx={{ fontSize: "1rem", fontFamily: "monospace" }}
                    >
                      {" "}
                      Shares: {item.shares}
                    </Typography>
                  </Stack>
                </CardActionArea>
                <IconButton
                  aria-label="Remove item"
                  size="large"
                  onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                  onClick={() => {
                    handleRemove(item.symbol_id, item.shares);
                  }}
                  sx={{ height: "50px" }}
                >
                  <RemoveCircleIcon color="primary" />
                </IconButton>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>Remove from Stock List</Typography>
      </Popover>
      <RemoveStock
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        onSave={handleSave}
        id={slid}
        symbol={symbolRemove}
        curr_shares={sharesRemove}
        sell={false}
      />
    </Stack>
  );
}

export default StockList;
