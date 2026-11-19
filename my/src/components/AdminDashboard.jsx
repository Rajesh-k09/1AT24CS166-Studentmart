import "../style/adminDashboard.css";
import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Package,
  PlusCircle,
  ShoppingBag,
  User,
  LogOut,
  Search,
  Trash2,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Clock,
  Store,
  Banknote,
  Check,
  X,
  ArrowLeft,
  Upload,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Lock,
  Layers,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("manage-products");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  // Modals
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Add product form
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    stock: 20,
    category: "Gadgets",
    desc: "",
    image: "",
  });

  // Profile forms
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  // Fetch current user & products
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("studentmartToken");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileRes.status === 401) {
          localStorage.removeItem("studentmartToken");
          localStorage.removeItem("studentmartUser");
          navigate("/login", { replace: true });
          return;
        }

        const profileData = await profileRes.json();
        const userData = profileData.user || profileData;
        if (userData) {
          setUser(userData);
          setProfileForm({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            department: userData.department || userData.course || "",
            year: userData.year || "",
            address: userData.address || userData.college || "",
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          localStorage.setItem("studentmartProducts", JSON.stringify(data.products));
        }
      }
    } catch (err) {
      console.warn("Could not reach products API:", err);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("studentmartToken");
    if (!token) return;

    try {
      setOrdersLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        if (data.stats) {
          setOrderStats(data.stats);
        }
      }
    } catch (err) {
      console.warn("Orders fetch error:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("studentmartToken");
    localStorage.removeItem("studentmartUser");
    navigate("/login", { replace: true });
  };

  // Update order status handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("studentmartToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update order status.");

      setAlertMessage({
        type: "success",
        text: `Order status changed to "${newStatus}".`,
      });

      fetchOrders();
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title.trim()) {
      setAlertMessage({ type: "error", text: "Please enter product title." });
      return;
    }

    try {
      const token = localStorage.getItem("studentmartToken");
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newProduct.title.trim(),
          price: Number(newProduct.price),
          stock: Number(newProduct.stock) || 20,
          category: newProduct.category,
          desc: newProduct.desc.trim(),
          image: newProduct.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product.");

      setAlertMessage({ type: "success", text: `"${newProduct.title}" added to store catalog!` });
      setNewProduct({
        title: "",
        price: "",
        stock: 20,
        category: "Gadgets",
        desc: "",
        image: "",
      });

      fetchProducts();
      setActiveTab("manage-products");
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Save Edit Product Handler
  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const token = localStorage.getItem("studentmartToken");
      const res = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingProduct.title.trim(),
          price: Number(editingProduct.price),
          stock: Number(editingProduct.stock),
          category: editingProduct.category,
          desc: editingProduct.desc.trim(),
          image: editingProduct.image,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update product.");

      setAlertMessage({ type: "success", text: "Product updated successfully!" });
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("studentmartToken");
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product.");

      setAlertMessage({ type: "success", text: "Product deleted from catalog." });
      fetchProducts();
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Profile update handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("studentmartToken");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      setUser(data.user || { ...user, ...profileForm });
      setIsEditProfileOpen(false);
      setAlertMessage({ type: "success", text: "Admin profile updated successfully!" });
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setAlertMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    const token = localStorage.getItem("studentmartToken");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");

      setPasswordForm({ currentPassword: "", newPassword: "" });
      setIsPasswordModalOpen(false);
      setAlertMessage({ type: "success", text: "Admin password updated successfully!" });
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const title = (p.title || p.name || "").toLowerCase();
    const desc = (p.desc || p.description || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();

    const matchesSearch = term === "" || title.includes(term) || desc.includes(term) || cat.includes(term);
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const term = orderSearch.toLowerCase().trim();
    const orderId = (o.orderId || o._id || "").toLowerCase();
    const customer = (o.customer?.name || o.customer?.email || "").toLowerCase();
    const loc = (o.deliveryLocation || "").toLowerCase();

    const matchesSearch = term === "" || orderId.includes(term) || customer.includes(term) || loc.includes(term);
    const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayName = user?.name || user?.usn || "Admin";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="admin-portal-wrapper">
      {/* =========================================
          LEFT SIDEBAR
          ========================================= */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Store size={20} />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">StudentMart<span style={{ color: "#4f46e5" }}>.</span></span>
            <span className="admin-brand-badge">Store Administration</span>
          </div>
        </div>

        {/* User Card */}
        <div className="admin-user-card">
          <div className="admin-avatar">{avatarLetter}</div>
          <div className="admin-user-info">
            <span className="admin-user-name">{displayName}</span>
            <span className="admin-user-role">Campus Store Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "manage-products" ? "active" : ""}`}
            onClick={() => setActiveTab("manage-products")}
          >
            <Package size={18} />
            <span>Product Catalog</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "add-products" ? "active" : ""}`}
            onClick={() => setActiveTab("add-products")}
          >
            <PlusCircle size={18} />
            <span>Add New Product</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={18} />
            <span>Orders & Pickup</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} />
            <span>Admin Profile</span>
          </button>
        </nav>

        {/* Shortcut to Student View */}
        <div style={{ marginTop: "auto", paddingTop: 14 }}>
          <button
            type="button"
            className="admin-switch-student-btn"
            onClick={() => navigate("/customer/dashboard")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "#f1f5f9",
              color: "#334155",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            <ExternalLink size={16} />
            <span>Switch to Student View</span>
          </button>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =========================================
          MAIN CONTENT AREA
          ========================================= */}
      <main className="admin-main">
        {/* Global Feedback Alert */}
        {alertMessage.text && (
          <div className={`admin-alert ${alertMessage.type}`}>
            <span>{alertMessage.text}</span>
            <button
              type="button"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", fontWeight: "bold" }}
              onClick={() => setAlertMessage({ type: "", text: "" })}
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === "manage-products" && (
          <div>
            <div className="admin-header">
              <div>
                <h1 className="admin-header-title">Product Catalog Management</h1>
                <p className="admin-header-subtitle">
                  View, edit inventory, update prices, or remove products from the student store.
                </p>
              </div>

              <div className="admin-role-badge">
                <ShieldCheck size={16} />
                <span>Store Administrator</span>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="admin-stats-row">
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                  <Package size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">{products.length}</span>
                  <span className="admin-stat-label">Total Products</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                  <AlertTriangle size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">
                    {products.filter((p) => (p.stock !== undefined ? p.stock : 20) <= 5).length}
                  </span>
                  <span className="admin-stat-label">Low Stock Items</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                  <Layers size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">
                    {new Set(products.map((p) => p.category)).size}
                  </span>
                  <span className="admin-stat-label">Active Categories</span>
                </div>
              </div>

              <button
                type="button"
                className="admin-btn-add-primary"
                onClick={() => setActiveTab("add-products")}
              >
                <PlusCircle size={18} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrapper">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Filter products by title or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="admin-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Gadgets">Gadgets / Electronics</option>
                <option value="College Bags">College Bags</option>
                <option value="Stationery">Stationery</option>
                <option value="Uniform">Uniform</option>
                <option value="Books">Books</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Products Table Card */}
            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "45%" }}>PRODUCT</th>
                    <th style={{ width: "15%" }}>CATEGORY</th>
                    <th style={{ width: "15%" }}>PRICE</th>
                    <th style={{ width: "12%" }}>STOCK</th>
                    <th style={{ width: "13%", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="admin-empty-state">
                        No products match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const stockVal = p.stock !== undefined ? p.stock : 20;
                      return (
                        <tr key={p.id || p._id}>
                          <td>
                            <div className="admin-product-cell">
                              <img
                                src={p.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                                alt={p.title || p.name}
                                className="admin-product-img"
                              />
                              <div className="admin-product-meta">
                                <span className="admin-product-title">{p.title || p.name}</span>
                                <span className="admin-product-desc">{p.desc || p.description}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="admin-category-badge">{p.category || "General"}</span>
                          </td>
                          <td>
                            <span className="admin-price-text">₹{Number(p.price).toFixed(2)}</span>
                          </td>
                          <td>
                            <span className={`admin-stock-badge ${stockVal <= 5 ? "low" : ""}`}>
                              {stockVal} units
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions-cell">
                              <button
                                type="button"
                                className="admin-btn-action-edit"
                                onClick={() =>
                                  setEditingProduct({
                                    id: p.id || p._id,
                                    title: p.title || p.name,
                                    price: p.price,
                                    stock: p.stock !== undefined ? p.stock : 20,
                                    category: p.category || "Gadgets",
                                    desc: p.desc || p.description || "",
                                    image: p.image || "",
                                  })
                                }
                                title="Edit Product"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="admin-btn-action-delete"
                                onClick={() => handleDeleteProduct(p.id || p._id)}
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ADD NEW PRODUCT */}
        {activeTab === "add-products" && (
          <div className="admin-card-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Add New Product to Catalog</h2>
              <button
                type="button"
                className="admin-btn-back"
                onClick={() => setActiveTab("manage-products")}
              >
                <ArrowLeft size={16} />
                <span>Back to Catalog</span>
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="admin-form-container">
              <div className="admin-form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Casio Scientific Calculator FX-991CW"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="1250"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Initial Stock Units *</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="Gadgets">Gadgets / Electronics</option>
                    <option value="College Bags">College Bags</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Books">Books</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Specifications, semester usage, warranty info..."
                  value={newProduct.desc}
                  onChange={(e) => setNewProduct({ ...newProduct, desc: e.target.value })}
                />
              </div>

              <button type="submit" className="admin-btn-add-primary" style={{ marginTop: 12 }}>
                <PlusCircle size={18} />
                <span>Publish to Student Store</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MANAGE ORDERS */}
        {activeTab === "orders" && (
          <div className="admin-orders-container">
            <div className="admin-header" style={{ marginBottom: "16px" }}>
              <div>
                <h1 className="admin-header-title">Campus Store Orders</h1>
                <p className="admin-header-subtitle">
                  Review student orders, confirm item fulfillments, and track campus pickups.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-back"
                onClick={fetchOrders}
                disabled={ordersLoading}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={16} className={ordersLoading ? "spin" : ""} />
                <span>{ordersLoading ? "Refreshing..." : "Refresh Orders"}</span>
              </button>
            </div>

            {/* Orders Statistics Cards */}
            <div className="admin-orders-stats">
              <div className="admin-order-stat-card placed">
                <div className="admin-stat-icon" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                  <Package size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">{orders.length}</span>
                  <span className="admin-stat-label">Total Placed</span>
                </div>
              </div>

              <div className="admin-order-stat-card pending">
                <div className="admin-stat-icon" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                  <Clock size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number" style={{ color: "#d97706" }}>
                    {orders.filter((o) => o.status === "Pending" || !o.status).length}
                  </span>
                  <span className="admin-stat-label">Pending Approval</span>
                </div>
              </div>

              <div className="admin-order-stat-card ready">
                <div className="admin-stat-icon" style={{ backgroundColor: "#f3e8ff", color: "#7c3aed" }}>
                  <Store size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number" style={{ color: "#7c3aed" }}>
                    {orders.filter((o) => o.status === "Ready for Pickup").length}
                  </span>
                  <span className="admin-stat-label">Ready for Pickup</span>
                </div>
              </div>

              <div className="admin-order-stat-card revenue">
                <div className="admin-stat-icon" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
                  <Banknote size={20} />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number" style={{ color: "#059669" }}>
                    ₹{orders
                      .filter((o) => o.status !== "Cancelled")
                      .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)
                      .toLocaleString("en-IN")}
                  </span>
                  <span className="admin-stat-label">Total Volume</span>
                </div>
              </div>
            </div>

            {/* Filter pills */}
            <div className="admin-order-filters-bar">
              <div className="admin-order-filter-pills">
                {["All", "Pending", "Confirmed", "Ready for Pickup", "Completed", "Cancelled"].map((status) => {
                  const count =
                    status === "All"
                      ? orders.length
                      : orders.filter((o) => (o.status || "Pending") === status).length;
                  return (
                    <button
                      key={status}
                      type="button"
                      className={`admin-order-pill ${orderStatusFilter === status ? "active" : ""}`}
                      onClick={() => setOrderStatusFilter(status)}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="admin-search-wrapper" style={{ width: 280 }}>
                <Search size={15} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="admin-table-card" style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
                No campus orders found matching the filter.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filteredOrders.map((order) => (
                  <div key={order._id || order.id} className="admin-table-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <strong>Order #{order.orderId || (order._id && order._id.slice(-6).toUpperCase())}</strong>
                        <span style={{ fontSize: 13, color: "#64748b", marginLeft: 12 }}>
                          Placed by {order.customer?.name || "Student"} ({order.customer?.email || "peer@campus.edu"})
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`admin-category-badge`}>
                          Status: {order.status || "Pending"}
                        </span>
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                          style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12.5 }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: "#334155", marginBottom: 12 }}>
                      Pickup Spot: <strong>{order.deliveryLocation || "Campus Store Counter"}</strong>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {(order.items || []).map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "#f8fafc",
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                            alt={item.title}
                            style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</span>
                          <span style={{ fontSize: 12, color: "#64748b" }}>x{item.quantity || 1}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>
                            ₹{(item.price * (item.quantity || 1)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <div className="admin-card-section" style={{ maxWidth: 700 }}>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Administrator Profile & Security</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0" }}>
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Admin Name</span>
                <strong style={{ fontSize: 14 }}>{displayName}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Email</span>
                <strong style={{ fontSize: 14 }}>{user?.email || "admin@studentmart.com"}</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Role Access</span>
                <strong style={{ fontSize: 14, color: "#4f46e5" }}>Store Administrator</strong>
              </div>
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Assigned USN / ID</span>
                <strong style={{ fontSize: 14 }}>{user?.usn || "ADM001"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                type="button"
                className="admin-btn-add-primary"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <Edit2 size={16} />
                <span>Edit Profile Info</span>
              </button>
              <button
                type="button"
                className="admin-btn-back"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock size={16} />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="admin-modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-section-header">
              <h3 className="admin-section-title">Edit Product Details</h3>
              <button
                type="button"
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}
                onClick={() => setEditingProduct(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct}>
              <div className="admin-form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Category *</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                >
                  <option value="Gadgets">Gadgets / Electronics</option>
                  <option value="College Bags">College Bags</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Uniform">Uniform</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Product Image URL</label>
                <input
                  type="url"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingProduct.desc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-back"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-add-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsEditProfileOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-section-header">
              <h3 className="admin-section-title">Edit Administrator Profile</h3>
              <button
                type="button"
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}
                onClick={() => setIsEditProfileOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="admin-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-back"
                  onClick={() => setIsEditProfileOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-add-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-section-header">
              <h3 className="admin-section-title">Change Password</h3>
              <button
                type="button"
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}
                onClick={() => setIsPasswordModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="admin-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>New Password (min 6 characters)</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  minLength={6}
                  required
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-back"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-add-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
