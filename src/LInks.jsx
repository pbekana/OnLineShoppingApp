import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Footer from "./Footer.jsx";
import Women from "./Women.jsx";
import Men from "./Men.jsx";
import Kids from "./Kids.jsx";
import Accesories from "./Accesories.jsx";
import Cart from "./Cart.jsx";
import Checkout from "./Checkout.jsx";
import PaymentResult from "./PaymentResult.jsx";
import Orders from "./Orders.jsx";
import Admin from "./Admin.jsx";
import AuthPage from "./AuthPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

export default function Links() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
              <App />
              <div style={{ flex: 1, width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "0 15px 40px 15px" }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/men" replace />} />
                  <Route path="/men" element={<Men />} />
                  <Route path="/women" element={<Women />} />
                  <Route path="/kids" element={<Kids />} />
                  <Route path="/accesories" element={<Accesories />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/result" element={<PaymentResult />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />

                  {/* Informational placeholder routes */}
                  <Route path="/AboutUs" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>About Us</h1><p style={{ color: "#666" }}>The Thrift-flip Store offers curated fashion with Ethiopian heritage in Addis Ababa.</p></div>} />
                  <Route path="/iring" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>We're Hiring</h1><p style={{ color: "#666" }}>Join our passionate team in Addis Ababa! Send resumes to bekanapeter@gmail.com.</p></div>} />
                  <Route path="/Support" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>Customer Support</h1><p style={{ color: "#666" }}>Need assistance? Contact our 24/7 support line at +251 967667644.</p></div>} />
                  <Route path="/FindStore" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>Find Our Store</h1><p style={{ color: "#666" }}>Visit our flagship store in Addis Ababa, Ethiopia.</p></div>} />
                  <Route path="/Shipment" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>Shipping & Delivery</h1><p style={{ color: "#666" }}>Fast delivery across all sub-cities in Addis Ababa within 24 hours.</p></div>} />
                  <Route path="/Payment" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>Payment Methods</h1><p style={{ color: "#666" }}>We support secure payments via Chapa (Telebirr, CBE Birr, cards) and Cash on Delivery.</p></div>} />
                  <Route path="/GiftCard" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>Gift Cards</h1><p style={{ color: "#666" }}>Digital gift cards for The Thrift-flip Store available soon.</p></div>} />
                  <Route path="/Return" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>Return Policy</h1><p style={{ color: "#666" }}>Hassle-free 7-day returns on unworn items.</p></div>} />
                  <Route path="/Help" element={<div style={{ padding: "50px 20px", textAlign: "center", background: "#fff", borderRadius: "12px", margin: "20px 0" }}><h1>Help Center</h1><p style={{ color: "#666" }}>Find answers to common questions about orders, payments, and sizing.</p></div>} />
                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
