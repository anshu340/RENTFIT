import axios from "axios";

const rentalAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/rentals/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to automatically include JWT token
rentalAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default rentalAxiosInstance;