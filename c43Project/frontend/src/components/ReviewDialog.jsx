import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from "@mui/material";
import api from "../api";

function ReviewDialog({ open, onClose, stockList, onReview }) {
  const [reviewText, setReviewText] = useState("");
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`getReview/${stockList.slid}/`);
        if (res.data.reviewText) {
          setReviewText(res.data.reviewText);
          setHasReview(true);
        } else {
          setReviewText("");
          setHasReview(false);
        }
      } catch (error) {
        console.error("Error fetching review:", error);
      }
    };

    if (open && stockList) {
      fetchReview();
    }
  }, [open, stockList]);

  const handleReview = async () => {
    try {
      if (hasReview){
        const res =  await api.put(`editReview/${stockList.slid}/`, { reviewText })
        alert(res.data.message);
      }
      else{
        const res =  await api.post(`leaveReview/${stockList.slid}/`, { reviewText })
        alert(res.data.message);
      }
      onReview(stockList, reviewText);
      if (!hasReview) {
        setHasReview(true);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`deleteReview/${stockList.slid}/`);
      alert(res.data.message);
      onReview(stockList, ""); 
      setReviewText("");
      setHasReview(false);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{hasReview ? "Edit Your Review" : "Leave a Review"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Review"
          type="text"
          fullWidth
          variant="standard"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {hasReview && <Button onClick={handleDelete} color="secondary">Delete</Button>}
        <Button onClick={handleReview}>{hasReview ? "Edit" : "Submit"}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewDialog;
