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

function CreateStockList({
  open,
  handleClose,
  create = true,
  slid = null,
  sl_name = "",
  prev_visibility = "private",
  onSave,
}) {
  const [slname, setSlname] = React.useState(sl_name);
  const [visibility, setVisibility] = React.useState(prev_visibility);
  const [message, setMessage] = React.useState("");
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackSeverity, setSnackSeverity] = React.useState("success");
  const [userId, setUserId] = React.useState(-1);

  React.useEffect(() => {
    getAndSetUser();
  }, []);

  React.useEffect(() => {
    setSlname(sl_name);
    setVisibility(prev_visibility);
  }, [create, sl_name, prev_visibility]);

  const getAndSetUser = async () => {
    const response = await api.get("/user/get-curr-user/", {
      method: "GET",
    });
    setUserId(response.data.user_id);
  };

  const createSl = async () => {
    const stocklist = {
      sl_name: slname,
      visibility: visibility,
      user: userId,
    };
    try {
      const response = await api.post("/stocklists/create/", stocklist, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(
        `created a stock list with name ${slname} and it is set to ${visibility}`
      );
      if (onSave) onSave();
    } catch (error) {
      console.error("Error creating stock list:", error);
    }
    setMessage(`Successfully created a stock list!`);
    setSnackSeverity("success");
    setOpenSnackbar(true);
  };

  const editSl = async (slid) => {
    console.log(slid);
    try {
      const response = await api.put(
        `/stocklists/edit/${slid}/${visibility}/${slname}`
      );
      console.log(
        `edited a stock list with name ${slname} and it is set to ${visibility}`
      );
      setMessage(`Successfully edited a stock list!`);
      setSnackSeverity("success");
      setOpenSnackbar(true);
      if (onSave) onSave();
    } catch (error) {
      console.error("Error editing stock list:", error);
      setMessage(`Error editing a stock list!`);
      setSnackSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleSubmit = (slid) => {
    if (slname != "" && create) {
      createSl();
      handleClose();
    } else if (slname == "") {
      setMessage("Please enter a name for your stock list");
      setSnackSeverity("error");
      setOpenSnackbar(true);
      return;
    } else if (!create) {
      editSl(slid);
      handleClose();
    }
  };

  const handleChange = (event) => {
    setVisibility(event.target.value);
  };

  const handleCloseSnackbar = (event) => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {create ? "Create Stock List" : "Edit Stock List"}
        </DialogTitle>
        <DialogContent>
          <Stack space={2}>
            <FormControl className="input_field" sx={{ paddingBottom: 1 }}>
              <OutlinedInput
                type="text"
                multiline
                placeholder="Name your Stock List"
                value={slname}
                onChange={(e) => {
                  setSlname(e.target.value);
                }}
              />
            </FormControl>
            <DialogContentText> Stock List Privacy: </DialogContentText>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                defaultValue={"private"}
                value={visibility}
                onChange={handleChange}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value={"private"}>private</MenuItem>
                <MenuItem value={"public"}>public</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              handleSubmit(slid);
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
export default CreateStockList;
