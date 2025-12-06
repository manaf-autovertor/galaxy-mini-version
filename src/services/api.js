import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Use environment variable for API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://los_galaxy.test";
// const API_BASE_URL = "https://los_galaxy.test";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, // Important for session-based auth with cookies
});

// Request interceptor to add auth token (if using token-based auth as fallback)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
