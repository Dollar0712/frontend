
import { useEffect, useState } from "react";
import { getAllDevices, getTemperatureReadings } from "./api/tempSensor";
import { Box, Typography, Button, MenuItem, Select, FormControl, InputLabel, Paper } from '@mui/material';
import TemperatureChart from "./components/TemperatureChart";
import SensorSettingsPanel from "./components/SensorSettingsPanel";
import { connectToSocket, onSensorConnectionLost } from "./socket";


function App() {
  const timescales = ['minutely', 'hourly', 'daily', 'monthly'];

  const [allDevices, setAllDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [temperatureData, setTemperatureData] = useState([]);
  const [timescale, setTimescale] = useState(timescales[1]);
  const [sensorLost, setSensorLost] = useState("");

  connectToSocket();

  onSensorConnectionLost((deviceId) => {
    setSensorLost(deviceId);
  });

  useEffect(() => {
    setSensorLost("");
    setTemperatureData([]);
  }, [selectedDevice]);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await getAllDevices();
        const devices = response.data;
        setAllDevices(devices);
        setSelectedDevice(devices.length > 0 ? devices[0] : null);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    }
    fetchDevices();
  }, []);

  async function loadTemperatureData() {
    if (!selectedDevice) return;

    try {
      let limit;
      switch (timescale) {
        case 'minutely':
          limit = 60 * 60;
          break;
        case 'hourly':
          limit = 24 * 60 * 60;
          break;
        case 'daily':
          limit = 30 * 24 * 60 * 60;
          break;
        case 'monthly':
          limit = 12 * 30 * 24 * 60 * 60;
          break;
        default:
          console.error('Invalid timescale:', timescale);
          return;
      }

      const response = await getTemperatureReadings({ device_id: selectedDevice, limit: limit });

      setTemperatureData(response.data);

    } catch (error) {
      console.error('Error fetching temperature readings:', error);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', p: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 700, mx: 'auto', p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          Temperature Sensor Dashboard
        </Typography>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {timescales.map(ts => (
              <Button
                key={ts}
                variant={timescale === ts ? 'contained' : 'outlined'}
                color={timescale === ts ? 'primary' : 'inherit'}
                size="small"
                onClick={() => setTimescale(ts)}
              >
                {ts}
              </Button>
            ))}
          </Box>
          <FormControl fullWidth sx={{ maxWidth: 300 }}>
            <InputLabel id="device-select-label">Select Device</InputLabel>
            <Select
              labelId="device-select-label"
              id="device-select"
              value={selectedDevice || ''}
              label="Select Device"
              onChange={e => setSelectedDevice(e.target.value)}
            >
              <MenuItem value="">-- Select a device --</MenuItem>
              {allDevices.map(device => (
                <MenuItem key={device} value={device}>{device}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedDevice}
            onClick={loadTemperatureData}
            sx={{ height: 56, minWidth: 160 }}
          >
            Load Temperature Data
          </Button>
        </Box>

        {selectedDevice && (
          <Box sx={{ mt: 2 }}>
            {sensorLost !== "" && (
              <Typography color="error.main" sx={{ mb: 2 }}>
                Sensor connection lost for device: <strong>{sensorLost}</strong>
              </Typography>
            )}
            <SensorSettingsPanel deviceId={selectedDevice} />
            <Typography variant="h6" gutterBottom>
              Temperature Trend for <Box component="span" color="primary.main" fontWeight={600}>{selectedDevice}</Box>
            </Typography>
            {temperatureData.length > 0 ? (
              <Box sx={{ height: 400, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 1 }}>
                <TemperatureChart data={temperatureData} timescale={timescale} />
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 3 }}>
                No data
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default App;
