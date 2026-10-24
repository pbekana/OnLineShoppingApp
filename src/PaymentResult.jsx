import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiVerifyPayment } from "./services/api";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference = searchParams.get("reference") || searchParams.get("trx_ref") || searchParams.get("tx_ref");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reference) {
      setError("No transaction reference found in query parameters.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    apiVerifyPayment(reference)
      .then((res) => {
        if (isMounted) {
          setOrder(res.order);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Payment verification could not be completed.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reference]);

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "40px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <h2>Verifying Payment with Chapa...</h2>
        <p style={{ color: "#666" }}>Please wait while we confirm your transaction securely with the bank.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "40px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: "50px", marginBottom: "15px" }}>❌</div>
        <h2 style={{ color: "#e63946" }}>Payment Verification Failed</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>{error}</p>
        <button
          onClick={() => navigate("/cart")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "650px", margin: "50px auto", padding: "35px", background: "#fff", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <div style={{ fontSize: "56px", marginBottom: "10px" }}>🎉</div>
        <h1 style={{ fontSize: "26px", color: "#2a9d8f", margin: 0 }}>Payment Successful!</h1>
        <p style={{ color: "#666", marginTop: "8px" }}>Your order has been verified and confirmed.</p>
      </div>

      {order && (
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "6px", marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#666" }}>Order Number:</span>
            <strong>{order.order_number}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#666" }}>Payment Reference:</span>
            <span style={{ fontSize: "13px", fontFamily: "monospace" }}>{order.payment_reference}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#666" }}>Total Paid:</span>
            <strong style={{ color: "#e63946" }}>ETB {parseFloat(order.total_amount).toFixed(2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#666" }}>Status:</span>
            <span style={{ background: "#d8f3dc", color: "#1b4332", padding: "2px 8px", borderRadius: "4px", fontWeight: "600", textTransform: "uppercase", fontSize: "12px" }}>
              {order.status}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#666" }}>Deliver To:</span>
            <span>{order.shipping_name}, {order.shipping_city}</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/orders")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#1d3557",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          View Order History
        </button>
        <button
          onClick={() => navigate("/men")}
          style={{
            padding: "12px 24px",
            backgroundColor: "rgb(228, 47, 47)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
