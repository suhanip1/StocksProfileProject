import { Link, useNavigate } from "react-router-dom";
import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";

const LogInPage = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [hasError, setHasError] = React.useState(false);
  const passwordRef = React.useRef(null);
  const navigate = useNavigate();

  const logInRequest = async () => {
    if (await logIn(username, password)) {
      navigate("/");
    } else {
      setHasError(true);
      setPassword("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (event.currentTarget === passwordRef.current) {
        logInRequest();
      } else {
        event.preventDefault();
        passwordRef.current?.focus();
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Log in
        </Typography>
        <Typography variant="body2" gutterBottom>
          Not a member already? <Link to="/signup">Sign up!</Link>
        </Typography>
        <form
          noValidate
          autoComplete="off"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <TextField
            label="Username"
            variant="outlined"
            required
            fullWidth
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyDown={handleKeyDown}
          />
          <TextField
            inputRef={passwordRef}
            label="Password"
            type="password"
            variant="outlined"
            required
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            onKeyDown={handleKeyDown}
          />
          {hasError && (
            <Alert severity="error">Username or password is incorrect</Alert>
          )}
          <Link to="#">
            <Typography variant="body2">Forgot password?</Typography>
          </Link>
          <Button variant="contained" color="primary" onClick={logInRequest}>
            Log in
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LogInPage;
