import axiosInstance from "./axiosInstance";

export const reviewService = {
    getMyReviews: async () => {
        const response = await axiosInstance.get("reviews/my/");
        return response.data;
    },
    deleteReview: async (id) => {
        const response = await axiosInstance.delete(`reviews/${id}/`);
        return response.data;
    }
};
