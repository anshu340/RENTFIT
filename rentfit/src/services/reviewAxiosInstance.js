import axios from "axios";

const reviewAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + "/api/reviews/",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptor to automatically include JWT token
reviewAxiosInstance.interceptors.request.use(
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

export default reviewAxiosInstance;
