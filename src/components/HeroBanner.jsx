import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function HeroBanner() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #e11d48 100%)",
        color: "white",
        padding: "45px 24px",
        borderRadius: "20px",
        margin: "15px auto 30px auto",
        maxWidth: "1200px",
        boxShadow: "0 14px 35px rgba(225, 29, 72, 0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background glow */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "720px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(6px)",
            padding: "6px 14px",
            borderRadius: "30px",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          <span>🔥</span>
          <span>{t("heroBadge")}</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(26px, 4.5vw, 40px)",
            fontWeight: "800",
            lineHeight: "1.2",
            margin: "0 0 14px 0",
            letterSpacing: "-0.5px",
          }}
        >
          {t("heroHeading")}
        </h1>

        <p
          style={{
            fontSize: "clamp(14px, 2vw, 17px)",
            lineHeight: "1.6",
            color: "#e2e8f0",
            margin: "0 0 24px 0",
          }}
        >
          {t("heroDesc")}
        </p>

        {/* Feature Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "25px" }}>
          <span style={{ background: "rgba(255,255,255,0.12)", padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
            ⚡ 24h Delivery Addis Ababa
          </span>
          <span style={{ background: "rgba(255,255,255,0.12)", padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
            💳 Chapa (Telebirr & CBE)
          </span>
          <span style={{ background: "rgba(255,255,255,0.12)", padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
            ✨ Curated Thrift & New Items
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/women")}
            style={{
              padding: "12px 26px",
              background: "#ffffff",
              color: "#1e1b4b",
              border: "none",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {t("shopNow")} →
          </button>
          <button
            onClick={() => navigate("/men")}
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          >
            {t("viewCatalog")}
          </button>
        </div>
      </div>
    </div>
  );
}
