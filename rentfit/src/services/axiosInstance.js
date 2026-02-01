// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL + "/api/accounts/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add this interceptor to automatically include JWT token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Don't add token to login, register, or verify-otp endpoints
//     const publicEndpoints = ['login/', 'register/', 'verify-otp/', 'clothing/all/'];
//     const isPublicEndpoint = publicEndpoints.some(endpoint =>
//       config.url?.includes(endpoint)
//     ) || (config.url?.match(/clothing\/\d+\/?$/)); // Match clothing/<id>/ but not clothing/my/

//     if (!isPublicEndpoint) {
//       const token = localStorage.getItem("access_token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

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
    // Simplified: Always add the token if it exists in localStorage.
    // Guests won't have a token, so their requests will correctly be unauthenticated.
    // Logged-in users will correctly send their token for all requests.
    const token = localStorage.getItem("access_token") || localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;