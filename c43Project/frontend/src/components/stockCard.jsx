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
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";

import api from "../api";
import AddToStockList from "../components/AddToStockListDialog";
import BuyStock from "../components/BuyStockDialog";
import StockGraph from "../components/stockGraphSearch";

function StockCard({ stock, navigatePath }) {
  const navigate = useNavigate();
  const [dialogSymbol, setDialogSymbol] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [add, setAdd] = React.useState(true);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (symbol, stockList) => {
    handleClose();
    setDialogSymbol(symbol);
    setOpenDialog(true);
    if (stockList) {
      setAdd(true);
    } else {
      setAdd(false);
    }
  };

  const handleStockNavigation = (symbol, strikePrice) => {
    navigate(
      `/Stock?symbol=${symbol}&strikePrice=${strikePrice}&navigatePath=${navigatePath}`
    );
  };

  return (
    <Card
      sx={{
        minHeight: "50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <IconButton
        size="large"
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        onClick={handleClick}
        sx={{ marginTop: "1rem" }}
      >
        <AddCircleIcon color="primary" />
      </IconButton>
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
            handleOpenDialog(stock.symbol, true);
          }}
          disableRipple
        >
          Add to Stock List
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenDialog(stock.symbol, false);
          }}
          disableRipple
        >
          Buy Stock
        </MenuItem>
      </Menu>

      {add ? (
        <AddToStockList
          open={openDialog}
          handleClose={() => setOpenDialog(false)}
          symbol={dialogSymbol}
        />
      ) : (
        <BuyStock
          open={openDialog}
          handleClose={() => setOpenDialog(false)}
          symbol={dialogSymbol}
        />
      )}

      <CardActionArea
        onClick={() => handleStockNavigation(stock.symbol, stock.strike_price)}
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
  );
}

export default StockCard;
