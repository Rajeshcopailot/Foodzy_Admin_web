import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000/api/v1',
    // baseURL: 'http://192.168.31.173:4000/api/v1',
    // baseURL: 'https://foodzy-backend-xskg.onrender.com/api/v1',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle different types of 401 errors
            const isLoginRequest = error.config.url.includes('/login');
            const isEmailVerification = error.response.data?.data?.isVerified === false;
            
            if (!isLoginRequest && !isEmailVerification) {
                // Clear token and redirect to login for unauthorized access
                localStorage.removeItem('token');
                localStorage.removeItem('restaurant');
                localStorage.removeItem('restaurantId');
                localStorage.removeItem('restaurantName');
                localStorage.removeItem('restaurantEmail');
                window.location.href = '/login';
            }
            
            // For login and email verification, let the component handle the error
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
