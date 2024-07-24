import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { TextField, MenuItem, Button } from "@mui/material";

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
    const startDate = new Date(staticToday);
    startDate.setMonth(startDate.getMonth() - 1);

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

  return (
    <div>
      <div>
        {data.length != 0 && (
          <LineChart
            width={300}
            height={200}
            leftAxis={null}
            bottomAxis={null}
            xAxis={[
              {
                id: "date",
                scaleType: "time",
                data: xValues,
                valueFormatter: (value) => value.toString(),
                disableTicks: true,
              },
            ]}
            yAxis={[
              {
                disableTicks: true,
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
            sx={{ color: "white" }}
          ></LineChart>
        )}
      </div>
    </div>
  );
};

export default StockGraph;
