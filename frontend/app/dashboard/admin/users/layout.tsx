"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminUsersLayout({
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
            // Regular users are silently redirected to their dashboard
            router.push("/dashboard");
        }
    }, [user, token, loading, router]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-primary)",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 48, animation: "spin 1.5s linear infinite" }}
                    >
                        progress_activity
                    </span>
                    <p style={{ fontFamily: "var(--font-family)", fontWeight: 600 }}>
                        Verifying access...
                    </p>
                </div>
            </div>
        );
    }

    // Don't render admin content for non-admins (redirect happens in useEffect)
    if (!token || user?.role !== "admin") return null;

    return <>{children}</>;
}
