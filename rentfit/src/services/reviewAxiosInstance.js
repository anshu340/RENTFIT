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

export const reviewService = {
    getMyReviews: async () => {
        try {
            const response = await reviewAxiosInstance.get("my/");
            return response.data;
        } catch (error) {
            console.error("Error fetching my reviews:", error);
            throw error;
        }
    },

    deleteReview: async (reviewId) => {
        try {
            const response = await reviewAxiosInstance.delete(`${reviewId}/`);
            return response.data;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    },

    updateReview: async (reviewId, data) => {
        try {
            const response = await reviewAxiosInstance.patch(`${reviewId}/`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    }
};

export default reviewAxiosInstance;
