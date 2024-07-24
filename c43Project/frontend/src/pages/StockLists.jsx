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
} from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import CreateStockList from "../components/createStockListDialog";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function StockLists() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [create, setCreate] = React.useState(null);
  const [slid, setSlid] = React.useState(null);
  const [sl_name, setSl_name] = React.useState("");
  const [visibility, setVisibility] = React.useState("");
  const navigate = useNavigate();
  const [stockLists, setStockLists] = React.useState([]);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");

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
      setMessage(`The Stock List was successfully deleted`);
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

  const edit = (id) => {
    setSlid(id);
    openStockListDialog(false);
    console.log("edit");
  };

  const handleClose = () => {
    setOpenDialog(false);
  };
  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  const openStockListDialog = (create) => {
    setOpenDialog(true);
    if (create) {
      setCreate(true);
    } else {
      setCreate(false);
    }
  };

  const handleSave = () => {
    getStockLists();
    setOpenDialog(false);
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
              <MenuItem key={"Edit"} onClick={() => openStockListDialog(false)}>
                <Typography textAlign="center">{"Edit"}</Typography>
              </MenuItem>
              <MenuItem key={"Delete"} onClick={() => deleteStockList(slid)}>
                <Typography textAlign="center">{"Delete"}</Typography>
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
