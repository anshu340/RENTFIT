import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/accounts/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add this interceptor to automatically include JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // List of explicitly public endpoints that don't need a token
    const publicEndpoints = ['login/', 'register/', 'verify-otp/', 'clothing/all/'];
    const isPublic = publicEndpoints.some(endpoint =>
      config.url === endpoint || config.url?.endsWith('/' + endpoint)
    ) || (config.url?.match(/clothing\/\d+\/?$/));

    // For all other requests, attempt to add the token
    if (!isPublic) {
      const token = localStorage.getItem("access_token") || localStorage.getItem("authToken");
      // Careful check for both null value and "null" string
      if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;