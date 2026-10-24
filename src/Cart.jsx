import { useCart } from "./context/CartContext";
import { useLanguage } from "./context/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function Cart({ store: propStore }) {
  const { items: cartItems, subtotal, totalQuantity, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const items = (cartItems && cartItems.length > 0) ? cartItems : (propStore || []);

  const getPrice = (it) => {
    if (it.product && it.product.price) return parseFloat(it.product.price);
    if (typeof it.price === "number") return it.price;
    if (typeof it.price === "string") return parseFloat(it.price.replace(/[^0-9.]/g, "")) || 0;
    return 0;
  };

  const calculatedSubtotal = subtotal || items.reduce((sum, it) => sum + getPrice(it) * (it.quantity || 1), 0);

  return (
    <div style={{ maxWidth: "860px", margin: "30px auto", padding: "28px", background: "#ffffff", borderRadius: "16px", boxShadow: "0 4px 25px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "18px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
          {t("shoppingCart")} ({totalQuantity || items.length})
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              background: "#fee2e2",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#b91c1c",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            {t("clearCart")}
          </button>
        )}
      </div>

      {loading && <p style={{ padding: "20px 0", color: "#64748b" }}>Updating cart...</p>}

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "56px", marginBottom: "15px" }}>🛒</div>
          <p style={{ fontSize: "19px", color: "#64748b", marginBottom: "22px", fontWeight: "600" }}>{t("emptyCart")}</p>
          <button
            onClick={() => navigate("/men")}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "700",
              boxShadow: "0 4px 15px rgba(228, 47, 47, 0.3)",
            }}
          >
            {t("startShopping")}
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: "15px" }}>
            {items.map((item, index) => {
              const product = item.product || item;
              const imgUrl = product.image_url || product.image || item.image;
              const unitPrice = getPrice(item);
              const qty = item.quantity || 1;
              const itemId = item.id || product.id || index;

              return (
                <div
                  key={itemId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    borderBottom: "1px solid #f1f5f9",
                    gap: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={product.name || item.name}
                    style={{ width: "85px", height: "85px", objectFit: "cover", borderRadius: "10px", border: "1px solid #f1f5f9" }}
                  />

                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                      {product.name || item.name}
                    </h3>
                    <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#64748b" }}>
                      {product.description || item.description}
                    </p>
                    <p style={{ margin: 0, fontWeight: "700", color: "#e42f2f", fontSize: "15px" }}>
                      ETB {unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "4px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <button
                      onClick={() => updateQuantity(itemId, qty - 1)}
                      style={{
                        width: "32px",
                        height: "32px",
                        border: "none",
                        background: "#ffffff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: "26px", textAlign: "center", fontWeight: "700", fontSize: "14px" }}>{qty}</span>
                    <button
                      onClick={() => updateQuantity(itemId, qty + 1)}
                      style={{
                        width: "32px",
                        height: "32px",
                        border: "none",
                        background: "#ffffff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ minWidth: "120px", textAlign: "right" }}>
                    <p style={{ margin: "0 0 6px 0", fontWeight: "800", fontSize: "16px", color: "#0f172a" }}>
                      ETB {(unitPrice * qty).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => removeFromCart(itemId)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "30px",
              padding: "24px",
              background: "#f8fafc",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: "600" }}>{t("orderSubtotal")}</p>
              <h2 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "28px", fontWeight: "800" }}>
                ETB {calculatedSubtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              style={{
                background: "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)",
                color: "white",
                border: "none",
                padding: "14px 34px",
                fontSize: "16px",
                fontWeight: "800",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(228, 47, 47, 0.35)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{t("proceedToCheckout")}</span>
              <span>→</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
