import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button, Slider, Switch, FormControlLabel, Paper } from "@mui/material";
import { setSimulatedSensorSettings, getSimulatedSensorSettings } from "../api/tempSensor";
import { onSensorSettingsUpdated } from "../socket/index.js";

export default function SensorSettingsPanel({ deviceId }) {
  const [enabled, setEnabled] = useState(true);
  const [period, setPeriod] = useState(1000);
  const [amplitude, setAmplitude] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fetchedSettings, setFetchedSettings] = useState(null);

  onSensorSettingsUpdated((data) => {
    if (data.deviceId === deviceId) {
      setFetchedSettings(data);
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setSuccess(false);
      setError("");
      try {
        await getSimulatedSensorSettings({ device_id: deviceId});
      } catch (err) {
        setError(err?.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (deviceId) fetchSettings();
  }, [deviceId]);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      const newSetting = {
        device_id: deviceId,
        enabled,
        period,
        amplitude,
      };

      await setSimulatedSensorSettings(newSetting);
      await getSimulatedSensorSettings({ device_id: deviceId });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Sensor Settings</Typography>
      <FormControlLabel
        control={<Switch checked={enabled} onChange={e => setEnabled(e.target.checked)} />}
        label="Signal Enabled"
      />
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom>Period (ms): {period}</Typography>
        <Slider
          value={period}
          min={100}
          max={10000}
          step={100}
          onChange={(_, v) => setPeriod(v)}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom>Amplitude: {amplitude}</Typography>
        <Slider
          value={amplitude}
          min={1}
          max={50}
          step={1}
          onChange={(_, v) => setAmplitude(v)}
          valueLabelDisplay="auto"
        />
      </Box>
      <Button variant="contained" onClick={handleSubmit} disabled={loading}>
        Apply
      </Button>
      {success && !loading && <Typography color="success.main" sx={{ mt: 1 }}>Settings applied!</Typography>}
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      {fetchedSettings && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Current Sensor Settings:</Typography>
          <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>{JSON.stringify(fetchedSettings, null, 2)}</pre>
        </Box>
      )}
    </Paper>
  );
}

SensorSettingsPanel.propTypes = {
  deviceId: PropTypes.string.isRequired,
};
