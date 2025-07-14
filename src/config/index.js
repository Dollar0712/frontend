
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_URL_PREFIX = import.meta.env.VITE_API_URL_PREFIX || "/api";


const config = {
  apiBaseUrl: BASE_URL + API_URL_PREFIX,
  socketUrl: BASE_URL,
};

export default config;