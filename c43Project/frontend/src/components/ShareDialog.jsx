import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";
import api from "../api";

function ShareDialog({ open, onClose, stockList, onShare }) {
  const [username, setUsername] = React.useState("");

  const handleShare = async () => {
    if (stockList.visibility === "public"){
      alert("cannot share public stocklist")
    }else{
      const res = await api.post(`shareStockList/${stockList.slid}/${username}/`);
      alert(res.data.message);
    }
    onShare(stockList, username);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share Stock List</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          variant="standard"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleShare}>Share</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ShareDialog;
