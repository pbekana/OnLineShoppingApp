import { useState } from "react";
import { NavLink } from "react-router-dom";
import { apiSubmitContact } from "./services/api";
import { useLanguage } from "./context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ loading: false, success: null, error: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ loading: false, success: null, error: "Please fill in all fields." });
      return;
    }

    setStatus({ loading: true, success: null, error: null });
    try {
      const res = await apiSubmitContact(formData);
      setStatus({ loading: false, success: res.message || "Message sent successfully!", error: null });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message || "Failed to submit message." });
    }
  };

  return (
    <footer style={{ background: "#0f172a", color: "#f8fafc", paddingTop: "50px" }}>
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px 50px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "40px",
        }}
      >
        {/* Contact Form Column */}
        <div>
          <h3 style={{ fontSize: "18px", color: "#f1f5f9", margin: "0 0 10px 0", fontWeight: "700" }}>
            {t("contact")}
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 16px 0" }}>
            {t("contactSubtitle")}
          </p>

          {status.success && (
            <div style={{ padding: "8px 12px", background: "#064e3b", color: "#34d399", borderRadius: "6px", fontSize: "12px", marginBottom: "12px" }}>
              ✓ {status.success}
            </div>
          )}
          {status.error && (
            <div style={{ padding: "8px 12px", background: "#7f1d1d", color: "#f87171", borderRadius: "6px", fontSize: "12px", marginBottom: "12px" }}>
              ✗ {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              name="name"
              placeholder={t("name")}
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "white",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <input
              type="email"
              name="email"
              placeholder={t("email")}
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "white",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <input
              type="text"
              name="subject"
              placeholder={t("subject")}
              value={formData.subject}
              onChange={handleChange}
              required
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "white",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <textarea
              name="message"
              placeholder={t("message")}
              rows="3"
              value={formData.message}
              onChange={handleChange}
              required
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "white",
                fontSize: "13px",
                outline: "none",
                resize: "vertical",
              }}
            />
            <button
              type="submit"
              disabled={status.loading}
              style={{
                background: "#e42f2f",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {status.loading ? "Sending..." : t("send")}
            </button>
          </form>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 style={{ fontSize: "18px", color: "#f1f5f9", margin: "0 0 16px 0", fontWeight: "700" }}>
            {t("aboutUs")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
            <NavLink to="/AboutUs" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("aboutUs")}</NavLink>
            <NavLink to="/iring" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("hiring")}</NavLink>
            <NavLink to="/Support" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("support")}</NavLink>
            <NavLink to="/FindStore" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("findStore")}</NavLink>
            <NavLink to="/Shipment" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("shipment")}</NavLink>
            <NavLink to="/Payment" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("payment")}</NavLink>
            <NavLink to="/GiftCard" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("giftCard")}</NavLink>
            <NavLink to="/Return" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("returns")}</NavLink>
            <NavLink to="/Help" style={{ color: "#94a3b8", textDecoration: "none" }}>{t("help")}</NavLink>
          </div>
        </div>

        {/* Store & Location Column */}
        <div>
          <h3 style={{ fontSize: "18px", color: "#f1f5f9", margin: "0 0 16px 0", fontWeight: "700" }}>
            The Thrift-flip Store
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", margin: "0 0 10px 0" }}>
            📍 Addis Ababa, Ethiopia
          </p>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 10px 0" }}>
            📞 +251 967667644
          </p>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 18px 0" }}>
            ✉️ bekanapeter@gmail.com
          </p>

          <h4 style={{ fontSize: "14px", color: "#cbd5e1", margin: "0 0 10px 0", fontWeight: "600" }}>
            {t("weAccept")}
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ background: "#1e293b", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#38bdf8", fontWeight: "600" }}>
              💳 Chapa Checkout
            </span>
            <span style={{ background: "#1e293b", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#34d399", fontWeight: "600" }}>
              📱 Telebirr
            </span>
            <span style={{ background: "#1e293b", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#fbbf24", fontWeight: "600" }}>
              🏦 CBE Birr
            </span>
            <span style={{ background: "#1e293b", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#f472b6", fontWeight: "600" }}>
              💵 Cash on Delivery
            </span>
          </div>
        </div>

        {/* Social & Community Column */}
        <div>
          <h3 style={{ fontSize: "18px", color: "#f1f5f9", margin: "0 0 16px 0", fontWeight: "700" }}>
            {t("followUs")}
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", margin: "0 0 16px 0" }}>
            Join our community for weekly drops, thrift style guides, and exclusive discount codes.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📘</span> Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🐦</span> Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📸</span> Instagram
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✈️</span> Telegram Channel
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div style={{ background: "#020617", padding: "18px 24px", textAlign: "center", borderTop: "1px solid #1e293b" }}>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          {t("poweredBy")}
        </p>
      </div>
    </footer>
  );
}
