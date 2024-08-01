import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  OutlinedInput,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";

import api from "../api";
import host from "../utils/links";

function CreatePortfolio({
  open,
  handleClose,
  create = true,
  pid = null,
  p_name = "",
  onSave,
}) {
  const [pname, setPname] = React.useState(p_name);
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [userId, setUserId] = React.useState(-1);

  React.useEffect(() => {
    getAndSetUser();
  }, []);

  React.useEffect(() => {
    setPname(p_name);
  }, [create, p_name]);

  const getAndSetUser = async () => {
    const response = await api.get("/user/get-curr-user/", {
      method: "GET",
    });
    setUserId(response.data.user_id);
  };

  const createPortfolio = async () => {
    const portfolio = {
      pname: pname,
      user: userId,
    };
    try {
      const response = await api.post("/portfolio/create/", portfolio, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(`created a portfolio with name ${pname}`);
      setMessage(`Successfully created a portfolio!`);
      setSnackSeverity("success");
      setOpenSnackbar(true);
      if (onSave) onSave();
    } catch (error) {
      console.error("Error creating portfolio:", error);
      setMessage(`Error creating a portfolio!`);
      setSnackSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const editPortfolio = async (pid) => {
    console.log(pid);
    try {
      const response = await api.put(`/portfolio/edit/${pid}/${pname}`);
      console.log(`edited a portfolio with name ${pname} `);
      setMessage(`Successfully edited a Portfolio!`);
      setSnackSeverity("success");
      setOpenSnackbar(true);
      if (onSave) onSave();
    } catch (error) {
      console.error("Error editing portfolio:", error);
      setMessage(`Error editing a portfolio!`);
      setSnackSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleSubmit = (pid) => {
    if (pname != "" && create) {
      createPortfolio();
      handleClose();
    } else if (pname == "") {
      setMessage("Please enter a name for your portfolio");
      setSnackSeverity("error");
      setOpenSnackbar(true);
      return;
    } else if (!create) {
      editPortfolio(pid);
      handleClose();
    }
  };

  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {create ? "Create Portfolio" : "Edit Portfolio"}
        </DialogTitle>
        <DialogContent>
          <FormControl className="input_field" sx={{ paddingBottom: 1 }}>
            <OutlinedInput
              type="text"
              multiline
              placeholder="Name your Portfolio"
              value={pname}
              onChange={(e) => {
                setPname(e.target.value);
              }}
            />
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              handleSubmit(pid);
            }}
            sx={{ backgroundColor: "green" }}
            variant="contained"
          >
            {create ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
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
    </div>
  );
}
export default CreatePortfolio;
