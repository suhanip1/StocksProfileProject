import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import host from "../utils/links";

const StockMatrix = ({ id, interval, type }) => {
  const [covMatrix, setCovMatrix] = useState({});
  const [corMatrix, setCorMatrix] = useState({});
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const covResponse = await fetch(
          `${host}/covariance-matrix/${id}/${interval}/${type}`
        );

        if (!covResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const covData = await covResponse.json();
        setCovMatrix(covData);
        setSymbols(Object.keys(covData));

        const corResponse = await fetch(
          `${host}/correlation-matrix/${id}/${interval}/${type}`
        );
        if (!corResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const corData = await corResponse.json();
        setCorMatrix(corData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrix();
  }, [id, interval, type]);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Stock Covariance Matrix
      </Typography>
      <TableContainer component={Paper} sx={{ marginBottom: "2rem" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {symbols.map((symbol) => (
                <TableCell key={symbol}>{symbol}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {symbols.map((symbol1) => (
              <TableRow key={symbol1}>
                <TableCell>{symbol1}</TableCell>
                {symbols.map((symbol2) => (
                  <TableCell key={symbol2}>
                    {covMatrix[symbol1] &&
                    covMatrix[symbol1][symbol2] !== undefined
                      ? covMatrix[symbol1][symbol2].toFixed(8)
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" gutterBottom>
        Stock Correlation Matrix
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {symbols.map((symbol) => (
                <TableCell key={symbol}>{symbol}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {symbols.map((symbol1) => (
              <TableRow key={symbol1}>
                <TableCell>{symbol1}</TableCell>
                {symbols.map((symbol2) => (
                  <TableCell key={symbol2}>
                    {corMatrix[symbol1] &&
                    corMatrix[symbol1][symbol2] !== undefined
                      ? corMatrix[symbol1][symbol2].toFixed(8)
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default StockMatrix;
