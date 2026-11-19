import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, ShieldCheck, AlertCircle } from "lucide-react";

function Login({ onSwitchToRegister }) {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON login response:", response.status, text);
        if (text.includes("ECONNREFUSED") || response.status === 502 || response.status === 504) {
          throw new Error("Cannot connect to backend server. Please verify backend is running on port 5001.");
        }
        throw new Error(`Server returned error status ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (!data.token) {
        throw new Error("The server did not return a login token.");
      }

      const effectiveRole =
        role === "admin" && data.user?.role === "admin" ? "admin" : "customer";

      // Save token and user object
      localStorage.setItem("studentmartToken", data.token);

      const userObject = {
        ...(data.user || {}),
        role: effectiveRole,
      };
      localStorage.setItem("studentmartUser", JSON.stringify(userObject));

      // Redirect immediately to the chosen dashboard
      if (effectiveRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to backend server. Please make sure the backend is started (node server/server.js)."
          : error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">
          Sign in to your account to explore campus deals and manage your listings.
        </p>
      </div>

      {/* Role Toggle Switcher */}
      <div className="role-switcher-capsule">
        <button
          type="button"
          className={`role-capsule-btn ${role === "customer" ? "active" : ""}`}
          onClick={() => {
            setRole("customer");
            setMessage("");
          }}
        >
          <GraduationCap size={16} />
          <span>Student</span>
        </button>
        <button
          type="button"
          className={`role-capsule-btn ${role === "admin" ? "active admin" : ""}`}
          onClick={() => {
            setRole("admin");
            setMessage("");
          }}
        >
          <ShieldCheck size={16} />
          <span>Store Admin</span>
        </button>
      </div>

      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">
            {role === "admin" ? "Admin Email Address" : "College Email Address"}
          </label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                role === "admin" ? "admin@studentmart.com" : "student@campus.edu"
              }
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
          </div>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
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
          <div className="alert-badge error" role="alert">
            <AlertCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        <button type="submit" className="auth-primary-btn" disabled={loading}>
          {loading ? (
            <div className="btn-spinner" />
          ) : (
            <>
              <span>
                {role === "admin"
                  ? "Sign In to Admin Portal"
                  : "Sign In as Student"}
              </span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {onSwitchToRegister && (
        <div className="auth-footer-prompt">
          <span>Don't have an account yet?</span>
          <button
            type="button"
            className="auth-link-btn"
            onClick={onSwitchToRegister}
          >
            Create an account
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
