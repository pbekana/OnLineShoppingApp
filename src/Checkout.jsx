import { useState } from "react";
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { apiCreateOrder, apiInitializePayment } from "./services/api";

export default function Checkout() {
  const { items, subtotal, totalQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    shipping_name: user?.name || "",
    shipping_email: user?.email || "",
    shipping_phone: "0912345678",
    shipping_address: "Bole Sub-City, Kebele 03, House 452",
    shipping_city: "Addis Ababa",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError(t("emptyCart"));
      return;
    }

    if (!isAuthenticated) {
      navigate("/auth", { state: { from: "/checkout" } });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const order = await apiCreateOrder({
        ...shipping,
        idempotency_key: `checkout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      const paymentInit = await apiInitializePayment(order.id);

      if (paymentInit.checkout_url) {
        await clearCart();
        window.location.href = paymentInit.checkout_url;
      } else {
        throw new Error("No checkout URL returned by payment provider");
      }
    } catch (err) {
      setError(err.message || "Checkout failed. Please check stock and details.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>🛍️</div>
        <h2 style={{ fontSize: "22px", color: "#0f172a", margin: "0 0 10px 0" }}>{t("emptyCart")}</h2>
        <button
          onClick={() => navigate("/men")}
          style={{
            marginTop: "15px",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t("startShopping")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "30px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", borderBottom: "2px solid #f1f5f9", paddingBottom: "14px", marginBottom: "25px" }}>
        {t("checkout")} & {t("payment")}
      </h1>

      {error && (
        <div style={{ padding: "14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "10px", marginBottom: "22px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!isAuthenticated && (
        <div style={{ padding: "16px", background: "#fef3c7", color: "#92400e", borderRadius: "10px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <span>ℹ️ You are checking out as a guest. Sign in to save and track your order history!</span>
          <button
            onClick={() => navigate("/auth", { state: { from: "/checkout" } })}
            style={{
              padding: "8px 16px",
              background: "#d97706",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {t("signIn")} →
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        {/* Shipping Form */}
        <form onSubmit={handleCheckout} style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <h2 style={{ fontSize: "19px", fontWeight: "700", color: "#0f172a", marginTop: 0, marginBottom: "20px" }}>
            1. {t("shippingDetails")}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>
                {t("fullName")}
              </label>
              <input
                type="text"
                name="shipping_name"
                value={shipping.shipping_name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>
                {t("emailAddress")}
              </label>
              <input
                type="email"
                name="shipping_email"
                value={shipping.shipping_email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>
                {t("phone")} (Ethiopia)
              </label>
              <input
                type="tel"
                name="shipping_phone"
                value={shipping.shipping_phone}
                onChange={handleChange}
                required
                placeholder="0912345678"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>
                {t("streetAddress")}
              </label>
              <input
                type="text"
                name="shipping_address"
                value={shipping.shipping_address}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>
                {t("city")}
              </label>
              <input
                type="text"
                name="shipping_city"
                value={shipping.shipping_city}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
              Payment Provider
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", border: "2px solid #10b981", borderRadius: "10px", background: "#f0fdf4" }}>
              <span style={{ fontSize: "24px" }}>💳</span>
              <div>
                <strong style={{ color: "#065f46", fontSize: "14px" }}>Chapa Hosted Checkout (Ethiopia)</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#047857" }}>
                  Instant checkout with Telebirr, CBE Birr, Awash, Cards & Banks.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "25px",
              width: "100%",
              padding: "15px",
              background: "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(228, 47, 47, 0.35)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Redirecting to Chapa..." : `${t("payWithChapa")} (ETB ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
          </button>
        </form>

        {/* Order Summary Card */}
        <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", height: "fit-content" }}>
          <h2 style={{ fontSize: "19px", fontWeight: "700", color: "#0f172a", marginTop: 0, marginBottom: "18px" }}>
            2. {t("orderSummary")}
          </h2>

          <div style={{ maxHeight: "320px", overflowY: "auto", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px" }}>
            {items.map((item, idx) => {
              const product = item.product || item;
              const unitPrice = parseFloat(product.price) || 0;
              const qty = item.quantity || 1;
              return (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={product.image_url || product.image || item.image}
                      alt={product.name}
                      style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px" }}
                    />
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>{product.name}</div>
                      <div style={{ color: "#64748b", fontSize: "12px" }}>Qty: {qty}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>
                    ETB {(unitPrice * qty).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ paddingTop: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px", color: "#64748b" }}>
              <span>Total Items</span>
              <span style={{ fontWeight: "600", color: "#0f172a" }}>{totalQuantity}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px", color: "#64748b" }}>
              <span>Currency</span>
              <span style={{ fontWeight: "600", color: "#0f172a" }}>ETB</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px", color: "#64748b" }}>
              <span>Delivery</span>
              <span style={{ color: "#16a34a", fontWeight: "700" }}>{t("freeDelivery")}</span>
            </div>
            <hr style={{ borderColor: "#f1f5f9", margin: "15px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong style={{ fontSize: "16px", color: "#0f172a" }}>{t("totalAmount")}:</strong>
              <strong style={{ color: "#e42f2f", fontSize: "24px", fontWeight: "800" }}>
                ETB {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
