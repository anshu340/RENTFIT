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
    // Don't add token to login, register, or verify-otp endpoints
    const publicEndpoints = ['login/', 'register/', 'verify-otp/'];  // ✅ ADDED verify-otp/
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("access_token");
      if (token) {
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