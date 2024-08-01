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
  CardContent,
  Snackbar,
  Alert,
  TextField,
  Divider,
  Container,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import DepositCashAcc from "../components/DepositFromCashAcc";
import DepositBankAcc from "../components/DepositFromBankAccDialog";
import RemoveStock from "../components/RemoveStockDialog";
import Statistics from "../components/getData";
import Withdraw from "../components/WithdrawDialog";
import StockMatrix from "../components/StatisticMatrix";

function PortfolioPage() {
  const [stockHoldings, setStockHoldings] = React.useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pid = queryParams.get("pid");
  const [accId, setAccId] = React.useState(null);
  const [cashBalance, setCashBalance] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [dialog, setDialog] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [symbolRemove, setSymbolRemove] = React.useState("");
  const [sharesRemove, setSharesRemove] = React.useState(0);
  const [marketValue, setMarketValue] = React.useState(0);
  const [interval, setInterval] = React.useState("month");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    getStockHoldings();
    getCashBalance();
    getMarketValue();
  }, [openDialog, interval]);

  const getStockHoldings = async () => {
    try {
      const response = await api.get(`/portfolio/stock-holdings/${pid}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setStockHoldings(response.data);
    } catch (error) {
      console.error("Error fetching stock holdings:", error.response.data);
    }
  };

  const getCashBalance = async () => {
    try {
      const response = await api.get(`/cash-account/${pid}/`);
      setAccId(response.data.acc_id);
      setCashBalance(response.data.balance.toFixed(2));
    } catch (error) {
      console.error("Error fetching cash balance:", error.response.data);
    }
  };

  const getMarketValue = async () => {
    try {
      const response = await api.get(`portfolio/${pid}/market_value/`);
      setMarketValue(response.data.market_value.toFixed(2));
    } catch (error) {
      console.error("Error fetching market value:", error.response.data);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  const openPortfolioDialog = (cashAcc) => {
    handleClose();
    setOpenDialog(true);
    if (cashAcc) {
      setDialog("cash");
    } else {
      setDialog("bank");
    }
  };

  const handleSave = () => {
    getStockHoldings();
    setOpenDialog(false);
  };

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };

  const handleBack = () => {
    console.log("Go back to Portfolio Page");
    navigate("/portfolio");
  };

  const handleStockNavigation = (symbol, strikePrice) => {
    navigate(
      `/Stock?symbol=${symbol}&strikePrice=${strikePrice}&navigatePath=${`/portfolio-page?pid=${pid}`}`
    );
  };
  const handleWithdraw = () => {
    setOpenDialog(true);
    setDialog("withdraw");
  };

  const handleRemove = (symbol, shares) => {
    console.log(symbol);
    setSymbolRemove(symbol);
    setSharesRemove(shares);
    setOpenDialog(true);
    setDialog("sell");
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
          Back to Portfolio
        </Button>
        <Button variant="outlined" onClick={handleHome}>
          Back to Home
        </Button>
      </Stack>

      <Stack direction="row" spacing={2}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                }}
              >
                Cash Account
              </Typography>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "1.3rem",
                }}
              >
                Balance: ${cashBalance}
              </Typography>
              <Stack spacing={2} sx={{ marginTop: "1rem" }}>
                <Button
                  id="demo-customized-button"
                  aria-controls={open ? "demo-customized-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  variant="contained"
                  disableElevation
                  onClick={handleClick}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  Deposit from
                </Button>
                <Button
                  disableElevation
                  variant="contained"
                  onClick={handleWithdraw}
                >
                  Withdraw
                </Button>
              </Stack>
            </CardContent>
          </Card>
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
                Portfolio Statistics{" "}
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
              <StockMatrix id={pid} interval={interval} type={"portfolio"} />
            </CardContent>
          </Card>
        </Stack>
        <Stack spacing={2}>
          {stockHoldings.map((item) => (
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
                      Shares: {item.shares_owned}
                    </Typography>
                  </Stack>
                </CardActionArea>
                <Button
                  aria-label="sell"
                  size="large"
                  onClick={() => {
                    handleRemove(item.symbol_id, item.shares_owned);
                  }}
                  sx={{ marginRight: "1rem" }}
                >
                  Sell
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
      {dialog == "withdraw" ? (
        <Withdraw
          open={openDialog}
          handleClose={handleCloseDialog}
          onSave={handleSave}
          pid={pid}
        />
      ) : dialog == "cash" ? (
        <DepositCashAcc
          open={openDialog}
          handleClose={handleCloseDialog}
          onSave={handleSave}
          pid={pid}
        />
      ) : dialog == "bank" ? (
        <DepositBankAcc
          open={openDialog}
          handleClose={handleCloseDialog}
          onSave={handleSave}
          pid={pid}
        />
      ) : (
        dialog == "sell" && (
          <RemoveStock
            open={openDialog}
            handleClose={() => setOpenDialog(false)}
            onSave={handleSave}
            id={pid}
            symbol={symbolRemove}
            curr_shares={sharesRemove}
            sell={true}
          />
        )
      )}
      <Menu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            openPortfolioDialog(true);
          }}
          disableRipple
        >
          Another Cash Account
        </MenuItem>
        <MenuItem
          onClick={() => {
            openPortfolioDialog(false);
          }}
          disableRipple
        >
          Bank Account
        </MenuItem>
      </Menu>

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
    </Stack>
  );
}

export default PortfolioPage;
