import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { TextField, MenuItem, Button, Stack } from "@mui/material";

const StockGraph = ({ symbol }) => {
  const [interval, setInterval] = useState("month");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [xValues, setXValues] = useState([]);
  const [yValues, setYValues] = useState([]);

  useEffect(() => {
    if (symbol) {
      getData();
    }
  }, [symbol, interval]);

  const getData = async () => {
    // Use a static date for testing
    const staticToday = new Date("2018-02-08");
    let startDate;
    switch (interval) {
      case "week":
        startDate = new Date(staticToday);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date(staticToday);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "quarter":
        startDate = new Date(staticToday);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "year":
        startDate = new Date(staticToday);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "five_years":
        startDate = new Date(staticToday);
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      default:
        startDate = new Date(staticToday);
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    setLoading(true);
    await fetch(
      `http://127.0.0.1:8000/stock-performance/?symbol=${symbol}&start_date=${
        startDate.toISOString().split("T")[0]
      }&end_date=${staticToday.toISOString().split("T")[0]}`
    )
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        // Format the data for the LineChart
        const formattedData = data.map((item) => ({
          date: new Date(item.timestamp),
          close: item.close,
        }));
        setData(formattedData);
        // Extract x-axis values
        const x = formattedData.map((point) => point.date);
        setXValues(x);
        // Extract y-axis values
        const y = formattedData.map((point) => point.close);
        setYValues(y);
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
      <div>
        {data.length != 0 && (
          <LineChart
            width={600}
            height={300}
            xAxis={[
              {
                id: "date",
                scaleType: "time",
                data: xValues,
                valueFormatter,
                tickMinStep:
                  interval === "week"
                    ? 3600 * 1000 * 24
                    : interval == "month"
                    ? 604800000
                    : interval == "quarter"
                    ? 24 * 60 * 60 * 1000 * 30
                    : interval == "year"
                    ? 24 * 60 * 60 * 1000 * 30
                    : interval == "five_years"
                    ? 24 * 60 * 60 * 1000 * 365
                    : 24 * 60 * 60 * 1000 * 30,
              },
            ]}
            series={[
              {
                curve: "linear",
                id: "price",
                data: yValues,
                showMark: false,
              },
            ]}
            margin={{ top: 20, right: 30, bottom: 30, left: 100 }}
            grid={{ vertical: true, horizontal: true }}
            sx={{ color: "white" }}
          ></LineChart>
        )}
      </div>
    </Stack>
  );
};

export default StockGraph;
