"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { user, token, loading, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  
  // Password form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  const [imgLoading, setImgLoading] = useState(false);
  const [imgSuccess, setImgSuccess] = useState("");
  const [imgError, setImgError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
        color: "var(--color-primary)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "48px", animation: "spin 1.5s linear infinite" }}>
            progress_activity
          </span>
          <p style={{ fontFamily: "var(--font-family)", fontWeight: 600 }}>Loading Explorer Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Handle Profile Picture Upload
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImgError("Please upload an image file");
      return;
    }

    setImgLoading(true);
    setImgError("");
    setImgSuccess("");

    try {
      const formData = new FormData();
      formData.append("profile_pic", file);

      await updateUserProfile(formData);
      setImgSuccess("Profile picture updated successfully!");
    } catch (err: any) {
      setImgError(err.message || "Failed to upload image");
    } finally {
      setImgLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!password) {
      setPwdError("New password is required");
      return;
    }

    if (password.length < 6) {
      setPwdError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setPwdError("Passwords do not match");
      return;
    }

    setPwdLoading(true);

    try {
      await updateUserProfile({ password });
      setPwdSuccess("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdError(err.message || "Failed to update password");
    } finally {
      setPwdLoading(false);
    }
  };

  // Profile Image URL Helper
  const getAvatarUrl = () => {
    if (user.imageUrl) {
      // Backend returns '/uploads/filename'. Next.js rewrites it to backend via proxy rewrite.
      return user.imageUrl;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username || "explorer"}`;
  };

  return (
    <div className="auth-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Background Blobs */}
      <div className="auth-blob-top" aria-hidden="true" />
      <div className="auth-blob-bottom" aria-hidden="true" />

      {/* Navbar */}
      <nav style={{
        width: "100%",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--color-outline-variant)",
        zIndex: 10,
        background: "rgba(var(--color-background-rgb), 0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h2 style={{ fontFamily: "var(--font-family)", fontWeight: 800, color: "var(--color-primary)", margin: 0 }}>
            Trailidea
          </h2>
          <span style={{
            fontSize: "12px",
            fontWeight: 700,
            background: "var(--color-primary-container)",
            color: "var(--color-on-primary-container)",
            padding: "2px 8px",
            borderRadius: "var(--radius-full)"
          }}>
            Dashboard
          </span>
        </div>

        <button 
          onClick={logout}
          className="btn"
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            border: "1.5px solid var(--color-error)",
            color: "var(--color-error)",
            fontWeight: 600,
            cursor: "pointer",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
          Sign Out
        </button>
      </nav>

      {/* Main Grid */}
      <main style={{
        flex: 1,
        width: "100%",
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "0 24px 80px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "32px",
        zIndex: 5
      }}>
        {/* Left Column: Explorer Info */}
        <section className="auth-card animate-fade-in-up" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          padding: "40px 24px",
          height: "fit-content"
        }}>
          <h3 style={{ fontFamily: "var(--font-family)", fontWeight: 800, color: "var(--color-primary)", width: "100%", textAlign: "left", margin: 0 }}>
            Explorer Profile
          </h3>

          {/* Profile Picture */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid var(--color-primary-container)",
              boxShadow: "var(--shadow-elevation-medium)",
              background: "var(--color-surface-container-low)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img 
                src={getAvatarUrl()} 
                alt={`${user.username}'s avatar`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            
            {/* Upload Badge */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={imgLoading}
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: imgLoading ? "wait" : "pointer",
                boxShadow: "var(--shadow-elevation-small)"
              }}
              aria-label="Upload profile picture"
            >
              {imgLoading ? (
                <span className="material-symbols-outlined" style={{ fontSize: "20px", animation: "spin 1s linear infinite" }}>
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>photo_camera</span>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleProfilePicChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />
          </div>

          {/* Status Banners */}
          {imgSuccess && (
            <div role="alert" style={{ background: "var(--color-success-container)", color: "var(--color-on-success-container)", borderRadius: "var(--radius-default)", padding: "8px 12px", fontSize: "14px", fontWeight: 500, width: "100%" }}>
              {imgSuccess}
            </div>
          )}
          {imgError && (
            <div role="alert" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)", borderRadius: "var(--radius-default)", padding: "8px 12px", fontSize: "14px", fontWeight: 500, width: "100%" }}>
              {imgError}
            </div>
          )}

          {/* Profile Details */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--color-outline-variant)", paddingBottom: "8px" }}>
              <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>Username</span>
              <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>@{user.username}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--color-outline-variant)", paddingBottom: "8px" }}>
              <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>Name</span>
              <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{user.firstName} {user.lastName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--color-outline-variant)", paddingBottom: "8px" }}>
              <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>Email</span>
              <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{user.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid var(--color-outline-variant)", paddingBottom: "8px" }}>
              <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>Role</span>
              <span style={{ 
                fontWeight: 700, 
                textTransform: "capitalize",
                color: user.role === "admin" ? "var(--color-tertiary)" : "var(--color-primary)" 
              }}>{user.role}</span>
            </div>
          </div>
        </section>

        {/* Right Column: Update Password Form */}
        <section className="auth-card animate-fade-in-up animate-delay-100" style={{ padding: "40px 24px" }}>
          <h3 style={{ fontFamily: "var(--font-family)", fontWeight: 800, color: "var(--color-primary)", margin: "0 0 8px 0" }}>
            Change Password
          </h3>
          <p style={{ color: "var(--color-secondary)", fontSize: "14px", margin: "0 0 24px 0" }}>
            Update your account password to ensure your profile stays secure.
          </p>

          <form onSubmit={handlePasswordSubmit} className="form" noValidate>
            {/* Status Banners */}
            {pwdSuccess && (
              <div role="alert" style={{ background: "var(--color-success-container)", color: "var(--color-on-success-container)", borderRadius: "var(--radius-default)", padding: "10px 14px", fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
                {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div role="alert" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)", borderRadius: "var(--radius-default)", padding: "10px 14px", fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>error</span>
                {pwdError}
              </div>
            )}

            {/* New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">New Password</label>
              <div className="form-input-wrapper">
                <span className="material-symbols-outlined form-input-icon">lock</span>
                <input 
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input form-input--with-action"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
              <div className="form-input-wrapper">
                <span className="material-symbols-outlined form-input-icon">lock_reset</span>
                <input 
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input form-input--with-action"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn--primary"
              disabled={pwdLoading}
              style={{ opacity: pwdLoading ? 0.75 : 1, cursor: pwdLoading ? "wait" : "pointer", marginTop: "12px" }}
            >
              {pwdLoading ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", animation: "spin 1s linear infinite" }}>
                    progress_activity
                  </span>
                  Updating Password…
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}