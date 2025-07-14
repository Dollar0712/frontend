import { io } from 'socket.io-client';
import config from '../config/index.js';

const socket = io(config.socketUrl);

export const connectToSocket = () => {
  socket.connect();
};

export const onSensorSettingsUpdated = (callback) => {
  socket.on('sensor-settings-updated', (data) => {
    callback(data);
  });
};

export const onSensorConnectionLost = (callback) => {
  socket.on('sensor-connection-lost', (deviceId) => {
    callback(deviceId);
  });
}