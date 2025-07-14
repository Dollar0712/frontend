import axios from "axios";
import config from "./index";

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
});

export default api;