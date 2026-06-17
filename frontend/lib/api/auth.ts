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