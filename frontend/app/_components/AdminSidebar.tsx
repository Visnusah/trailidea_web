"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const navItems = [
    { href: "/admin", label: "Overview", icon: "space_dashboard", exact: true },
    { href: "/admin/analytics", label: "Analytics", icon: "insights" },
    { href: "/admin/users", label: "Users", icon: "people_outline" },
    { href: "/admin/posts", label: "Posts", icon: "feed" },
    { href: "/admin/moderation", label: "Moderation", icon: "policy" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <aside className="admin-sidebar">
            {/* Brand */}
            <div className="admin-sidebar__brand">
                <div className="admin-sidebar__brand-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff" }}>
                        hiking
                    </span>
                </div>
                <div className="admin-sidebar__brand-text">
                    <span className="admin-sidebar__brand-name">Trailidea Admin</span>
                    <span className="admin-sidebar__brand-sub">Management Console</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="admin-sidebar__nav">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-sidebar__nav-item ${isActive(item.href, item.exact) ? "admin-sidebar__nav-item--active" : ""}`}
                    >
                        <span className="material-symbols-outlined admin-sidebar__nav-icon">
                            {item.icon}
                        </span>
                        <span className="admin-sidebar__nav-label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom */}
            <div className="admin-sidebar__bottom">
                <div className="admin-sidebar__status">
                    <span className="admin-sidebar__status-dot" />
                    System Status: Online
                </div>
                <Link href="/admin/settings" className="admin-sidebar__bottom-item">
                    <span className="material-symbols-outlined admin-sidebar__nav-icon">settings</span>
                    <span className="admin-sidebar__nav-label">Settings</span>
                </Link>
                <button
                    className="admin-sidebar__bottom-item admin-sidebar__bottom-item--btn"
                    onClick={logout}
                >
                    <span className="material-symbols-outlined admin-sidebar__nav-icon">logout</span>
                    <span className="admin-sidebar__nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}
