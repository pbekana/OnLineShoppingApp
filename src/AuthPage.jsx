import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function AuthPage() {
  const { login, register, isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("signin"); // "signin" or "register"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, show account profile card
  if (isAuthenticated && user) {
    return (
      <div style={{ maxWidth: "480px", margin: "60px auto", padding: "35px", background: "#ffffff", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", margin: "0 auto 20px auto", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "#e42f2f" }}>
          👤
        </div>
        <h2 style={{ fontSize: "24px", color: "#1f2937", margin: "0 0 6px 0" }}>{user.name}</h2>
        <p style={{ color: "#6b7280", margin: "0 0 15px 0", fontSize: "14px" }}>{user.email}</p>
        <div style={{ display: "inline-block", background: user.role === "admin" ? "#e63946" : "#2a9d8f", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", marginBottom: "25px" }}>
          {user.role}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => navigate("/orders")}
            style={{
              padding: "12px",
              background: "#1d3557",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📦 {t("myOrders")}
          </button>
          {user.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                padding: "12px",
                background: "#f4a261",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ⚙️ {t("adminDashboard")}
            </button>
          )}
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            style={{
              padding: "12px",
              background: "#f3f4f6",
              color: "#dc2626",
              border: "1px solid #fee2e2",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          setError(t("passwordsMismatch"));
          setLoading(false);
          return;
        }
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }

      // Return to returnTo URL or home
      const destination = location.state?.from || "/";
      navigate(destination);
    } catch (err) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          padding: "36px",
          border: "1px solid #f1f5f9",
        }}
      >
        {/* Toggle Mode Tabs */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "10px", padding: "4px", marginBottom: "28px" }}>
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: mode === "signin" ? "#ffffff" : "transparent",
              color: mode === "signin" ? "#e42f2f" : "#64748b",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: mode === "signin" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s",
            }}
          >
            {t("signIn")}
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: mode === "register" ? "#ffffff" : "transparent",
              color: mode === "register" ? "#e42f2f" : "#64748b",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: mode === "register" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s",
            }}
          >
            {t("register")}
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", color: "#0f172a", margin: "0 0 6px 0", fontWeight: "700" }}>
            {mode === "signin" ? t("welcomeTitle") : t("createAccountTitle")}
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            {t("authSubtitle")}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                {t("fullName")}
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Abebe Bikila"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              {t("emailAddress")}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="customer@example.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              {t("password")}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1.5px solid #cbd5e1",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                {t("confirmPassword")}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "14px",
              background: "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(228, 47, 47, 0.35)",
              transition: "transform 0.15s, opacity 0.15s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : mode === "signin" ? t("signIn") : t("register")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "register" : "signin");
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#e42f2f",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {mode === "signin" ? t("dontHaveAccount") : t("alreadyHaveAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}
