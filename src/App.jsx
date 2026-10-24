import "./App.css";
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Register from "./Register";
import HeroBanner from "./components/HeroBanner";
import { useCart } from "./context/CartContext";
import { useLanguage } from "./context/LanguageContext";
import { apiGetProducts } from "./services/api";

export default function App() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { totalQuantity, addToCart } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomeOrCategory = ["/", "/men", "/women", "/kids", "/accesories"].includes(location.pathname);

  // Real-time backend search
  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setSearchLoading(true);
      apiGetProducts({ search: trimmed, limit: 8 })
        .then((res) => {
          setSearchResults(res.products || []);
          setSearchLoading(false);
        })
        .catch(() => {
          setSearchResults([]);
          setSearchLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* Top Banner & Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "linear-gradient(135deg, #e42f2f 0%, #b91c1c 100%)",
          color: "white",
          boxShadow: "0 4px 20px rgba(185, 28, 28, 0.25)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Brand Logo */}
          <NavLink
            to="/"
            style={{
              textDecoration: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                background: "white",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              🛍️
            </div>
            <div>
              <span style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px", display: "block", lineHeight: "1.1" }}>
                Big Sales
              </span>
              <span style={{ fontSize: "11px", opacity: 0.9, fontWeight: "500", letterSpacing: "0.5px" }}>
                The Thrift-flip Store
              </span>
            </div>
          </NavLink>

          {/* Search Bar */}
          <div style={{ flex: "1", maxWidth: "420px", position: "relative", minWidth: "220px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(4px)",
                borderRadius: "24px",
                padding: "6px 14px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <span style={{ fontSize: "16px", marginRight: "8px", opacity: 0.85 }}>🔍</span>
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setIsSearchOpen(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    opacity: 0.8,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchOpen && search.trim() && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "#ffffff",
                  borderRadius: "14px",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
                  padding: "12px",
                  maxHeight: "360px",
                  overflowY: "auto",
                  zIndex: 2000,
                  color: "#0f172a",
                }}
              >
                {searchLoading ? (
                  <p style={{ textAlign: "center", color: "#64748b", margin: "14px 0", fontSize: "14px" }}>
                    {t("searching")}
                  </p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        addToCart(item);
                        setIsSearchOpen(false);
                        setSearch("");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <img
                        src={item.image_url || item.image}
                        alt={item.name}
                        style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>{item.name}</div>
                        <div style={{ fontSize: "12px", color: "#e42f2f", fontWeight: "600" }}>
                          ETB {parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{
                          background: "#e42f2f",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", color: "#64748b", margin: "14px 0", fontSize: "14px" }}>
                    {t("noItemsFound")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Header Controls: Language Switcher, Cart, and Register/Sign In */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Language Switcher */}
            <div style={{ position: "relative" }}>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  borderRadius: "20px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="en" style={{ color: "#111" }}>🇺🇸 English</option>
                <option value="es" style={{ color: "#111" }}>🇪🇸 Español</option>
                <option value="fr" style={{ color: "#111" }}>🇫🇷 Français</option>
                <option value="it" style={{ color: "#111" }}>🇮🇹 Italiano</option>
              </select>
            </div>

            {/* Shopping Cart Button */}
            <NavLink
              to="/cart"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255, 255, 255, 0.2)",
                padding: "8px 14px",
                borderRadius: "24px",
                textDecoration: "none",
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <span style={{ fontSize: "16px" }}>🛒</span>
              <span>{t("cartTitle")}</span>
              {totalQuantity > 0 && (
                <span
                  style={{
                    background: "#ffffff",
                    color: "#dc2626",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "800",
                    marginLeft: "2px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                >
                  {totalQuantity}
                </span>
              )}
            </NavLink>

            {/* User Account / Sign In / Register (Moved to Right as Requested) */}
            <Register />
          </div>
        </div>

        {/* Secondary Category Navigation */}
        <nav
          style={{
            background: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(6px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "8px 20px",
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <NavLink
              to="/men"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: "white",
                fontWeight: isActive ? "800" : "500",
                fontSize: "15px",
                padding: "6px 14px",
                borderRadius: "20px",
                background: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
                transition: "all 0.2s",
              })}
            >
              👔 {t("men")}
            </NavLink>
            <NavLink
              to="/women"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: "white",
                fontWeight: isActive ? "800" : "500",
                fontSize: "15px",
                padding: "6px 14px",
                borderRadius: "20px",
                background: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
                transition: "all 0.2s",
              })}
            >
              👗 {t("women")}
            </NavLink>
            <NavLink
              to="/kids"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: "white",
                fontWeight: isActive ? "800" : "500",
                fontSize: "15px",
                padding: "6px 14px",
                borderRadius: "20px",
                background: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
                transition: "all 0.2s",
              })}
            >
              🧸 {t("kids")}
            </NavLink>
            <NavLink
              to="/accesories"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: "white",
                fontWeight: isActive ? "800" : "500",
                fontSize: "15px",
                padding: "6px 14px",
                borderRadius: "20px",
                background: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
                transition: "all 0.2s",
              })}
            >
              👜 {t("accessories")}
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "20px 10px" }}>
        {/* Hero banner shown on shop/category pages */}
        {isHomeOrCategory && <HeroBanner />}
      </main>
    </div>
  );
}
