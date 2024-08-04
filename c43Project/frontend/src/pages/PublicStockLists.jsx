import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import RatingsDialog from '../components/RatingsDialog';
import ReviewDialog from '../components/ReviewDialog';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function PublicStockLists() {
  const [publicStockLists, setPublicStockLists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStockList, setSelectedStockList] = useState(null);
  const [openRatingsDialog, setOpenRatingsDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentReview, setCurrentReview] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicStockLists();
    settingCurrentUser();
  }, []);

  const settingCurrentUser = async () => {
    try {
      const res = await api.get("get-curr-username/");
      if (res.data.username) {
        setCurrentUser(String(res.data.username));
      }
    } catch (error) {
      console.error('Error fetching current user:', error.response.data);
    }
  };

  const fetchPublicStockLists = async () => {
    try {
      const response = await api.get('/publicStockLists/');
      setPublicStockLists(response.data);
    } catch (error) {
      console.error('Error fetching public stock lists:', error.response.data);
    }
  };

  const handleSearchChange = (event, value) => {
    setSearchTerm(value);
  };

  const handleStockListClick = (event, stockList) => {
    if (event.target.closest('.menu-button')) return;
    navigate(`/StockList?slid=${stockList.slid}`);
  };

  const handleMenuClick = (event, stockList) => {
    console.log("stocklist2", stockList.sl_name )
    setSelectedStockList(stockList);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReview = async (stockList) => {
    try {
      const res = await api.get(`/getReview/${stockList.slid}/`);
      if (res.data) {
        setCurrentReview(res.data);
      }
    } catch (error) {
      console.error('Error fetching review:', error.response.data);
    }
    setOpenReviewDialog(true);
    handleMenuClose();
  };

  const handleViewReviews = async (stockList) => {
    setOpenRatingsDialog(true);
    handleMenuClose();
  };

  const handleReviewDialogClose = () => {
    setOpenReviewDialog(false);
    setCurrentReview(null);
  };

  const handleRatingsDialogClose = () => {
    setOpenRatingsDialog(false);
  };

  const handleReviewAction = async (stockList, reviewText) => {
    try {
      await api.post(`/postReview/${stockList.slid}/`, { reviewText });
      fetchPublicStockLists();
    } catch (error) {
      console.error('Error posting review:', error.response.data);
    }
    setOpenReviewDialog(false);
  };

  const handleDeleteReview = async (stockList) => {
    try {
      await api.delete(`/deleteReview/${stockList.slid}/`);
      fetchPublicStockLists();
    } catch (error) {
      console.error('Error deleting review:', error.response.data);
    }
    setOpenReviewDialog(false);
  };

  const handleHome = () => {
    navigate("/");
  };

  const filteredStockLists = publicStockLists.filter(stockList =>
    stockList.sl_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Stack spacing={2} sx={{ alignItems: 'center' }}>
      <Button variant="outlined" onClick={handleHome}>
        Back to Home
      </Button>
      <Typography variant="h4" align="center">Public Stock Lists</Typography>
      <Autocomplete
        freeSolo
        options={publicStockLists.map((stockList) => stockList.sl_name)}
        onInputChange={handleSearchChange}
        renderInput={(params) => (
          <TextField {...params} label="Search Public Stock Lists" variant="outlined" sx={{ width: 300 }} />
        )}
      />

      {filteredStockLists.map((stockList) => (
        currentUser !== stockList.user.username && (
          <Card sx={{ minWidth: 300, marginTop: 2 }} key={stockList.slid} onClick={(event) => handleStockListClick(event, stockList)}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{stockList.sl_name}</Typography>
                <IconButton
                  className="menu-button"
                  aria-label="settings"
                  onClick={(event) => handleMenuClick(event, stockList)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem className="menu-button" onClick={() => handleReview(stockList)}>Leave Review</MenuItem>
                  <MenuItem className="menu-button" onClick={() => handleViewReviews(stockList)}>View Reviews</MenuItem>
                </Menu>
              </Stack>
            </CardContent>
          </Card>
        )
      ))}

      {selectedStockList && (
        <RatingsDialog
          open={openRatingsDialog}
          onClose={handleRatingsDialogClose}
          stockList={selectedStockList}
          bool={false}
        />
      )}
      {selectedStockList && (
        <ReviewDialog
          open={openReviewDialog}
          onClose={handleReviewDialogClose}
          stockList={selectedStockList}
          review={currentReview}
          onReview={handleReviewAction}
          onDelete={handleDeleteReview}
        />
      )}
    </Stack>
  );
}

export default PublicStockLists;
