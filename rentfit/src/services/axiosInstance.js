import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Global variables for refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to automatically include JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // List of explicitly public endpoints that don't need a token
    const publicEndpoints = [
      'accounts/login/',
      'accounts/register/',
      'accounts/verify-otp/',
      'accounts/clothing/all/',
      'accounts/token/refresh/',
      'accounts/search/',
      'token/refresh/'
    ];
    
    const isPublic = publicEndpoints.some(endpoint =>
      config.url === endpoint || config.url?.endsWith('/' + endpoint)
    ) || (config.url?.match(/accounts\/clothing\/\d+\/?$/)) || (config.url?.match(/accounts\/stores\/\d+\/?$/));

    // For all other requests, attempt to add the token
    if (!isPublic) {
      const token = localStorage.getItem("access_token");
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

// Response interceptor to handle token refresh with a queue
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken && refreshToken !== "null" && refreshToken !== "undefined") {
        try {
          // Use direct axios call to avoid interceptor loop
          // Trying both common refresh locations
          const refreshUrl = import.meta.env.VITE_API_BASE_URL + "/api/accounts/token/refresh/";
          const response = await axios.post(refreshUrl, { refresh: refreshToken });

          const newAccessToken = response.data.access || response.data.access_token;

          // Update token in localStorage
          localStorage.setItem("access_token", newAccessToken);
          
          // Update headers and retry original request
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.error("Token refresh failed:", refreshError);
          // Clear storage and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.setItem("isLoggedIn", "false");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.setItem("isLoggedIn", "false");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

//  Add this utility function
export const formatPrice = (amount) => {
  if (!amount) return "Rs. 0";
  return `Rs. ${Number(amount).toLocaleString()}`;
};
