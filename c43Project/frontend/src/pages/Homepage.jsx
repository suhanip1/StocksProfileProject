import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import api from "../api";

function HomePage() {
  const [userId, setUserId] = React.useState(-1);
  const [userName, setUserName] = React.useState("");

  React.useEffect(() => {
    getAndSetUser();
  }, []);

  const getAndSetUser = async () => {
    const response = await api.get("/user/get-curr-user/", {
      method: "GET",
    });
    setUserId(response.data.user_id);
    setUserName(response.data.user_name);
  };

  const handlePortfolio = () => {
    console.log("Go to Portfolios List");
    // navigate("/Portfolios");
  };

  const handleStockLists = () => {
    console.log("Go to StockList Lists");
    // navigate("/StockLists");
  };

  const handleSharedStockLists = () => {
    console.log("Go to Shared StockList Lists");
    // navigate("/StockLists");
  };

  const handleFriends = () => {
    console.log("Go to Friends Lists");
    // navigate("/FriendsList");
  };

  return (
    <Box
      sx={{
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={2}>
        <Typography sx={{ fontSize: "2rem" }}>Welcome, {userName}</Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ fontSize: "1.5rem" }}
          onClick={handlePortfolio}
        >
          Portfolios
        </Button>
        <Button
          variant="contained"
          size="large"
          sx={{ fontSize: "1.5rem" }}
          onClick={handleStockLists}
        >
          My StockLists
        </Button>
        <Button
          variant="contained"
          size="large"
          sx={{ fontSize: "1.5rem" }}
          onClick={handleSharedStockLists}
        >
          Shared StockLists
        </Button>
        <Button
          variant="contained"
          size="large"
          sx={{ fontSize: "1.5rem" }}
          onClick={handleFriends}
        >
          Friends
        </Button>
      </Stack>
    </Box>
  );
}

export default HomePage;
