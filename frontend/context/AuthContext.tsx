"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getWhoAmI, updateProfile } from "@/lib/api/auth";
import { setTokenCookie, storeUserData, clearAuthCookies } from "@/lib/cookies";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: any;
    token: string | null;
    loading: boolean;
    login: (token: string, user: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUserProfile: (data: FormData | any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // Initialize state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (typeof window !== "undefined") {
                    const savedToken = localStorage.getItem("authToken");
                    const savedUser = localStorage.getItem("user");

                    if (savedToken) {
                        setToken(savedToken);
                        if (savedUser) {
                            setUser(JSON.parse(savedUser));
                        }
                        
                        // Verify session against backend to ensure sync
                        try {
                            const whoamiResult = await getWhoAmI();
                            if (whoamiResult?.success && whoamiResult?.data) {
                                setUser(whoamiResult.data);
                                localStorage.setItem("user", JSON.stringify(whoamiResult.data));
                                await storeUserData(whoamiResult.data);
                            }
                        } catch (err) {
                            console.error("Session verification failed, logging out:", err);
                            // Clear stale auth data
                            setToken(null);
                            setUser(null);
                            localStorage.removeItem("authToken");
                            localStorage.removeItem("user");
                            await clearAuthCookies();
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to initialize auth state:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (newToken: string, newUser: any) => {
        setToken(newToken);
        setUser(newUser);
        if (typeof window !== "undefined") {
            localStorage.setItem("authToken", newToken);
            localStorage.setItem("user", JSON.stringify(newUser));
            await setTokenCookie(newToken);
            await storeUserData(newUser);
        }
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            await clearAuthCookies();
        }
        router.push("/login");
    };

    const refreshUser = async () => {
        try {
            const whoamiResult = await getWhoAmI();
            if (whoamiResult?.success && whoamiResult?.data) {
                setUser(whoamiResult.data);
                if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(whoamiResult.data));
                    await storeUserData(whoamiResult.data);
                }
            }
        } catch (error) {
            console.error("Failed to refresh user details:", error);
        }
    };

    const updateUserProfile = async (formData: FormData | any) => {
        try {
            const result = await updateProfile(formData);
            if (result?.success && result?.data) {
                // Update local state with updated user info
                setUser(result.data);
                if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(result.data));
                    await storeUserData(result.data);
                }
            }
            return result;
        } catch (error) {
            console.error("Failed to update profile:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                refreshUser,
                updateUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
