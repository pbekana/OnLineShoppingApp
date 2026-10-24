import { useState, useEffect } from "react";
import { apiGetProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export default function CategoryProducts({ category, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedItem, setAddedItem] = useState(null);

  const cart = useCart();
  const { t } = useLanguage();
  const limit = 4; // 4 items per page gives clean 2x2 grid with Next/Previous pagination

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    apiGetProducts({ category, page, limit })
      .then((data) => {
        if (mounted) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setTotalPages(data.total_pages || Math.ceil((data.total || 0) / limit) || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || "Failed to load products");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [category, page]);

  const handleAdd = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
    } else if (cart && cart.addToCart) {
      cart.addToCart(item);
    }
    setAddedItem(item.id);
    setTimeout(() => setAddedItem(null), 1400);
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "70px 20px" }}>
        <div style={{ display: "inline-block", width: "42px", height: "42px", border: "4px solid #fecaca", borderTopColor: "#dc2626", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ marginTop: "16px", color: "#64748b", fontSize: "16px", fontWeight: "500" }}>{t("loadingProducts")}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
        <h3 style={{ color: "#dc2626", margin: "0 0 10px 0" }}>{error}</h3>
        <button
          onClick={() => setPage(1)}
          style={{
            padding: "10px 20px",
            background: "#1e293b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "70px 20px", background: "#ffffff", borderRadius: "16px", margin: "20px auto", maxWidth: "600px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: "48px", marginBottom: "14px" }}>🛍️</div>
        <p style={{ fontSize: "17px", color: "#64748b", margin: 0 }}>{t("noProductsCategory")}</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Products Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "28px",
          marginBottom: "35px",
        }}
      >
        {products.map((item) => {
          const isAdded = addedItem === item.id;
          const isAvailable = item.stock > 0;

          return (
            <div
              key={item.id}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 18px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 18px rgba(0, 0, 0, 0.06)";
              }}
            >
              {/* Image Container with Badges */}
              <div style={{ position: "relative", width: "100%", height: "260px", overflow: "hidden", background: "#f8fafc" }}>
                <img
                  src={item.image_url || item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.35s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />

                {/* Category Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(15, 23, 42, 0.75)",
                    backdropFilter: "blur(4px)",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.category}
                </span>

                {/* Stock indicator badge */}
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: isAvailable ? "#dcfce7" : "#fee2e2",
                    color: isAvailable ? "#15803d" : "#b91c1c",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {isAvailable ? `${item.stock} ${t("inStock")}` : t("outOfStock")}
                </span>
              </div>

              {/* Product Content */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: "#0f172a",
                    margin: "0 0 6px 0",
                    lineHeight: "1.3",
                  }}
                >
                  {item.name}
                </h3>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    margin: "0 0 16px 0",
                    lineHeight: "1.5",
                    flexGrow: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.description}
                </p>

                {/* Price and Cart Action */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", fontWeight: "600" }}>PRICE</span>
                    <span style={{ fontSize: "19px", fontWeight: "800", color: "#e42f2f" }}>
                      ETB {parseFloat(item.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleAdd(item)}
                    style={{
                      background: isAdded
                        ? "#10b981"
                        : isAvailable
                        ? "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)"
                        : "#cbd5e1",
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                      boxShadow: isAvailable ? "0 4px 12px rgba(228, 47, 47, 0.25)" : "none",
                    }}
                  >
                    <span>{isAdded ? "✓" : "🛒"}</span>
                    <span>{isAdded ? t("added") : isAvailable ? t("addToCart") : t("outOfStock")}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Pagination Controls (Next & Previous) */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginTop: "20px",
            padding: "18px",
            background: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={handlePrev}
            style={{
              padding: "10px 20px",
              background: page <= 1 ? "#f1f5f9" : "#ffffff",
              color: page <= 1 ? "#94a3b8" : "#0f172a",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>←</span> {t("previous")}
          </button>

          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#475569",
              padding: "6px 14px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            {t("pageOf", { page, total: totalPages })}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={handleNext}
            style={{
              padding: "10px 22px",
              background: page >= totalPages ? "#f1f5f9" : "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)",
              color: page >= totalPages ? "#94a3b8" : "#ffffff",
              border: page >= totalPages ? "1.5px solid #e2e8f0" : "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: page >= totalPages ? "none" : "0 4px 14px rgba(228, 47, 47, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t("next")} <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
