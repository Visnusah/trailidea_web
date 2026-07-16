"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const getAvatarUrl = () => {
    if (user?.imageUrl) return user.imageUrl;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || "explorer"}`;
  };

  const navLinks = [
    { href: "/dashboard", label: "Feed", icon: "dynamic_feed", exact: true },
    { href: "/dashboard/map", label: "Map", icon: "map", exact: false },
    { href: "/dashboard/post", label: "Post", icon: "add_circle", exact: false },
    { href: "/dashboard/profile", label: "Profile", icon: "person", exact: false },
  ];

  const isActive = (link: { href: string; exact?: boolean }) => {
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  };

  return (
    <header className="dash-navbar">
      <div className="dash-navbar__inner">
        {/* Brand */}
        <Link href="/dashboard" className="dash-navbar__brand">
          Trailidea
        </Link>

        {/* Nav Links */}
        <nav className="dash-navbar__links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`dash-navbar__link ${isActive(link) ? "dash-navbar__link--active" : ""}`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="dash-navbar__actions">
          {user?.role === "admin" && (
            <Link
              href="/admin/users"
              className="dash-navbar__admin-link"
              title="Admin Panel"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                shield
              </span>
              Admin
            </Link>
          )}

          <Link href="/dashboard/profile">
            <img
              src={getAvatarUrl()}
              alt={user?.username || "User"}
              className="dash-navbar__avatar"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
