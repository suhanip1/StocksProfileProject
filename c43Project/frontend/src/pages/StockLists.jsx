import React from "react";
import {
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
import RatingsDialog from "../components/RatingsDialog";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function StockLists() {
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
  const [currentStockList, setCurrentStockList] = React.useState(null);
  const [openRatingsDialog, setOpenRatingsDialog] = React.useState(false);
  const navigate = useNavigate();
  const [stockLists, setStockLists] = React.useState([]);

  React.useEffect(() => {
    getStockLists();
  }, [openDialog, openSnackbar, sl_name, visibility]);

  const getStockLists = async () => {
    try {
      const response = await api.get("/stocklists/", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setStockLists(response.data);
    } catch (error) {
      console.error("Error fetching stock lists:", error.response.data);
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleOpenUserMenu = (event, id, slname, visibility, stockList) => {
    setAnchorElUser(event.currentTarget);
    setCurrentStockList(stockList)
    setSlid(id);
    setSl_name(slname);
    setVisibility(visibility);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const deleteStockList = async (id) => {
    try {
      await api.delete(`/stocklists/delete/${id}/`);
      setMessage("The Stock List was successfully deleted");
      setSnackSeverity("success");
      setOpenSnackbar(true);
      setAnchorElUser(null);
    } catch (error) {
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
    setOpenShareDialog(true);
  };

  const handleShareDialogClose = () => {
    setOpenShareDialog(false);
  };

  const handleShareAction = (email) => {
    console.log(`Sharing stock list ${currentStockList.sl_name} with email ${email}`);
    setOpenShareDialog(false); 
  };

  const handleSeeRatings = (stockList) => {
    setOpenRatingsDialog(true);
  };

  const handleRatingsDialogClose = () => {
    setOpenRatingsDialog(false);
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
        <Typography sx={{ fontSize: "2rem" }}>My Stock Lists</Typography>
        <IconButton
          aria-label="Create Stock List"
          size="large"
          onClick={() => openStockListDialog(true)}
        >
          <AddCircleIcon color="primary" />
        </IconButton>
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
                  item.visibility,
                  item
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
              <MenuItem key={"Edit"} onClick={() => openStockListDialog(false)}>
                <Typography textAlign="center">{"Edit"}</Typography>
              </MenuItem>
              <MenuItem key={"Delete"} onClick={() => deleteStockList(slid)}>
                <Typography textAlign="center">{"Delete"}</Typography>
              </MenuItem>
              <MenuItem key={"Share"} onClick={() => handleShare(item)}>
                <Typography textAlign="center">{"Share"}</Typography>
              </MenuItem>
              <MenuItem key={"See Reviews"} onClick={() => handleSeeRatings(item)}>
                <Typography textAlign="center">{"See Reviews"}</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        </Card>
      ))}
      {create ? (
        <CreateStockList
          open={openDialog}
          handleClose={handleClose}
          onSave={handleSave}
        />
      ) : (
        <CreateStockList
          open={openDialog}
          handleClose={handleClose}
          create={false}
          slid={slid}
          sl_name={sl_name}
          prev_visibility={visibility}
          onSave={handleSave}
        />
      )}
      <ShareDialog
        open={openShareDialog}
        onClose={handleShareDialogClose}
        stockList={currentStockList}
        onShare={handleShareAction}
      />
      <RatingsDialog
        open={openRatingsDialog}
        onClose={handleRatingsDialogClose}
        stockList={currentStockList}
        bool={true}
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

export default StockLists;
