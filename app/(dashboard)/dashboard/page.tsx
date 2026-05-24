import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard Trailidea",
  description: "Your Trailidea explorer dashboard.",
};

export default function DashboardPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
        padding: "24px",
        gap: "24px",
      }}
    >
      {/* Main heading */}
      <h1
        style={{
          fontFamily: "var(--font-family)",
          fontSize: "clamp(32px, 6vw, 56px)",
          fontWeight: 800,
          color: "var(--color-primary)",
          letterSpacing: "-0.02em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Hello from Dashboard
        <br />
        <span
          style={{
            color: "var(--color-secondary)",
            fontWeight: 700,
            fontSize: "0.65em",
          }}
        >
          Trailidea
        </span>
      </h1>

      {/* Back to login */}
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--color-primary)",
          fontFamily: "var(--font-family)",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
          padding: "10px 20px",
          border: "1.5px solid var(--color-outline-variant)",
          borderRadius: "var(--radius-full)",
          transition: "background 0.2s ease",
        }}
      >
        ← Back to Login
      </Link>
    </div>
  );
}