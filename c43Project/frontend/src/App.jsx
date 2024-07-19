import React, { useEffect } from "react";
import LogInPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/Homepage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  //clear local storage to remove old access tokens
  localStorage.clear();
  return <SignupPage />;
}

function App() {
  return (
    <>
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
        </Routes>
      </Router>
    </>
  );
}

export default App;
