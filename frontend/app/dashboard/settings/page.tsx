"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  const [imgLoading, setImgLoading] = useState(false);
  const [imgSuccess, setImgSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const getAvatarUrl = () => {
    if (user?.imageUrl) return user.imageUrl;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || "explorer"}`;
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setImgLoading(true);
    setImgSuccess("");
    try {
      const formData = new FormData();
      formData.append("profile_pic", file);
      await updateUserProfile(formData);
      setImgSuccess("Profile picture updated!");
    } catch (err: any) {
      console.error(err);
    } finally {
      setImgLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle profile details update
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      setProfileError("All fields are required");
      return;
    }

    setProfileLoading(true);
    try {
      await updateUserProfile({ firstName, lastName, username, email });
      setProfileSuccess("Profile updated successfully!");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password update
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

  return (
    <div className="settings-page">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Link
          href="/dashboard/profile"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid var(--color-outline-variant)",
            color: "var(--color-on-surface-variant)",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </Link>
        <h2>Settings</h2>
      </div>
      <p>Manage your profile details, avatar, and account security.</p>

      {/* ═══ Profile Picture Section ═══ */}
      <div className="settings-section">
        <h3>Profile Picture</h3>
        <p>Upload a new avatar for your explorer profile.</p>

        <div className="settings-avatar-row">
          <img src={getAvatarUrl()} alt="Avatar" className="settings-avatar" />
          <div className="settings-avatar-actions">
            <label>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                upload
              </span>
              {imgLoading ? "Uploading..." : "Choose Photo"}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </label>
            <span>JPG, PNG, WEBP up to 5MB</span>
          </div>
        </div>

        {imgSuccess && (
          <div
            role="alert"
            style={{
              background: "var(--color-success-container)",
              color: "var(--color-on-success-container)",
              borderRadius: "var(--radius-default)",
              padding: "8px 12px",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            {imgSuccess}
          </div>
        )}
      </div>

      {/* ═══ Profile Details Section ═══ */}
      <div className="settings-section">
        <h3>Profile Details</h3>
        <p>Update your personal information.</p>

        {profileSuccess && (
          <div
            role="alert"
            style={{
              background: "var(--color-success-container)",
              color: "var(--color-on-success-container)",
              borderRadius: "var(--radius-default)",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div
            role="alert"
            style={{
              background: "var(--color-error-container)",
              color: "var(--color-on-error-container)",
              borderRadius: "var(--radius-default)",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="form" noValidate>
          <div className="settings-form-grid">
            {/* First Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="settings-firstName">
                First Name
              </label>
              <div className="form-input-wrapper">
                <span className="material-symbols-outlined form-input-icon">person</span>
                <input
                  id="settings-firstName"
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="settings-lastName">
                Last Name
              </label>
              <div className="form-input-wrapper">
                <span className="material-symbols-outlined form-input-icon">person</span>
                <input
                  id="settings-lastName"
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="settings-username">
              Username
            </label>
            <div className="form-input-wrapper">
              <span className="material-symbols-outlined form-input-icon">alternate_email</span>
              <input
                id="settings-username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="settings-email">
              Email Address
            </label>
            <div className="form-input-wrapper">
              <span className="material-symbols-outlined form-input-icon">mail</span>
              <input
                id="settings-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={profileLoading}
            style={{
              opacity: profileLoading ? 0.75 : 1,
              cursor: profileLoading ? "wait" : "pointer",
            }}
          >
            {profileLoading ? (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, animation: "spin 1s linear infinite" }}
                >
                  progress_activity
                </span>
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>

      {/* ═══ Change Password Section ═══ */}
      <div className="settings-section">
        <h3>Change Password</h3>
        <p>Update your account password to keep your profile secure.</p>

        {pwdSuccess && (
          <div
            role="alert"
            style={{
              background: "var(--color-success-container)",
              color: "var(--color-on-success-container)",
              borderRadius: "var(--radius-default)",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            {pwdSuccess}
          </div>
        )}
        {pwdError && (
          <div
            role="alert"
            style={{
              background: "var(--color-error-container)",
              color: "var(--color-on-error-container)",
              borderRadius: "var(--radius-default)",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {pwdError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="form" noValidate>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="settings-password">
              New Password
            </label>
            <div className="form-input-wrapper">
              <span className="material-symbols-outlined form-input-icon">lock</span>
              <input
                id="settings-password"
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
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="settings-confirmPassword">
              Confirm Password
            </label>
            <div className="form-input-wrapper">
              <span className="material-symbols-outlined form-input-icon">lock_reset</span>
              <input
                id="settings-confirmPassword"
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
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={pwdLoading}
            style={{
              opacity: pwdLoading ? 0.75 : 1,
              cursor: pwdLoading ? "wait" : "pointer",
            }}
          >
            {pwdLoading ? (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, animation: "spin 1s linear infinite" }}
                >
                  progress_activity
                </span>
                Updating Password…
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
