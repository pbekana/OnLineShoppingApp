import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";

export default function Register() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/auth");
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          color: "white",
          borderRadius: "24px",
          padding: "8px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.28)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span style={{ fontSize: "16px" }}>👤</span>
        {isAuthenticated ? (
          <span style={{ whiteSpace: "nowrap" }}>
            {t("hi")}, {user.name ? user.name.split(" ")[0] : t("account")}
            {isAdmin && <span style={{ marginLeft: "6px", fontSize: "11px", background: "#f59e0b", color: "#111", padding: "2px 6px", borderRadius: "10px", fontWeight: "bold" }}>ADMIN</span>}
          </span>
        ) : (
          <span style={{ whiteSpace: "nowrap" }}>{t("signIn")} / {t("register")}</span>
        )}
      </button>
    </div>
  );
}
