"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const getAvatarUrl = () => {
    if (user?.imageUrl) return user.imageUrl;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || "explorer"}`;
  };

  const navLinks = [
    { href: "/dashboard", label: "Discover" },
    { href: "/dashboard", label: "Feed", exact: true },
    { href: "#", label: "Community" },
    { href: "#", label: "About" },
  ];

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
              className={`dash-navbar__link ${
                link.exact
                  ? pathname === link.href
                    ? "dash-navbar__link--active"
                    : ""
                  : pathname.startsWith(link.href) && link.href !== "/dashboard"
                  ? "dash-navbar__link--active"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="dash-navbar__search">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>
            search
          </span>
          <input type="text" placeholder="Search trails..." />
        </div>

        {/* Actions */}
        <div className="dash-navbar__actions">
          <button className="dash-navbar__icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
          </button>

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

          <Link href="#" className="dash-navbar__cta">
            Start Trail
          </Link>
        </div>
      </div>
    </header>
  );
}
