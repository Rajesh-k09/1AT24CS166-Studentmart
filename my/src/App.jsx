import "./style/App.css";
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/login";
import CustomerDashboard from "./components/CustomerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { 
  Sparkles, 
  ShoppingBag, 
  Zap 
} from "lucide-react";

function AuthPage() {
  const [authTab, setAuthTab] = useState("login");

  return (
    <main className="studentmart-auth-layout">
      {/* LEFT HERO / BRAND SHOWCASE */}
      <section className="auth-hero-panel">
        <div className="hero-backdrop-glow"></div>
        <div className="hero-backdrop-glow-secondary"></div>

        <div className="auth-hero-inner">
          {/* Logo Brand */}
          <div className="brand-header">
            <div className="brand-mark">
              <ShoppingBag size={22} className="brand-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">StudentMart<span className="brand-dot">.</span></span>
              <span className="brand-badge">Campus Exchange</span>
            </div>
          </div>

          {/* Hero Main Copy */}
          <div className="hero-copy-block">
            <div className="hero-pill-tag">
              <Sparkles size={14} />
              <span>The Next-Gen Campus Marketplace</span>
            </div>

            <h1 className="hero-headline">
              Campus commerce, <br />
              <span className="gradient-text">made seamless.</span>
            </h1>

            <p className="hero-description">
              Buy, sell, and trade books, calculators, lab gear, and tech directly with verified students on your campus with zero commission fees.
            </p>
          </div>


          {/* Key Trust Metrics */}
          <div className="hero-trust-grid">
            <div className="trust-card">
              <div className="trust-num">2,400+</div>
              <div className="trust-label">Campus Listings</div>
            </div>
            <div className="trust-card">
              <div className="trust-num">100%</div>
              <div className="trust-label">Verified Peers</div>
            </div>
            <div className="trust-card">
              <div className="trust-num">₹0</div>
              <div className="trust-label">Platform Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT AUTH PANEL */}
      <section className="auth-form-panel">
        <div className="form-panel-container">
          {/* Top Pill Tab Switcher */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`mode-tab-btn ${authTab === "login" ? "active" : ""}`}
              onClick={() => setAuthTab("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${authTab === "register" ? "active" : ""}`}
              onClick={() => setAuthTab("register")}
            >
              Create Account
            </button>
          </div>

          {/* Dynamic Component */}
          <div className="auth-form-card">
            {authTab === "login" ? (
              <Login onSwitchToRegister={() => setAuthTab("register")} />
            ) : (
              <Register onSwitchToLogin={() => setAuthTab("login")} />
            )}
          </div>

          {/* Quick Helper Note for Easy Demo */}
          <div className="demo-hint-box">
            <div className="demo-hint-title">
              <Zap size={14} />
              <span>Campus Portal Quick Note</span>
            </div>
            <p>
              Students can browse, buy, and list items. Store Administrators have full product and catalog management privileges.
            </p>
          </div>

          <footer className="auth-page-footer">
            <span>© {new Date().getFullYear()} StudentMart Inc.</span>
            <span>·</span>
            <span>Made with passion for students</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function RoleBasedRedirect() {
  const token = localStorage.getItem("studentmartToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    const raw = localStorage.getItem("studentmartUser");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  return user?.role === "admin" ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/customer/dashboard" replace />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public authentication page */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Customer Dashboard Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer", "admin"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/*"
          element={<Navigate to="/customer/dashboard" replace />}
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* Legacy & Shortcut Routes */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        <Route path="/profile" element={<RoleBasedRedirect />} />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
