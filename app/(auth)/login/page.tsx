"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleIcon from "@/app/components/ui/GoogleIcon";

// ── Demo credentials 
const DEMO_EMAIL = "demo@trailidea.com";
const DEMO_PASSWORD = "trail2026";

// NOTE: metadata must be in a server component or layout.
// I export it here for reference only — the actual metadata
// lives in the /login/metadata.ts file.

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate a brief network delay for realism
    await new Promise((res) => setTimeout(res, 600));

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      router.push("/dashboard");
    } else {
      setError("Incorrect email or password. Use the demo credentials : demo@trailidea.com / trail2026.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Ambient background blobs */}
      <div className="auth-blob-top" aria-hidden="true" />
      <div className="auth-blob-bottom" aria-hidden="true" />

      <main className="auth-login-main" id="main-content">
        <div className="auth-login-inner animate-fade-in-up">
          {/* ── Brand anchor ── */}
          <div className="brand-center">
            <h1 className="brand-center__name">Trailidea</h1>
            <p className="brand-center__tagline">
              Welcome back to the wild.
            </p>
          </div>

          {/* ── Login Card ── */}
          <div className="auth-card animate-fade-in-up animate-delay-100">
            <form
              className="form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Sign in form"
            >
              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  style={{
                    background: "var(--color-error-container)",
                    color: "var(--color-on-error-container)",
                    borderRadius: "var(--radius-default)",
                    padding: "10px 14px",
                    fontSize: "14px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px", flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    error
                  </span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email Address
                </label>
                <div className="form-input-wrapper">
                  <span
                    className="material-symbols-outlined form-input-icon"
                    aria-hidden="true"
                  >
                    mail
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="explorer@trailidea.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <div className="form-input-wrapper">
                  <span
                    className="material-symbols-outlined form-input-icon"
                    aria-hidden="true"
                  >
                    lock
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input form-input--with-action"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="form-input-action"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "20px" }}
                    >
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Helpers */}
              <div className="form-helpers">
                <label className="checkbox-label" htmlFor="login-remember">
                  <input
                    id="login-remember"
                    type="checkbox"
                    className="checkbox-label__input"
                  />
                  <span className="checkbox-label__text">Remember Me</span>
                </label>
                <Link href="#" className="text-link">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
                style={{ opacity: loading ? 0.75 : 1, cursor: loading ? "wait" : "pointer" }}
              >
                {loading ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "18px",
                        animation: "spin 1s linear infinite",
                      }}
                      aria-hidden="true"
                    >
                      progress_activity
                    </span>
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider" style={{ margin: "24px 0" }}>
              <span className="divider__text">or continue with</span>
            </div>

            {/* Social logins */}
            <div className="social-row">
              <button
                type="button"
                className="btn btn--social"
                aria-label="Continue with Google"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="btn btn--social"
                aria-label="Continue with Apple"
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "20px",
                    fontVariationSettings:
                      "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                  aria-hidden="true"
                >
                  ios
                </span>
                <span>Apple</span>
              </button>
            </div>

            {/* Nav link */}
            <p className="auth-nav-text">
              New to Trailidea?{" "}
              <Link href="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        <div className="auth-footer__inner">
          <p className="auth-footer__copy">
            © 2024 Trailidea. Explore responsibly.
          </p>
          <nav className="auth-footer__links" aria-label="Footer navigation">
            <Link href="#" className="auth-footer__link">
              Privacy Policy
            </Link>
            <Link href="#" className="auth-footer__link">
              Terms of Service
            </Link>
            <Link href="#" className="auth-footer__link">
              Safety Guides
            </Link>
            <Link href="#" className="auth-footer__link">
              Contact Us
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
