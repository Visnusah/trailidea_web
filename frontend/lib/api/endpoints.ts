// lib/api/endpoints.ts
// centralized path definitions for API endpoints
export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
        WHOAMI: "/api/v1/auth/whoami",
        UPDATE: "/api/v1/auth/update",
        REQUEST_PASSWORD_RESET: "/api/v1/auth/request-password-reset",
        RESET_PASSWORD: (token: string): string => `/api/v1/auth/reset-password/${token}`,
    },
    USERS: {
        FOLLOW: (id: string) => `/api/v1/auth/users/${id}/follow`,
        PROFILE: (username: string) => `/api/v1/auth/users/profile/${username}`,
        SAVED_POSTS: "/api/v1/auth/users/me/saved",
    },
    ADMIN: {
        BLOG: {
            GET: "/api/v1/admin/blogs",
            GET_ONE: (id: string) => `/api/v1/admin/blogs/${id}`,
            CREATE: "/api/v1/admin/blogs",
            UPDATE: (id: string): string => `/api/v1/admin/blogs/${id}`,
            DELETE: (id: string): string => `/api/v1/admin/blogs/${id}`,
        },
        USERS: {
            GET: "/api/v1/admin/users",
            GET_ONE: (id: string): string => `/api/v1/admin/users/${id}`,
            CREATE: "/api/v1/admin/users",
            UPDATE: (id: string): string => `/api/v1/admin/users/${id}`,
            DELETE: (id: string): string => `/api/v1/admin/users/${id}`,
        },
    },
    POSTS: {
        CREATE: "/api/v1/posts",
        FEED: "/api/v1/posts",
        VOTE: (id: string): string => `/api/v1/posts/${id}/vote`,
        COMMENTS: (id: string) => `/api/v1/posts/${id}/comments`,
        SAVE: (id: string) => `/api/v1/posts/${id}/save`,
        UPDATE: (id: string): string => `/api/v1/posts/${id}`,
    },
};