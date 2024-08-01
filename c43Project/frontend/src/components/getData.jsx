import React from "react";
import { Typography } from "@mui/material";
import host from "../utils/links";

function Statistics({ symbol, interval }) {
  const [cov, setCov] = React.useState(0);
  const [beta, setBeta] = React.useState(0);

  React.useEffect(() => {
    getData();
  }, [symbol, interval]);

  const getData = async () => {
    await fetch(`${host}/stock-cov/?symbol=${symbol}&interval=${interval}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(`cov: ${data}`);
        setCov(data.toFixed(2));
      })
      .catch((error) => {
        console.error("Error fetching stock cov:", error);
      });
    await fetch(`${host}/stock-beta/?symbol=${symbol}&interval=${interval}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(`beta: ${data}`);
        setBeta(data.toFixed(2));
      })
      .catch((error) => {
        console.error("Error fetching stock beta:", error);
      });
  };
  return (
    <div>
      <Typography
        sx={{ fontSize: "1rem", fontFamily: "monospace", color: "grey" }}
      >
        Coefficient of Variation: {cov}
      </Typography>
      <Typography
        sx={{ fontSize: "1rem", fontFamily: "monospace", color: "grey" }}
      >
        Beta: {beta}
      </Typography>
    </div>
  );
}
export default Statistics;
