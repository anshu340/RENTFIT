import axiosInstance from "./axiosInstance";

const chatService = {
    getConversations: () => axiosInstance.get("chat/my/"),
    getMessages: (conversationId) => axiosInstance.get(`chat/${conversationId}/`),
    sendMessage: (conversationId, message) => axiosInstance.post(`chat/${conversationId}/send/`, { message }),
    startConversation: (storeId) => axiosInstance.post(`chat/start/${storeId}/`),
};

export { chatService };
export default axiosInstance;
