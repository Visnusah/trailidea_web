"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/_components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, token, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!token) {
            router.push("/login");
            return;
        }
        if (user?.role !== "admin") {
            router.push("/dashboard");
        }
    }, [user, token, loading, router]);

    if (loading) {
        return (
            <div className="admin-shell-loading">
                <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 40, animation: "spin 1.5s linear infinite", color: "var(--color-primary)" }}
                >
                    progress_activity
                </span>
            </div>
        );
    }

    if (!token || user?.role !== "admin") return null;

    return (
        <div className="admin-shell">
            <AdminSidebar />
            <main className="admin-shell__main">
                {children}
            </main>
        </div>
    );
}
