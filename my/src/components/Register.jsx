import { useState } from "react";
import { API_BASE_URL } from "../config";
import { User, Mail, Lock, Eye, EyeOff, Hash, GraduationCap, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    usn: "",
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleRoleChange(newRole) {
    setForm((prev) => ({
      ...prev,
      role: newRole,
    }));
    setMessage("");
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON register response:", response.status, text);
        if (text.includes("ECONNREFUSED") || response.status === 502 || response.status === 504) {
          throw new Error("Cannot connect to backend server. Please verify backend is running on port 5001.");
        }
        throw new Error(`Server returned error status ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Registration failed (HTTP ${response.status}).`);
      }

      const roleLabel = form.role === "admin" ? "Store Administrator" : "Student";
      setMessage(
        data.message || `Account created successfully as ${roleLabel}! You can now sign in.`
      );
      setMessageType("success");

      setForm({
        usn: "",
        name: "",
        email: "",
        password: "",
        role: form.role,
      });
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to backend server. Please make sure the backend is started (node server/server.js)."
          : error.message || "Unable to connect to the server."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">
          Join your campus community to buy, sell, and discover student essentials.
        </p>
      </div>

      {/* Role Toggle Switcher */}
      <div className="role-switcher-capsule">
        <button
          type="button"
          className={`role-capsule-btn ${form.role === "customer" ? "active" : ""}`}
          onClick={() => handleRoleChange("customer")}
        >
          <GraduationCap size={16} />
          <span>Student</span>
        </button>
        <button
          type="button"
          className={`role-capsule-btn ${form.role === "admin" ? "active admin" : ""}`}
          onClick={() => handleRoleChange("admin")}
        >
          <ShieldCheck size={16} />
          <span>Store Admin</span>
        </button>
      </div>

      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="register-usn" className="form-label">
              {form.role === "admin" ? "Admin Staff ID" : "University Roll / USN"}
            </label>
            <div className="input-wrapper">
              <Hash size={18} className="input-icon" />
              <input
                id="register-usn"
                name="usn"
                type="text"
                className="form-input"
                value={form.usn}
                onChange={handleChange}
                placeholder={form.role === "admin" ? "ADM001" : "1AT24CS001"}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-name" className="form-label">
              Full Name
            </label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="register-name"
                name="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="register-email" className="form-label">
            Email Address
          </label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@campus.edu"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="register-password" className="form-label">
            Password
          </label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
            <button
              type="button"
              className="input-action-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {message && (
          <div className={`alert-badge ${messageType}`} role="status">
            {messageType === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{message}</span>
          </div>
        )}

        <button type="submit" className="auth-primary-btn" disabled={loading}>
          {loading ? (
            <div className="btn-spinner" />
          ) : (
            <>
              <span>
                {form.role === "admin"
                  ? "Register as Administrator"
                  : "Create Student Account"}
              </span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className="auth-footer-prompt">
          <span>Already registered?</span>
          <button
            type="button"
            className="auth-link-btn"
            onClick={onSwitchToLogin}
          >
            Sign in to existing account
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;
