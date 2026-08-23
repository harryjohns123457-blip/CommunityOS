import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { login } from "../services/api";

export default function Login({ onLogin, onRegister }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      });

      const payload =
        response?.data?.data ||
        response?.data ||
        response;

      if (!payload?.token) {
        throw new Error(
          "Login succeeded but no authentication token was returned."
        );
      }

      onLogin(payload);
    } catch (err) {
      console.error("CommunityOS login failed:", err);

      const message =
        err?.message ||
        err?.error?.message ||
        "Unable to sign in. Please check your credentials and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* =====================================================
          BRAND / PRODUCT SIDE
      ====================================================== */}
      <section className="login-hero">
        <div className="login-hero-content">
          <div className="brand-mark">
            <span className="brand-icon">
              <Sparkles size={17} />
            </span>

            <span>
              Community<span className="brand-os">OS</span>
            </span>
          </div>

          <div style={{ marginTop: 55 }}>
            <span className="section-kicker">
              COMMUNITY OPERATIONS PLATFORM
            </span>

            <h1>
              Everything your community needs.
              <br />
              <span>One place.</span>
            </h1>

            <p className="login-hero-description">
              Connect residents, community managers, service providers
              and field teams through one coordinated operating layer.
            </p>
          </div>

          <div className="login-platform-points">
            <div className="login-platform-point">
              <CheckCircle2 size={16} />
              Essential community services
            </div>

            <div className="login-platform-point">
              <Zap size={16} />
              Real-time service coordination
            </div>

            <div className="login-platform-point">
              <Users size={16} />
              Connected communities
            </div>

            <div className="login-platform-point">
              <ShieldCheck size={16} />
              Secure role-based access
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOGIN PANEL
      ====================================================== */}
      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <span className="section-kicker">
              WELCOME BACK
            </span>

            <h1>Sign in to CommunityOS</h1>

            <p>
              Access your community workspace and continue
              where you left off.
            </p>
          </div>

          {error && (
            <div
              className="login-error"
              role="alert"
              style={{ marginBottom: 18 }}
            >
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {/* EMAIL */}
            <div className="form-field">
              <label htmlFor="email">
                Email address
              </label>

              <div
                className="input-wrapper"
                style={{ position: "relative" }}
              >
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    pointerEvents: "none",
                  }}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-field">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="secondary-button"
                  style={{
                    minHeight: "auto",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    color: "var(--brand)",
                    fontSize: 10,
                  }}
                  onClick={() =>
                    setError(
                      "Password recovery will be connected when the authentication recovery endpoint is enabled."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div
                className="input-wrapper"
                style={{ position: "relative" }}
              >
                <LockKeyhole
                  size={16}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    pointerEvents: "none",
                  }}
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    paddingLeft: 40,
                    paddingRight: 45,
                  }}
                />

                <button
                  type="button"
                  className="icon-btn"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={loading}
                  style={{
                    position: "absolute",
                    right: 4,
                    top: 3,
                    width: 38,
                    height: 38,
                    border: 0,
                    background: "transparent",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="primary-button login-button"
              disabled={loading}
              style={{
                minHeight: 48,
                marginTop: 5,
              }}
            >
              {loading ? (
                <>
                  <span className="spin">◌</span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

 <div className="login-footer">
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 7,
      marginBottom: 12,
      color: "var(--success)",
      fontWeight: 700,
    }}
  >
    <ShieldCheck size={14} />
    Secure CommunityOS access
  </div>

  <div style={{ marginBottom: 10 }}>
    Don't have a CommunityOS account?
  </div>

  <button
    type="button"
    className="secondary-button"
    onClick={onRegister}
  >
    Create an account
  </button>
</div>
      </div>
    </section>
  </main>
);
}        