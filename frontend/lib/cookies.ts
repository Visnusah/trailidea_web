"use server";
import { cookies } from "next/headers";
export async function setTokenCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "auth_token",
        value: token,
    })
}
export async function getTokenCookie() {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value;
}
export async function storeUserData(userData: any) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "user_data",
        value: JSON.stringify(userData), // change object into string
    })
}
export async function getUserData() {
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get("user_data")?.value;
    return userDataCookie ? JSON.parse(userDataCookie) : null; // change string into object
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_data");
}