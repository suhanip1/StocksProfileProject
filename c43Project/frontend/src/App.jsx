import React, { useEffect } from "react";
import LogInPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StockList from "./pages/StockList";
import SearchStock from "./pages/SearchStocks";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/Homepage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import StockGraph from "./components/stockGraph";
import StockLists from "./pages/StockLists";
import Stock from "./pages/Stock";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function Logout() {
  sessionStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  //clear local storage to remove old access tokens
  sessionStorage.clear();
  return <SignupPage />;
}

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/signup" element={<RegisterAndLogout />} />
            <Route
              path="/StockLists"
              element={
                <ProtectedRoute>
                  <StockLists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/StockList"
              element={
                <ProtectedRoute>
                  <StockList />
                </ProtectedRoute>
              }
            />
            <Route path="/stockgraph" element={<StockGraph />} />
            <Route
              path="/stocks"
              element={
                <ProtectedRoute>
                  <SearchStock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Stock"
              element={
                <ProtectedRoute>
                  <Stock />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
