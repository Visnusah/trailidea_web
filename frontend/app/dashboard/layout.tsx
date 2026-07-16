"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/app/_components/DashboardNavbar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-background)",
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
            Loading Trailidea...
          </p>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="dash-layout">
      <DashboardNavbar />
      <main className="dash-main">{children}</main>

      {/* Dashboard Footer */}
      <footer className="dash-footer">
        <div className="dash-footer__inner">
          <div className="dash-footer__brand">
            <h3>Trailidea</h3>
            <p>
              © {new Date().getFullYear()} Trailidea. Explore responsibly. Built
              for the modern explorer seeking serenity and adventure.
            </p>
          </div>
          <div className="dash-footer__section">
            <h4>Community</h4>
            <Link href="#">Safety Guides</Link>
            <Link href="#">Contact Us</Link>
          </div>
          <div className="dash-footer__section">
            <h4>Legal</h4>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
