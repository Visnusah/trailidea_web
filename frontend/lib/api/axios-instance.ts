import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== "undefined" ? "" : "https://trailidea-web.onrender.com");

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT token from localStorage to headers if it exists
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("authToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;