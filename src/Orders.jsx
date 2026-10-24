import { useState, useEffect } from "react";
import { apiGetOrders } from "./services/api";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      apiGetOrders()
        .then((res) => {
          setOrders(res.orders || []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load orders");
          setLoading(false);
        });
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return <div style={{ maxWidth: "800px", margin: "40px auto", textAlign: "center" }}>Loading your orders...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center", padding: "30px", background: "#fff", borderRadius: "8px" }}>
        <h2>Sign In Required</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>Please sign in to view your order history.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "850px", margin: "30px auto", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", borderBottom: "2px solid #eee", paddingBottom: "10px", marginBottom: "20px" }}>
        My Order History
      </h1>

      {error && <p style={{ color: "#e63946" }}>{error}</p>}

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "8px" }}>
          <p style={{ fontSize: "16px", color: "#666" }}>You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate("/men")}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "rgb(228, 47, 47)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((ord) => (
            <div
              key={ord.id}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "17px" }}>{ord.order_number}</h3>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Placed on {new Date(ord.created_at).toLocaleDateString()} at {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span
                    style={{
                      background: ord.payment_status === "paid" ? "#d8f3dc" : "#ffedd5",
                      color: ord.payment_status === "paid" ? "#1b4332" : "#9a3412",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Payment: {ord.payment_status}
                  </span>
                  <span
                    style={{
                      background: "#e2e8f0",
                      color: "#334155",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Status: {ord.status}
                  </span>
                </div>
              </div>

              {ord.items && ord.items.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  {ord.items.map((it) => (
                    <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px" }}>
                      <span>
                        {it.product_name} <strong style={{ color: "#666" }}>x{it.quantity}</strong>
                      </span>
                      <span>ETB {parseFloat(it.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #eee", paddingTop: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>
                  Ship to: {ord.shipping_name}, {ord.shipping_city}
                </span>
                <strong style={{ fontSize: "16px", color: "#e42f2f" }}>
                  Total: ETB {parseFloat(ord.total_amount).toFixed(2)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
