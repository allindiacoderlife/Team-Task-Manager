import axios from "axios";

// Environment variable for API URL or default
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Assuming auth stores token here
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor (handle errors like 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — clear auth and redirect to login
      localStorage.removeItem("token");
      sessionStorage.removeItem("pendingEmail");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
