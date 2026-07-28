import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const register = async (data: any) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.REGISTER, data); // path, data
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Registration failed');
        // error?.response?.data -> response ko body
    }
}

export const login = async (data: any) => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.LOGIN, data); // path, data
        return response.data; // reponse ko body
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message
            || 'Login failed');
    }
}

export const getWhoAmI = async () => {
    try {
        const response = await axiosInstance.get(API.AUTH.WHOAMI);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch user info');
    }
}

export const updateProfile = async (data: any) => {
    try {
        const response = await axiosInstance.put(API.AUTH.UPDATE, data, {
            headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Profile update failed');
    }
}


export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axiosInstance.post("/api/v1/auth/request-password-reset", { email });
        return response.data;
    } catch (error: Error | any) {
        console.error("requestPasswordReset error:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || error.message || 'Request password reset failed');
    }
}

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await axiosInstance.post(`/api/v1/auth/reset-password/${token}`, { newPassword });
        return response.data;
    } catch (error: Error | any) {
        console.error("resetPassword error:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || error.message || 'Reset password failed');
    }
}

export const verifyOTP = async (email: string, otpCode: string) => {
    try {
        const response = await axiosInstance.post(`/api/v1/auth/verify-otp`, { email, otpCode });
        return response.data;
    } catch (error: Error | any) {
        console.error("verifyOTP error:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || error.message || 'Verification failed');
    }
}

export const resendOTP = async (email: string) => {
    try {
        const response = await axiosInstance.post(`/api/v1/auth/resend-otp`, { email });
        return response.data;
    } catch (error: Error | any) {
        console.error("resendOTP error:", error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || error.message || 'Failed to resend OTP');
    }
}