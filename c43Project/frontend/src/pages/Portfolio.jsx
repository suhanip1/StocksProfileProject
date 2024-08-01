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
import CreatePortfolio from "../components/createPortfolioDialog";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function Portfolio() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [create, setCreate] = React.useState(null);
  const [pid, setPid] = React.useState(null);
  const [pname, setPname] = React.useState("");
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = React.useState([]);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");

  React.useEffect(() => {
    getPortfolio();
  }, [openDialog, openSnackbar, pname]);

  const getPortfolio = async () => {
    try {
      const response = await api.get("/portfolio/", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolios", error.response.data);
    }
  };

  const handleHome = () => {
    console.log("Go back to Home Page");
    navigate("/");
  };
  const handleOpenUserMenu = (event, id, pname) => {
    setAnchorElUser(event.currentTarget);
    setPid(id);
    setPname(pname);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const deletePortfolio = async (id) => {
    console.log("delete");
    try {
      await api.delete(`/portfolio/delete/${id}/`);
      setMessage(`The Portfolio was successfully deleted`);
      setSnackSeverity("success");
      setOpenSnackbar(true);
      setAnchorElUser(null);
    } catch (error) {
      console.log(error);
      setMessage("There was an error when trying to delete the portfolio");
      setSnackSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  };
  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  const openPortfolioDialog = (create) => {
    setOpenDialog(true);
    if (create) {
      setCreate(true);
    } else {
      setCreate(false);
    }
  };

  const handleSave = () => {
    getPortfolio();
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
        <Typography sx={{ fontSize: "2rem" }}>My Portfolios</Typography>
        <IconButton
          aria-label="Create Portfolio"
          size="large"
          onClick={() => openPortfolioDialog(true)}
        >
          <AddCircleIcon color="primary" />
        </IconButton>
      </Stack>
      {portfolio.map((item) => (
        <Card sx={{ minWidth: 270 }} key={item.pid}>
          <Stack direction="row">
            <CardActionArea
              onClick={() => {
                navigate(`/portfolio-page?pid=${item.pid}`);
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
                  {item.pname}
                </Typography>
              </Stack>
            </CardActionArea>
            <IconButton
              aria-label="settings"
              onClick={(event) =>
                handleOpenUserMenu(event, item.pid, item.pname)
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
              <MenuItem key={"Edit"} onClick={() => openPortfolioDialog(false)}>
                <Typography textAlign="center">{"Edit"}</Typography>
              </MenuItem>
              <MenuItem key={"Delete"} onClick={() => deletePortfolio(pid)}>
                <Typography textAlign="center">{"Delete"}</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        </Card>
      ))}
      {create ? (
        <CreatePortfolio
          open={openDialog}
          handleClose={handleClose}
          onSave={handleSave}
        />
      ) : (
        <CreatePortfolio
          open={openDialog}
          handleClose={handleClose}
          create={false}
          pid={pid}
          p_name={pname}
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

export default Portfolio;
