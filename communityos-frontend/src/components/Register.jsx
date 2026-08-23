import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { register } from "../services/api";

const ROLE_OPTIONS = [
  {
    value: "resident",
    label: "Resident",
    description: "I live in a community using CommunityOS.",
  },
  {
    value: "manager",
    label: "Community Manager",
    description: "I manage community operations and services.",
  },
  {
    value: "provider",
    label: "Service Provider",
    description: "My organization provides community services.",
  },
  {
    value: "worker",
    label: "Field Worker",
    description: "I perform service work in the community.",
  },
];

export default function Register({ onRegistered, onBackToLogin }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "resident",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  function normalizePhone(phone) {
    const cleaned = phone.replace(/\s+/g, "");

    if (cleaned.startsWith("0")) {
      return `+254${cleaned.slice(1)}`;
    }

    if (cleaned.startsWith("254")) {
      return `+${cleaned}`;
    }

    return cleaned;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: normalizePhone(form.phone),
        password: form.password,
        role: form.role,
      });

      const payload =
        response?.data?.data ||
        response?.data ||
        response;

      console.log("Registration successful:", payload);

      setSuccess(
        "Account created successfully. You can now sign in."
      );

      setTimeout(() => {
        onRegistered();
      }, 1200);
    } catch (err) {
      console.error("CommunityOS registration failed:", err);

      const message =
        err?.message ||
        err?.error?.message ||
        "Unable to create your account.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
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
              Join your community.
              <br />
              <span>Stay connected.</span>
            </h1>

            <p className="login-hero-description">
              Create your CommunityOS account and connect with
              residents, managers, service providers and field teams.
            </p>
          </div>

          <div className="login-platform-points">
            <div className="login-platform-point">
              <ShieldCheck size={16} />
              Secure account access
            </div>

            <div className="login-platform-point">
              <Users size={16} />
              Role-based workspace
            </div>

            <div className="login-platform-point">
              <Phone size={16} />
              Connected community services
            </div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <span className="section-kicker">
              GET STARTED
            </span>

            <h1>Create your CommunityOS account</h1>

            <p>
              Tell us who you are so we can configure your workspace.
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

          {success && (
            <div
              className="login-success"
              role="status"
              style={{ marginBottom: 18 }}
            >
              {success}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <label htmlFor="full_name">
                Full name
              </label>

              <div className="input-wrapper">
                <User size={16} />

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Charles Mosoti"
                  value={form.full_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">
                <Mail size={16} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="phone">
                Phone number
              </label>

              <div className="input-wrapper">
                <Phone size={16} />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="role">
                I am registering as
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <small style={{ color: "var(--muted)" }}>
                {
                  ROLE_OPTIONS.find(
                    (option) => option.value === form.role
                  )?.description
                }
              </small>
            </div>

            <div className="form-field">
              <label htmlFor="password">
                Password
              </label>

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
                  }}
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

            <button
              type="submit"
              className="primary-button login-button"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div
              style={{
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              Already have an account?
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={onBackToLogin}
            >
              Sign in instead
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}