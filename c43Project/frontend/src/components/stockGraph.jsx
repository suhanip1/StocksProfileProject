import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  TextField,
  MenuItem,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Statistics from "./getData";
import host from "../utils/links";
import CustomAnimatedLine from "./CustomAnimatedLine";
const StockGraph = ({ symbol }) => {
  const [interval, setInterval] = useState("month");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [xValues, setXValues] = useState([]);
  const [yValues, setYValues] = useState([]);
  const [futureXValues, setFutureXValues] = useState([]);
  const [futureYValues, setFutureYValues] = useState([]);
  const [showFuturePrices, setShowFuturePrices] = useState(false);
  const [futureInterval, setFutureInterval] = useState("month");
  const [futureData, setFutureData] = useState([]);

  useEffect(() => {
    if (symbol) {
      getData();
    }
  }, [symbol, interval]);

  useEffect(() => {
    if (showFuturePrices) {
      getFutureData();
      console.log(futureYValues);
      console.log(futureXValues);
    }
    if (!showFuturePrices) {
      setFutureData([]);
      setFutureXValues([]);
      setFutureYValues([]);
    }
  }, [showFuturePrices, futureInterval, interval]);

  const getData = async () => {
    setLoading(true);
    await fetch(
      `${host}/stock-performance/?symbol=${symbol}&interval=${interval}`
    )
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        // Format the data for the LineChart
        const formattedData = data.map((item) => ({
          x: new Date(item.timestamp),
          y: item.close,
        }));
        setData(formattedData);
        // Extract x-axis values
        const x = formattedData.map((point) => point.x);
        setXValues(x);
        // Extract y-axis values
        const y = formattedData.map((point) => point.y);
        setYValues(y);
        console.log(`past: ${x}`);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching stock data:", error);
      });
  };

  const getFutureData = async () => {
    setLoading(true);
    await fetch(
      `${host}/predict-prices/${symbol}/${interval}/${futureInterval}/`
    )
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);

        const formattedData = data.map((item) => ({
          x: new Date(item.timestamp),
          y: item.close,
        }));
        console.log(formattedData);
        setFutureData(formattedData);
        // Extract x-axis values
        const x = formattedData.map((point) => point.x);
        setFutureXValues(x);
        // Extract y-axis values
        const y = formattedData.map((point) => point.y);
        setFutureYValues(y);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching stock data:", error);
      });
  };

  const valueFormatter = (value) => {
    const date = new Date(value);
    switch (interval) {
      case "week":
      case "month":
        return date.toLocaleDateString(); // Show full date
      case "quarter":
      case "year":
        return date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }); // Show month and year
      case "five_years":
        return date.getFullYear().toString(); // Show year only
      default:
        return date.toLocaleDateString();
    }
  };
  return (
    <Stack
      sx={{
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack direction="row" spacing={3}>
        <TextField
          select
          label="Interval"
          variant="outlined"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <MenuItem value="week">1 Week</MenuItem>
          <MenuItem value="month">1 Month</MenuItem>
          <MenuItem value="quarter">3 Months</MenuItem>
          <MenuItem value="year">1 Year</MenuItem>
          <MenuItem value="five_years">5 Years</MenuItem>
        </TextField>
        <Statistics symbol={symbol} interval={interval} />
      </Stack>
      <Stack direction="row" spacing={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showFuturePrices}
              onChange={(e) => setShowFuturePrices(e.target.checked)}
            />
          }
          label="Show Future Prices"
        />
        {showFuturePrices && (
          <TextField
            select
            label="Interval"
            variant="outlined"
            value={futureInterval}
            onChange={(e) => setFutureInterval(e.target.value)}
          >
            <MenuItem value="week">1 Week</MenuItem>
            <MenuItem value="month">1 Month</MenuItem>
            <MenuItem value="quarter">3 Months</MenuItem>
            <MenuItem value="year">1 Year</MenuItem>
          </TextField>
        )}
      </Stack>
      <div>
        {data.length !== 0 && (
          <LineChart
            width={600}
            height={300}
            xAxis={[
              {
                id: "date",
                scaleType: "time",
                data: [...xValues, ...futureXValues],
                valueFormatter,
                tickMinStep:
                  interval === "week"
                    ? 3600 * 1000 * 24
                    : interval === "month"
                    ? 604800000
                    : interval === "quarter"
                    ? 24 * 60 * 60 * 1000 * 30
                    : interval === "year"
                    ? 24 * 60 * 60 * 1000 * 30
                    : interval === "five_years"
                    ? 24 * 60 * 60 * 1000 * 365
                    : 24 * 60 * 60 * 1000 * 30,
              },
            ]}
            series={[
              {
                curve: "linear",
                data: [...yValues, ...futureYValues],
                showMark: false,
              },
            ]}
            margin={{ top: 20, right: 30, bottom: 30, left: 100 }}
            grid={{ vertical: true, horizontal: true }}
            sx={{ color: "white" }}
            loading={loading}
            slots={{ line: CustomAnimatedLine }}
            slotProps={{
              line: {
                limit: Math.max(...xValues),
                sxAfter: { strokeDasharray: "10 5" },
              },
            }}
          />
        )}
      </div>
    </Stack>
  );
};

export default StockGraph;
