

import api from "../../config/api";

export function getTemperatureReadings(params) {
  return api.get("/temperature-readings", { params });
}

export function getAllDevices() {
  return api.get("/devices");
}

export function getSimulatedSensorSettings(params) {
  return api.get(`/get-simulated-sensor-settings`, { params });
}

export function setSimulatedSensorSettings(data) {
  return api.post("/set-simulated-sensor-settings", data);
}
