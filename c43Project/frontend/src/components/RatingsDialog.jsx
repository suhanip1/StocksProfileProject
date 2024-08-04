import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api";

function RatingsDialog({ open, onClose, stockList, bool }) {
  const [ratings, setRatings] = React.useState([]);

  React.useEffect(() => {
    if (open && stockList) {
      fetchRatings(stockList.slid);
    }
  }, [open, stockList]);

  const fetchRatings = async (slid) => {
    try {
      const response = await api.get(`allReviews/${slid}/`);
      setRatings(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching reviews:", error.response.data);
    }
  };
  


  const handleDeleteRating = async (slid, username) => {
    try {
      if (!bool){
        const res = await api.delete(`deleteReview/${slid}/`);
        alert(res.data.message)
      }else{
        const res = await api.delete(`delete_review_of_your_stock_list/${slid}/${username}/`);
        alert(res.data.message)
      }
      setRatings((prevRatings) => prevRatings.filter(rating => rating.slid !== slid));
    } catch (error) {
      console.error("Error deleting reviews:", error.response.data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reviews for {stockList?.sl_name}</DialogTitle>
      <DialogContent>
        {ratings.length > 0 ? (
          <List>
            {ratings.map((rating) => (
              bool ? ( 
              <ListItem
                key={rating.slid}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() =>{console.log(rating.username) , handleDeleteRating(rating.slid, rating.username)}}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  secondary={`Comment: ${rating.reviewText} by ${rating.username}`}
                />
              </ListItem>
            ) : 
            <ListItem
                key={rating.slid}
            >
                <ListItemText
                  secondary={`Comment: ${rating.reviewText} by ${rating.username}`}
                />
              </ListItem>
            
            ))}
          </List>
        ) : (
          <Typography>No Reviews available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RatingsDialog;
