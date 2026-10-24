import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import {
  apiGetProducts,
  apiAdminCreateProduct,
  apiAdminUpdateProduct,
  apiAdminDeleteProduct,
  apiAdminGetOrders,
  apiAdminUpdateOrderStatus,
  apiAdminGetContacts,
} from "./services/api";

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("products"); // 'products', 'orders', 'contacts'

  // Products state
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "men",
    image_url: "",
    stock: 10,
    is_active: true,
  });

  // Orders state
  const [orders, setOrders] = useState([]);

  // Contacts state
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "products") {
        const res = await apiGetProducts({ limit: 100 });
        setProducts(res.products || []);
      } else if (tab === "orders") {
        const res = await apiAdminGetOrders();
        setOrders(res.orders || []);
      } else if (tab === "contacts") {
        const res = await apiAdminGetContacts();
        setContacts(res.messages || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [tab, isAdmin]);

  if (authLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Verifying admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "30px", background: "#fff", borderRadius: "8px" }}>
        <h2>Access Denied</h2>
        <p style={{ color: "#666" }}>Administrator credentials required to view this dashboard.</p>
        <p style={{ fontSize: "13px", color: "#888" }}>
          Default admin: <strong>admin@thriftflip.com</strong> / <strong>Admin123!</strong>
        </p>
      </div>
    );
  }

  // Handle Product Form
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        image_url: productForm.image_url,
        stock: parseInt(productForm.stock, 10),
        is_active: productForm.is_active,
      };

      if (editingProduct) {
        await apiAdminUpdateProduct(editingProduct.id, payload);
        setMessage("Product updated successfully!");
      } else {
        await apiAdminCreateProduct(payload);
        setMessage("Product created successfully!");
      }

      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "men",
        image_url: "",
        stock: 10,
        is_active: true,
      });
      loadData();
    } catch (err) {
      setError(err.message || "Error saving product");
    }
  };

  const handleEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image_url: p.image_url,
      stock: p.stock,
      is_active: p.is_active,
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this product?")) return;
    try {
      await apiAdminDeleteProduct(id);
      setMessage("Product deactivated successfully");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiAdminUpdateOrderStatus(orderId, newStatus);
      setMessage(`Order status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      setError(err.message || "Failed to update order status");
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "15px" }}>
        <div>
          <h1 style={{ fontSize: "28px", margin: 0 }}>Store Administration</h1>
          <p style={{ margin: "4px 0 0 0", color: "#666" }}>Logged in as: {user.name} ({user.email})</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setTab("products")}
            style={{
              padding: "8px 16px",
              background: tab === "products" ? "#e42f2f" : "#eee",
              color: tab === "products" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Products
          </button>
          <button
            onClick={() => setTab("orders")}
            style={{
              padding: "8px 16px",
              background: tab === "orders" ? "#e42f2f" : "#eee",
              color: tab === "orders" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Orders
          </button>
          <button
            onClick={() => setTab("contacts")}
            style={{
              padding: "8px 16px",
              background: tab === "contacts" ? "#e42f2f" : "#eee",
              color: tab === "contacts" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Customer Inquiries
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: "10px", background: "#d4edda", color: "#155724", borderRadius: "4px", margin: "15px 0" }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", borderRadius: "4px", margin: "15px 0" }}>
          ✗ {error}
        </div>
      )}

      {loading && <p>Loading data...</p>}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "30px" }}>
            <h3>{editingProduct ? `Edit Product #${editingProduct.id}` : "Add New Product"}</h3>
            <form onSubmit={handleProductSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>Price (ETB)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>Stock Available</label>
                <input
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600" }}>Description</label>
                <textarea
                  required
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    background: "#2a9d8f",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: "", description: "", price: "", category: "men", image_url: "", stock: 10, is_active: true });
                    }}
                    style={{
                      padding: "10px 16px",
                      background: "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "6px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#264653", color: "white", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>ID</th>
                <th style={{ padding: "10px" }}>Image</th>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Category</th>
                <th style={{ padding: "10px" }}>Price (ETB)</th>
                <th style={{ padding: "10px" }}>Stock</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{p.id}</td>
                  <td style={{ padding: "10px" }}>
                    <img src={p.image_url} alt={p.name} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "4px" }} />
                  </td>
                  <td style={{ padding: "10px", fontWeight: "600" }}>{p.name}</td>
                  <td style={{ padding: "10px", textTransform: "capitalize" }}>{p.category}</td>
                  <td style={{ padding: "10px" }}>{parseFloat(p.price).toFixed(2)}</td>
                  <td style={{ padding: "10px", fontWeight: "bold", color: p.stock < 5 ? "#e63946" : "#2a9d8f" }}>
                    {p.stock}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => handleEditProduct(p)}
                      style={{ padding: "4px 8px", background: "#f4a261", color: "white", border: "none", borderRadius: "3px", marginRight: "6px", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      style={{ padding: "4px 8px", background: "#e76f51", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div style={{ marginTop: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "6px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#1d3557", color: "white", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Order #</th>
                <th style={{ padding: "10px" }}>Customer</th>
                <th style={{ padding: "10px" }}>Total (ETB)</th>
                <th style={{ padding: "10px" }}>Payment</th>
                <th style={{ padding: "10px" }}>Fulfillment Status</th>
                <th style={{ padding: "10px" }}>Date</th>
                <th style={{ padding: "10px" }}>Transition Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>{o.order_number}</td>
                  <td style={{ padding: "10px" }}>
                    <div>{o.shipping_name}</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>{o.shipping_phone}</div>
                  </td>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>{parseFloat(o.total_amount).toFixed(2)}</td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: o.payment_status === "paid" ? "#d8f3dc" : "#ffedd5",
                        color: o.payment_status === "paid" ? "#1b4332" : "#9a3412",
                        textTransform: "uppercase",
                      }}
                    >
                      {o.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: "#e2e8f0",
                        color: "#334155",
                        textTransform: "uppercase",
                      }}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px", fontSize: "12px", color: "#666" }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {o.status === "awaiting_payment" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "cancelled")}
                        style={{ padding: "3px 8px", fontSize: "11px", background: "#e63946", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    )}
                    {o.status === "paid" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "processing")}
                        style={{ padding: "3px 8px", fontSize: "11px", background: "#457b9d", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                      >
                        Mark Processing
                      </button>
                    )}
                    {o.status === "processing" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "shipped")}
                        style={{ padding: "3px 8px", fontSize: "11px", background: "#2a9d8f", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                      >
                        Mark Shipped
                      </button>
                    )}
                    {o.status === "shipped" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, "delivered")}
                        style={{ padding: "3px 8px", fontSize: "11px", background: "#1b4332", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                      >
                        Mark Delivered
                      </button>
                    )}
                    {(o.status === "delivered" || o.status === "cancelled") && (
                      <span style={{ fontSize: "12px", color: "#888" }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTACTS TAB */}
      {tab === "contacts" && (
        <div style={{ marginTop: "20px" }}>
          {contacts.length === 0 ? (
            <p>No customer messages received yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {contacts.map((msg) => (
                <div key={msg.id} style={{ background: "#fff", padding: "15px", borderRadius: "6px", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <strong>{msg.name} ({msg.email})</strong>
                    <span style={{ fontSize: "12px", color: "#888" }}>{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontWeight: "600", color: "#1d3557", marginBottom: "6px" }}>Subject: {msg.subject}</div>
                  <p style={{ margin: 0, color: "#444" }}>{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
