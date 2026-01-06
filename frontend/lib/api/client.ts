import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.detail || error.message;
      console.error("API Error:", message);
      return Promise.reject(new Error(message));
    } else if (error.request) {
      console.error("Network Error:", error.message);
      return Promise.reject(
        new Error("Network error. Please check your connection."),
      );
    } else {
      console.error("Error:", error.message);
      return Promise.reject(error);
    }
  },
);
