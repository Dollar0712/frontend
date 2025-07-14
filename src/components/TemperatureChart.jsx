import PropTypes from "prop-types";
import { LineChart } from "@mui/x-charts/LineChart";
import { axisClasses } from "@mui/x-charts";

const timescaleFormats = {
  minutely: {
    timeUnit: "minute",
    format: (d) => {
      const date = d instanceof Date ? d : new Date(d);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },
  },
  hourly: {
    timeUnit: "hour",
    format: (d) => {
      const date = d instanceof Date ? d : new Date(d);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },
  },
  daily: {
    timeUnit: "day",
    format: (d) => {
      const date = d instanceof Date ? d : new Date(d);
      return date.toLocaleDateString();
    },
  },
  monthly: {
    timeUnit: "month",
    format: (d) => {
      const date = d instanceof Date ? d : new Date(d);
      return date.toLocaleString([], { year: 'numeric', month: '2-digit' });
    },
  },
};

function getAggregatedData(data, timescale) {
  const result = {};

  const pad = (n) => n.toString().padStart(2, '0');
  for (const item of data) {
    const date = new Date(item.timestamp);
    let key = '', timeObj = null;
    switch (timescale) {
      case 'minutely':
        key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        timeObj = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        break;
      case 'hourly':
        key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`;
        timeObj = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
        break;
      case 'daily':
        key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        timeObj = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
        timeObj = new Date(date.getFullYear(), date.getMonth(), 1);
        break;
      default:
        throw new Error('Invalid timescale: ' + timescale);
    }
    if (!result[key]) result[key] = { values: [], timeObj };
    result[key].values.push(item.value);
  }
  return Object.values(result).map(({ timeObj, values }) => ({
    time: timeObj,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  }));
}

function TemperatureChart({ data, timescale }) {
  const format = timescaleFormats[timescale]?.format || ((d) => d);
  const aggregatedData = getAggregatedData(data, timescale);
  
  // Only show the most recent 60 minutes, 24 hours, 30 days, or 12 months
  let filteredData = aggregatedData;
  if (aggregatedData.length > 0) {
    const now = new Date();
    if (timescale === 'minutely') {
      const cutoff = new Date(now.getTime() - 60 * 60 * 1000);
      filteredData = aggregatedData.filter(d => d.time >= cutoff);
    } else if (timescale === 'hourly') {
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredData = aggregatedData.filter(d => d.time >= cutoff);
    } else if (timescale === 'daily') {
      const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // Include today
      filteredData = aggregatedData.filter(d => d.time >= cutoff);
    } else if (timescale === 'monthly') {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      filteredData = aggregatedData.filter(d => d.time >= cutoff);
    }
  }

  const xData = filteredData.map((d) => d.time);
  return (
    <LineChart
      xAxis={[
        {
          data: xData,
          valueFormatter: (d, idx) =>
            timescale === 'hourly'
              ? format(d, idx, xData)
              : format(d),
          label: "Time",
        },
      ]}
      series={[
        {
          data: filteredData.map((d) => d.avg),
          label: "Temperature (°C)",
          color: "#1976d2",
        },
      ]}
      height={350}
      sx={{
        [`& .${axisClasses.left} .${axisClasses.label}`]: { fontWeight: "bold" },
        [`& .${axisClasses.bottom} .${axisClasses.label}`]: { fontWeight: "bold" },
      }}
      yAxis={[{ label: "Temperature (°C)" }]}
      grid={{ vertical: true, horizontal: true }}
    />
  );
}

TemperatureChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
      temperature: PropTypes.number.isRequired,
    })
  ).isRequired,
  timescale: PropTypes.oneOf(["minutely", "hourly", "daily", "monthly"]),
};

export default TemperatureChart;
