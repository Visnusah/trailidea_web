"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import GoogleIcon from "@/app/_components/ui/GoogleIcon";
import { useAuth } from "@/app/context/AuthContext";

//Demo credentials
const DEMO_EMAIL = "demo@trailidea.com";
const DEMO_PASSWORD = "trail2026";

// NOTE: metadata must be in a server component or layout.
// I export it here for reference only — the actual metadata
// lives in the /login/metadata.ts file.

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  // Field-level Zod errors
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  // Server / submit-level error
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update a single field and clear its error
  const handleChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      if (serverError) setServerError("");
    };

  // Validate a single field on blur for instant feedback
  const handleBlur = (field: keyof LoginFormData) => () => {
    const result = loginSchema.shape[field].safeParse(formData[field]);
    if (!result.success) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0].message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

    // Full schema validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as keyof LoginFormData;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Call actual API
      const response = await fetch("https://trailidea-web.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.message.includes("verify your email")) {
          router.push(`/verify-otp?email=${encodeURIComponent(result.data.email)}`);
          return;
        }
        setServerError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Store token and user in AuthContext
      await login(data.data.token, data.data.user);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      setServerError(error.message || "An error occurred. Please try again.");
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
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 className="brand-center__name">Trailidea</h1>
            </Link>
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
              {/* Server error banner */}
              {serverError && (
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
                  {serverError}
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
                    className={`form-input${fieldErrors.email ? " form-input--error" : ""}`}
                    placeholder="explorer@trailidea.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    onBlur={handleBlur("email")}
                    aria-describedby={
                      fieldErrors.email ? "login-email-error" : undefined
                    }
                    aria-invalid={!!fieldErrors.email}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p
                    id="login-email-error"
                    className="form-field-error"
                    role="alert"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                      aria-hidden="true"
                    >
                      error
                    </span>
                    {fieldErrors.email}
                  </p>
                )}
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
                    className={`form-input form-input--with-action${fieldErrors.password ? " form-input--error" : ""}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    onBlur={handleBlur("password")}
                    aria-describedby={
                      fieldErrors.password ? "login-password-error" : undefined
                    }
                    aria-invalid={!!fieldErrors.password}
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
                {fieldErrors.password && (
                  <p
                    id="login-password-error"
                    className="form-field-error"
                    role="alert"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                      aria-hidden="true"
                    >
                      error
                    </span>
                    {fieldErrors.password}
                  </p>
                )}
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
                <Link href="/forget-password" className="text-link">
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
