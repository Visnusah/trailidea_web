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