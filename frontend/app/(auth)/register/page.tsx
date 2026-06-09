"use client";

import { useState } from "react";
import { z } from "zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import TrailideaLogo from "@/frontend/app/_components/ui/TrailideaLogo";
import GoogleIcon from "@/frontend/app/_components/ui/GoogleIcon";

// Password strength 
function getPasswordStrength(password: string): {
  level: number; // 0–4
  label: string;
  barClass: string;
} {
  if (!password) return { level: 0, label: "", barClass: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const clamped = Math.min(score, 4);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const barClasses = [
    "",
    "password-strength__bar--error",
    "password-strength__bar--warn",
    "password-strength__bar--active",
    "password-strength__bar--active",
  ];
  return {
    level: clamped,
    label: labels[clamped],
    barClass: barClasses[clamped],
  };
}

type FieldErrors = Partial<Record<keyof RegisterFormData, string>>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const strength = getPasswordStrength(formData.password);

  // Update text/email fields and clear their error
  const handleChange =
    (field: keyof Omit<RegisterFormData, "terms">) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (fieldErrors[field]) {
          setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      };

  // Update checkbox
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, terms: e.target.checked }));
    if (fieldErrors.terms) {
      setFieldErrors((prev) => ({ ...prev, terms: undefined }));
    }
  };

  // Validate individual field on blur
  const handleBlur =
    (field: keyof Omit<RegisterFormData, "terms">) => () => {
      // For cross-field rules (confirmPassword) we need the full object
      if (field === "confirmPassword") {
        const result = registerSchema.safeParse(formData);
        if (!result.success) {
          const confirmErr = result.error.issues.find(
            (e: z.ZodIssue) => e.path[0] === "confirmPassword"
          );
          if (confirmErr) {
            setFieldErrors((prev) => ({
              ...prev,
              confirmPassword: confirmErr.message,
            }));
          }
        }
        return;
      }

      // For standalone fields use the shape directly
      const fieldSchema =
        registerSchema._def.shape[field as keyof Omit<RegisterFormData, "terms">];
      if (!fieldSchema) return;
      const result = fieldSchema.safeParse(formData[field]);
      if (!result.success) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: result.error.issues[0].message,
        }));
      }
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Full schema validation
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as keyof RegisterFormData;
        if (!errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    // Simulate network delay — wire up real API here
    await new Promise((res) => setTimeout(res, 800));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="auth-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="auth-card animate-fade-in-up" style={{ textAlign: "center", padding: "48px 40px", maxWidth: 420 }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "56px",
              color: "var(--color-primary)",
              fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            check_circle
          </span>
          <h2 style={{ marginTop: "16px", marginBottom: "8px", fontSize: "22px", fontWeight: 700 }}>
            Account Created!
          </h2>
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            Welcome to Trailidea, {formData.fullName.split(" ")[0]}. Your adventure starts now.
          </p>
          <Link href="/login" className="btn btn--primary" style={{ display: "inline-flex" }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root auth-page--register">
      {/* Left: Form column */}
      <div className="auth-register-form-col">
        <div style={{ maxWidth: 520, width: "100%" }}>
          {/* Brand */}
          <div className="form-header__brand">
            <Link href="/" aria-label="Trailidea home">
              <TrailideaLogo size="md" />
            </Link>
          </div>

          {/* Heading */}
          <div className="form-header animate-fade-in-up">
            <h1 className="form-header__title">Join the adventure.</h1>
            <p className="form-header__subtitle">
              Create your explorer account to start tracking trails and sharing
              discoveries.
            </p>
          </div>

          {/*   Registration Form   */}
          <form
            className="form animate-fade-in-up animate-delay-100"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Create account form"
          >
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-fullname">
                Full Name
              </label>
              <div className="form-input-wrapper">
                <span
                  className="material-symbols-outlined form-input-icon"
                  aria-hidden="true"
                >
                  person
                </span>
                <input
                  id="reg-fullname"
                  type="text"
                  className={`form-input${fieldErrors.fullName ? " form-input--error" : ""}`}
                  placeholder="Alex Rivers"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  aria-describedby={fieldErrors.fullName ? "reg-fullname-error" : undefined}
                  aria-invalid={!!fieldErrors.fullName}
                  required
                />
              </div>
              {fieldErrors.fullName && (
                <p id="reg-fullname-error" className="form-field-error" role="alert">
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">error</span>
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Username + Email grid */}
            <div className="form-group-grid form-group-grid--2col">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-username">
                  Username
                </label>
                <div className="form-input-wrapper">
                  <span
                    className="material-symbols-outlined form-input-icon"
                    aria-hidden="true"
                  >
                    alternate_email
                  </span>
                  <input
                    id="reg-username"
                    type="text"
                    className={`form-input${fieldErrors.username ? " form-input--error" : ""}`}
                    placeholder="trailblazer_99"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange("username")}
                    onBlur={handleBlur("username")}
                    aria-describedby={fieldErrors.username ? "reg-username-error" : undefined}
                    aria-invalid={!!fieldErrors.username}
                    required
                  />
                </div>
                {fieldErrors.username && (
                  <p id="reg-username-error" className="form-field-error" role="alert">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">error</span>
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
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
                    id="reg-email"
                    type="email"
                    className={`form-input${fieldErrors.email ? " form-input--error" : ""}`}
                    placeholder="alex@trailidea.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    onBlur={handleBlur("email")}
                    aria-describedby={fieldErrors.email ? "reg-email-error" : undefined}
                    aria-invalid={!!fieldErrors.email}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p id="reg-email-error" className="form-field-error" role="alert">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">error</span>
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
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
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input form-input--with-action${fieldErrors.password ? " form-input--error" : ""}`}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  aria-describedby={[
                    "password-strength-label",
                    fieldErrors.password ? "reg-password-error" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-invalid={!!fieldErrors.password}
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowPassword((p) => !p)}
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

              {/* Strength indicator */}
              {formData.password.length > 0 && (
                <div className="password-strength" aria-live="polite">
                  <div className="password-strength__bars" role="presentation">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`password-strength__bar ${bar <= strength.level ? strength.barClass : ""
                          }`}
                      />
                    ))}
                  </div>
                  <div
                    className="password-strength__label text-label-sm"
                    id="password-strength-label"
                  >
                    {strength.level >= 3 && (
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "14px",
                          color: "var(--color-primary)",
                          fontVariationSettings:
                            "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                        }}
                        aria-hidden="true"
                      >
                        check_circle
                      </span>
                    )}
                    <span>{strength.label} password</span>
                  </div>
                </div>
              )}

              {fieldErrors.password && (
                <p id="reg-password-error" className="form-field-error" role="alert">
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">error</span>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">
                Confirm Password
              </label>
              <div className="form-input-wrapper">
                <span
                  className="material-symbols-outlined form-input-icon"
                  aria-hidden="true"
                >
                  lock_reset
                </span>
                <input
                  id="reg-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  className={`form-input form-input--with-action${fieldErrors.confirmPassword ? " form-input--error" : ""}`}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  aria-describedby={fieldErrors.confirmPassword ? "reg-confirm-error" : undefined}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={
                    showConfirm ? "Hide confirm password" : "Show confirm password"
                  }
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    {showConfirm ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p id="reg-confirm-error" className="form-field-error" role="alert">
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">error</span>
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="terms-group">
              <input
                id="reg-terms"
                type="checkbox"
                className="terms-group__checkbox"
                checked={formData.terms}
                onChange={handleTermsChange}
                aria-describedby={fieldErrors.terms ? "reg-terms-error" : undefined}
                aria-invalid={!!fieldErrors.terms}
                required
              />
              <label className="terms-group__label" htmlFor="reg-terms">
                I agree to the{" "}
                <Link href="#">Terms of Service</Link> and{" "}
                <Link href="#">Privacy Policy</Link>.
              </label>
            </div>
            {fieldErrors.terms && (
              <p id="reg-terms-error" className="form-field-error" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">error</span>
                {fieldErrors.terms}
              </p>
            )}

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
                    style={{ fontSize: "18px", animation: "spin 1s linear infinite" }}
                    aria-hidden="true"
                  >
                    progress_activity
                  </span>
                  Creating Account…
                </>
              ) : (
                <>
                  Create Account
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span className="divider__text">or sign up with</span>
            </div>

            {/* Social */}
            <div className="social-row">
              <button
                type="button"
                className="btn btn--social"
                aria-label="Sign up with Google"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="btn btn--social"
                aria-label="Sign up with Facebook"
              >
                {/* Facebook icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                  style={{ color: "#1877F2" }}
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* Nav link */}
            <p className="auth-nav-text">
              Already have an account?{" "}
              <Link href="/login">Log in here</Link>
            </p>
          </form>

          {/* Inline footer */}
          <div className="auth-footer--register-inline">
            <p className="auth-footer__copy">
              © 2024 Trailidea. Explore responsibly.
            </p>
            <nav className="auth-footer__links" aria-label="Footer links">
              <Link href="#" className="">
                Privacy
              </Link>
              <Link href="#" className="">
                Terms
              </Link>
              <Link href="#" className="">
                Safety
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/*   Right: Hero panel (desktop only)   */}
      <div
        className="auth-register-hero-col"
        aria-hidden="true"
        role="presentation"
      >
        <div className="hero-panel">
          <Image
            src="/images/trail-hero.jpg"
            alt=""
            fill
            className="hero-panel__img"
            style={{ objectFit: "cover" }}
            priority
            sizes="50vw"
          />
          <div className="hero-panel__gradient" />

          <div className="hero-panel__content">
            {/* Testimonial */}
            <div className="testimonial-card">
              <div className="testimonial-card__stars" aria-label="5 stars">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "22px",
                      fontVariationSettings:
                        "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                    }}
                  >
                    star
                  </span>
                ))}
              </div>
              <blockquote className="testimonial-card__quote">
                &ldquo;Trailidea transformed how I plan my expeditions. The
                community insights are unparalleled, and the interface feels as
                natural as the trails themselves.&rdquo;
              </blockquote>
              <div className="testimonial-card__author">
                <Image
                  src="/images/person.png"
                  alt="kamlesh sah, CEO of trailidea"
                  width={52}
                  height={52}
                  className="testimonial-card__avatar"
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                  unoptimized
                />
                <div>
                  <p className="testimonial-card__name">Kamlesh sah</p>
                  <p className="testimonial-card__role">
                    CEO of Trailidea
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
              <div className="stat-item">
                <p className="stat-item__value">12k+</p>
                <p className="stat-item__label">Verified Trails</p>
              </div>
              <div className="stat-item">
                <p className="stat-item__value">85k</p>
                <p className="stat-item__label">Active Explorers</p>
              </div>
              <div className="stat-item">
                <p className="stat-item__value">140</p>
                <p className="stat-item__label">Countries Covered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
