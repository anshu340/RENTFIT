import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add this interceptor to automatically include JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // List of explicitly public endpoints that don't need a token
    const publicEndpoints = [
      'accounts/login/',
      'accounts/register/',
      'accounts/verify-otp/',
      'accounts/clothing/all/',
      'accounts/token/refresh/',
      'accounts/search/'
    ];
    const isPublic = publicEndpoints.some(endpoint =>
      config.url === endpoint || config.url?.endsWith('/' + endpoint)
    ) || (config.url?.match(/accounts\/clothing\/\d+\/?$/)) || (config.url?.match(/accounts\/stores\/\d+\/?$/));

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

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken && refreshToken !== "null" && refreshToken !== "undefined") {
        try {
          // Use direct axios call to avoid interceptor loop
          const response = await axios.post(
            import.meta.env.VITE_API_BASE_URL + "/api/accounts/token/refresh/",
            { refresh: refreshToken }
          );

          const newAccessToken = response.data.access;

          // Update both tokens in localStorage
          localStorage.setItem("access_token", newAccessToken);
          localStorage.setItem("authToken", newAccessToken);

          // Update header and retry original request
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Clear storage and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("refresh_token");
          localStorage.setItem("isLoggedIn", "false");
          window.location.href = "/login";
        }
      } else {
        // No refresh token available
        localStorage.removeItem("access_token");
        localStorage.removeItem("authToken");
        localStorage.setItem("isLoggedIn", "false");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;