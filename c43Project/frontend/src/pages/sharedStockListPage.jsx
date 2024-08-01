import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Menu,
  MenuItem,
  Card,
  Snackbar,
  Alert,
  CardActionArea,
  IconButton
} from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import CreateStockList from "../components/createStockListDialog";
import ShareDialog from "../components/ShareDialog";
import ReviewDialog from "../components/ReviewDialog";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function SharedStockListPage() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [create, setCreate] = React.useState(null);
  const [slid, setSlid] = React.useState(null);
  const [sl_name, setSl_name] = React.useState("");
  const [visibility, setVisibility] = React.useState("");
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [openShareDialog, setOpenShareDialog] = React.useState(false);
  const [openReviewDialog, setOpenReviewDialog] = React.useState(false);
  const [currentStockList, setCurrentStockList] = React.useState(null);
  const [currentReview, setCurrentReview] = React.useState(null);
  const navigate = useNavigate();
  const [stockLists, setStockLists] = React.useState([]);

  React.useEffect(() => {
    getStockLists();
  }, [openDialog, openSnackbar, sl_name, visibility]);

  const getStockLists = async () => {
    try {
      const res = await api.get("getSharedStockList/");
      console.log(res.data);
      setStockLists(res.data);
    } catch (error) {
      console.error("Error fetching stock lists:", error.response.data);
    }
  };

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };

  const handleOpenUserMenu = (event, id, slname, visibility) => {
    setAnchorElUser(event.currentTarget);
    setSlid(id);
    setSl_name(slname);
    setVisibility(visibility);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const deleteStockList = async (id) => {
    console.log("delete");
    try {
      await api.delete(`/stocklists/delete/${id}/`);
      setMessage("The Stock List was successfully deleted");
      setSnackSeverity("success");
      setOpenSnackbar(true);
      setAnchorElUser(null);
    } catch (error) {
      console.log(error);
      setMessage("There was an error when trying to delete the stock list");
      setSnackSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const openStockListDialog = (create) => {
    setOpenDialog(true);
    setCreate(create);
  };

  const handleSave = () => {
    getStockLists();
    setOpenDialog(false);
  };

  const handleShare = (stockList) => {
    setCurrentStockList(stockList);
    setOpenShareDialog(true);
  };

  const handleShareDialogClose = () => {
    setOpenShareDialog(false);
  };

  const handleShareAction = (username) => {
    console.log(`Sharing stock list ${currentStockList.sl_name} with username ${username}`);
    setOpenShareDialog(false);
  };

  const handleReview = async (stockList) => {
    setCurrentStockList(stockList);
    try {
      const res = await api.get(`getReview/${stockList.slid}/`);
      if (res.data) {
        setCurrentReview(res.data);
      }
    } catch (error) {
      console.error("Error fetching review:", error.response.data);
    }
    setOpenReviewDialog(true);
  };

  const handleReviewDialogClose = () => {
    setOpenReviewDialog(false);
  };

  const handleReviewAction = (stockList, reviewText) => {
    console.log(`Reviewing stock list ${stockList.sl_name} with text: ${reviewText}`);
    setOpenReviewDialog(false);
    getStockLists(); // Refresh the list after review
  };

  const handleDeleteReview = (stockList) => {
    console.log(`Deleting review for stock list ${stockList.sl_name}`);
    getStockLists(); // Refresh the list after review deletion
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
      <Button variant="outlined" onClick={handleHome}>
        Back to Home
      </Button>
      <Stack
        spacing={2}
        sx={{
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        direction="row"
      >
      <h2> Shared Stock List</h2>
      </Stack>
      {stockLists.map((item) => (
        <Card sx={{ minWidth: 270 }} key={item.slid}>
          <Stack direction="row">
            <CardActionArea
              onClick={() => {
                navigate(`/StockList?slid=${item.slid}`);
              }}
            >
              <Stack
                direction="row"
                sx={{
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.4rem",
                    paddingLeft: "20px",
                    fontFamily: "monospace",
                  }}
                >
                  {item.sl_name}
                </Typography>
              </Stack>
            </CardActionArea>
            <IconButton
              aria-label="settings"
              onClick={(event) =>
                handleOpenUserMenu(
                  event,
                  item.slid,
                  item.sl_name,
                  item.visibility
                )
              }
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem key={"Leave Review"} onClick={() => handleReview(item)}>
                <Typography textAlign="center">{"Leave Review"}</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        </Card>
      ))}
      <ShareDialog
        open={openShareDialog}
        onClose={handleShareDialogClose}
        stockList={currentStockList}
        onShare={handleShareAction}
      />
      <ReviewDialog
        open={openReviewDialog}
        onClose={handleReviewDialogClose}
        stockList={currentStockList}
        review={currentReview}
        onReview={handleReviewAction}
        onDelete={handleDeleteReview}
      />
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

export default SharedStockListPage;
