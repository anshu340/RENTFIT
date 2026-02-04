import axios from 'axios';

const chatAxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/chat/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Authorization token
chatAxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default chatAxiosInstance;
