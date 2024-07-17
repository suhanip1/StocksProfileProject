import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import LogInPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LogInPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
