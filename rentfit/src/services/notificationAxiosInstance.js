import axios from "axios";

const notificationAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + "/api/notifications/",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptor to automatically include JWT token
notificationAxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token") || localStorage.getItem("authToken");
        if (token && token !== "null" && token !== "undefined") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default notificationAxiosInstance;
