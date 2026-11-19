import "../style/adminDashboard.css";
import { API_BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        // Fetch profile
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

        // Fetch products
        const productsRes = await fetch(`${API_BASE_URL}/products`);
        if (productsRes.ok) {
          const pData = await productsRes.json();
          if (pData.products && Array.isArray(pData.products)) {
            setProducts(pData.products);
            localStorage.setItem("studentmartProducts", JSON.stringify(pData.products));
          }
        }

        // Fetch orders
        const ordersRes = await fetch(`${API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          if (oData.orders && Array.isArray(oData.orders)) {
            setOrders(oData.orders);
          }
          if (oData.stats) {
            setOrderStats(oData.stats);
          }
        }
      } catch (err) {
        console.error("Admin initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  // Fetch orders helper
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
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Re-fetch orders when switching to orders tab
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // Update order status (Admin)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("studentmartToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update order status.");
      }

      setAlertMessage({ type: "success", text: data.message });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      fetchOrders();
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Delete order (Admin)
  const handleDeleteOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderNum}?`)) {
      return;
    }

    const token = localStorage.getItem("studentmartToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete order.");
      }

      setAlertMessage({ type: "success", text: data.message });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      fetchOrders();
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentmartToken");
    localStorage.removeItem("studentmartUser");
    navigate("/login", { replace: true });
  };

  // Image Upload handler for Add Product
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAlertMessage({ type: "error", text: "Please select an image file (PNG, JPG, JPEG)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewProduct((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Image Upload handler for Edit Product
  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAlertMessage({ type: "error", text: "Please select an image file (PNG, JPG, JPEG)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditingProduct((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title.trim()) {
      setAlertMessage({ type: "error", text: "Please enter product title." });
      return;
    }

    const priceNum = Number(newProduct.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setAlertMessage({ type: "error", text: "Please enter a valid price." });
      return;
    }

    const fallbackImage =
      newProduct.category === "Books"
        ? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
        : newProduct.category === "Gadgets"
        ? "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"
        : newProduct.category === "College Bags"
        ? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
        : newProduct.category === "Uniform"
        ? "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80";

    const payload = {
      title: newProduct.title.trim(),
      price: priceNum,
      stock: Number(newProduct.stock) || 20,
      category: newProduct.category || "Gadgets",
      desc: newProduct.desc.trim() || "Available for campus pickup.",
      image: newProduct.image || fallbackImage,
    };

    try {
      const token = localStorage.getItem("studentmartToken");
      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Safe JSON parsing: check content-type first to prevent SyntaxError on HTML errors
      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        console.error("Non-JSON API response from server:", res.status, rawText);
        if (!res.ok) {
          if (res.status === 413) {
            throw new Error("Uploaded image is too large. Please select an image under 10MB or use an image URL.");
          }
          if (res.status === 401) {
            throw new Error("Admin session expired. Please log in again.");
          }
          if (res.status === 403) {
            throw new Error("Access denied. Admin privileges required.");
          }
          if (res.status === 404) {
            throw new Error("Cannot reach backend API (404). Please ensure backend server is running on port 5001.");
          }
          throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || "Unexpected response"}`);
        }
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to publish product.");
      }

      const saved = data.product || { ...payload, id: Date.now().toString() };
      const updated = [saved, ...products.filter((p) => (p.id || p._id) !== (saved.id || saved._id))];
      setProducts(updated);
      localStorage.setItem("studentmartProducts", JSON.stringify(updated));

      setNewProduct({
        title: "",
        price: "",
        stock: 20,
        category: "Gadgets",
        desc: "",
        image: "",
      });

      setAlertMessage({
        type: "success",
        text: `Product "${saved.title}" published to catalog successfully!`,
      });

      setActiveTab("manage-products");
    } catch (err) {
      console.error("Add Product error:", err);
      setAlertMessage({ type: "error", text: err.message || "Unable to add product." });
    }
  };

  // Save Edit Product
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

      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        console.error("Non-JSON API response from server:", res.status, rawText);
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || "Unable to update product"}`);
        }
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to update product.");
      }

      const updatedItem = data.product || editingProduct;
      const updated = products.map((p) =>
        (p.id === editingProduct.id || p._id === editingProduct.id) ? { ...p, ...updatedItem } : p
      );
      setProducts(updated);
      localStorage.setItem("studentmartProducts", JSON.stringify(updated));

      setAlertMessage({
        type: "success",
        text: `Product "${updatedItem.title}" updated successfully!`,
      });
      setEditingProduct(null);
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message || "Unable to update product." });
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this product from the catalog?")) {
      return;
    }

    try {
      const token = localStorage.getItem("studentmartToken");
      if (token) {
        await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const updated = products.filter((p) => p.id !== productId && p._id !== productId);
      setProducts(updated);
      localStorage.setItem("studentmartProducts", JSON.stringify(updated));

      setAlertMessage({
        type: "success",
        text: "Product deleted from catalog.",
      });
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message || "Unable to delete product." });
    }
  };

  // Save Profile Edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("studentmartToken");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      const updatedUser = data.user || { ...user, ...profileForm };
      setUser(updatedUser);
      localStorage.setItem("studentmartUser", JSON.stringify(updatedUser));
      setAlertMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditProfileOpen(false);
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setAlertMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    const token = localStorage.getItem("studentmartToken");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      setPasswordForm({ currentPassword: "", newPassword: "" });
      setAlertMessage({ type: "success", text: "Password updated successfully!" });
      setIsPasswordModalOpen(false);
    } catch (err) {
      setAlertMessage({ type: "error", text: err.message });
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const title = (p.title || p.name || "").toLowerCase();
    const desc = (p.desc || p.description || "").toLowerCase();
    const matchesSearch = term === "" || title.includes(term) || desc.includes(term);
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Metrics matching screenshot
  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => (p.stock !== undefined ? p.stock : 20) <= 5).length;
  const uniqueCategoriesCount = Array.from(new Set(products.map((p) => p.category || "Books"))).length;

  const displayName = user?.name || "vijay";
  const avatarLetter = (user?.name || "V").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", color: "#64748b" }}>
        Loading Admin Portal...
      </div>
    );
  }

  return (
    <div className="admin-portal-wrapper">
      {/* =========================================
          LEFT SIDEBAR (MATCHING SCREENSHOT)
          ========================================= */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">StudentMart</span>
            <span className="admin-brand-badge">ADMIN PORTAL</span>
          </div>
        </div>

        {/* User Card */}
        <div className="admin-user-card">
          <div className="admin-avatar">{avatarLetter}</div>
          <div className="admin-user-info">
            <span className="admin-user-name">{displayName}</span>
            <span className="admin-user-role">Campus Store Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "manage-products" ? "active" : ""}`}
            onClick={() => setActiveTab("manage-products")}
          >
            <span className="admin-nav-icon">📋</span>
            Manage Products
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "add-products" ? "active" : ""}`}
            onClick={() => setActiveTab("add-products")}
          >
            <span className="admin-nav-icon">➕</span>
            Add Products
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="admin-nav-icon">📦</span>
            Manage Orders
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="admin-nav-icon">👤</span>
            Profile
          </button>
        </nav>

        {/* Logout */}
        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* =========================================
          MAIN CONTENT
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

        {/* =========================================
            TAB 1: MANAGE PRODUCTS (CATALOG VIEW)
            ========================================= */}
        {activeTab === "manage-products" && (
          <div>
            {/* Header */}
            <div className="admin-header">
              <div>
                <h1 className="admin-header-title">Product Catalog Management</h1>
                <p className="admin-header-subtitle">
                  View, edit inventory, update prices, or remove products
                </p>
              </div>

              <div className="admin-role-badge">
                <span>🛡️</span> Role: Administrator
              </div>
            </div>

            {/* 4 Stat Cards Row */}
            <div className="admin-stats-row">
              {/* Card 1: Total Products */}
              <div className="admin-stat-card">
                <div className="admin-stat-icon">📦</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">{totalProductsCount}</span>
                  <span className="admin-stat-label">Total Products</span>
                </div>
              </div>

              {/* Card 2: Low Stock Items */}
              <div className="admin-stat-card">
                <div className="admin-stat-icon">⚠️</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">{lowStockCount}</span>
                  <span className="admin-stat-label">Low Stock Items</span>
                </div>
              </div>

              {/* Card 3: Categories */}
              <div className="admin-stat-card">
                <div className="admin-stat-icon">🏷️</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">{uniqueCategoriesCount}</span>
                  <span className="admin-stat-label">Categories</span>
                </div>
              </div>

              {/* Card 4: Action Button */}
              <button
                type="button"
                className="admin-btn-add-primary"
                onClick={() => setActiveTab("add-products")}
              >
                <span>+</span> Add New Product
              </button>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrapper">
                <span className="admin-search-icon">🔍</span>
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Filter products by title..."
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
                <option value="Gadgets">Gadgets</option>
                <option value="College Bags">College Bags</option>
                <option value="Stationery">Stationery</option>
                <option value="Uniform">Uniform</option>
                <option value="Books">Books</option>
                <option value="Essentials">Essentials</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Product Table Card */}
            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "42%" }}>PRODUCT</th>
                    <th style={{ width: "15%" }}>CATEGORY</th>
                    <th style={{ width: "15%" }}>PRICE</th>
                    <th style={{ width: "14%" }}>STOCK</th>
                    <th style={{ width: "14%", textAlign: "right" }}>ACTIONS</th>
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
                                src={p.image}
                                alt={p.title || p.name}
                                className="admin-product-img"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80";
                                }}
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
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className="admin-btn-action-delete"
                                onClick={() => handleDeleteProduct(p.id || p._id)}
                              >
                                🗑️ Delete
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

        {/* =========================================
            TAB 2: ADD PRODUCTS
            ========================================= */}
        {activeTab === "add-products" && (
          <div className="admin-card-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Add New Product to Catalog</h2>
              <button
                type="button"
                className="admin-btn-back"
                onClick={() => setActiveTab("manage-products")}
              >
                ← Back to Catalog
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="admin-form-group">
                <label>Product Name / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Casio FX-991CW Scientific Calculator"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1250"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Stock Units *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="Gadgets">Gadgets</option>
                  <option value="College Bags">College Bags</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Uniform">Uniform</option>
                  <option value="Books">Books</option>
                  <option value="Essentials">Essentials</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Condition, semester details, warranty, or inclusions..."
                  value={newProduct.desc}
                  onChange={(e) => setNewProduct({ ...newProduct, desc: e.target.value })}
                />
              </div>

              {/* Image Section */}
              <div className="admin-form-group">
                <label>Product Image</label>
                <div className="admin-image-dropzone">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                  />
                  <div style={{ fontSize: "24px", marginBottom: "4px" }}>📸</div>
                  <strong style={{ display: "block", color: "#334155", fontSize: "13px" }}>
                    Click or drag file to upload product image
                  </strong>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    PNG, JPG, or JPEG up to 10MB
                  </span>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <input
                    type="url"
                    placeholder="Or paste an image web URL (https://...)"
                    value={newProduct.image.startsWith("data:") ? "" : newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>

                {newProduct.image && (
                  <div className="admin-preview-box">
                    <img src={newProduct.image} alt="Preview" className="admin-preview-img" />
                    <button
                      type="button"
                      className="admin-btn-remove-preview"
                      onClick={() => setNewProduct({ ...newProduct, image: "" })}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "20px" }}>
                <button
                  type="submit"
                  className="admin-btn-add-primary"
                  style={{ width: "100%", padding: "12px" }}
                >
                  Publish to Product Catalog
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================
            TAB 3: MANAGE ORDERS (REAL-TIME E-COMMERCE)
            ========================================= */}
        {activeTab === "orders" && (
          <div className="admin-orders-container">
            {/* Header */}
            <div className="admin-header" style={{ marginBottom: "16px" }}>
              <div>
                <h1 className="admin-header-title">Campus Store Orders</h1>
                <p className="admin-header-subtitle">
                  Review student orders, confirm item fulfillments, and track campus pickups
                </p>
              </div>
              <button
                type="button"
                className="admin-btn-back"
                onClick={fetchOrders}
                disabled={ordersLoading}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px" }}
              >
                <span>🔄</span> {ordersLoading ? "Refreshing..." : "Refresh Orders"}
              </button>
            </div>

            {/* Orders Statistics Cards */}
            <div className="admin-orders-stats">
              <div className="admin-order-stat-card placed">
                <div className="admin-stat-icon">📦</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number">{orderStats.totalOrders || orders.length}</span>
                  <span className="admin-stat-label">Total Placed</span>
                </div>
              </div>

              <div className="admin-order-stat-card pending">
                <div className="admin-stat-icon">⏳</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number" style={{ color: "#d97706" }}>
                    {orderStats.pendingOrders || orders.filter((o) => o.status === "Pending").length}
                  </span>
                  <span className="admin-stat-label">Pending Approval</span>
                </div>
              </div>

              <div className="admin-order-stat-card ready">
                <div className="admin-stat-icon">🏪</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number" style={{ color: "#7c3aed" }}>
                    {orderStats.readyOrders || orders.filter((o) => o.status === "Ready for Pickup").length}
                  </span>
                  <span className="admin-stat-label">Ready for Pickup</span>
                </div>
              </div>

              <div className="admin-order-stat-card revenue">
                <div className="admin-stat-icon">💰</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-number" style={{ color: "#059669" }}>
                    ₹{orderStats.totalRevenue !== undefined
                      ? orderStats.totalRevenue
                      : orders
                          .filter((o) => o.status !== "Cancelled")
                          .reduce((s, o) => s + (o.totalAmount || 0), 0)}
                  </span>
                  <span className="admin-stat-label">Total Revenue</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="admin-order-filters-bar">
              <div className="admin-order-filter-pills">
                {["All", "Pending", "Confirmed", "Ready for Pickup", "Completed", "Cancelled"].map((status) => {
                  const count =
                    status === "All"
                      ? orders.length
                      : orders.filter((o) => o.status === status).length;
                  return (
                    <button
                      key={status}
                      type="button"
                      className={`admin-filter-pill ${orderStatusFilter === status ? "active" : ""}`}
                      onClick={() => setOrderStatusFilter(status)}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                className="admin-order-search"
                placeholder="Search by Order #, student name, USN..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>

            {/* Order Cards List */}
            {ordersLoading ? (
              <div className="admin-empty-state">
                <p>Loading campus store orders...</p>
              </div>
            ) : (() => {
              const filteredOrders = orders.filter((order) => {
                const matchesStatus =
                  orderStatusFilter === "All" || order.status === orderStatusFilter;
                const query = orderSearch.toLowerCase().trim();
                const matchesQuery =
                  !query ||
                  (order.orderId && order.orderId.toLowerCase().includes(query)) ||
                  (order.customerName && order.customerName.toLowerCase().includes(query)) ||
                  (order.customerUsn && order.customerUsn.toLowerCase().includes(query)) ||
                  (order.customerEmail && order.customerEmail.toLowerCase().includes(query));
                return matchesStatus && matchesQuery;
              });

              if (filteredOrders.length === 0) {
                return (
                  <div className="admin-empty-state" style={{ background: "#ffffff", padding: "40px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                    <h3 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>No orders found</h3>
                    <p style={{ color: "#64748b", fontSize: "13.5px" }}>
                      {orderSearch || orderStatusFilter !== "All"
                        ? "Try adjusting your filter or search query."
                        : "Orders placed by students will appear here in real time."}
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {filteredOrders.map((order) => {
                    const statusClass = (order.status || "Pending").toLowerCase().replace(/\s+/g, "-");
                    return (
                      <div key={order._id || order.orderId} className="admin-order-card">
                        {/* Header */}
                        <div className="admin-order-card-header">
                          <div className="admin-order-id-group">
                            <span className="admin-order-id">Order #{order.orderId}</span>
                            <span className="admin-order-time">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className={`status-badge ${statusClass}`}>
                              {order.status === "Pending" && "Pending"}
                              {order.status === "Confirmed" && "Confirmed"}
                              {order.status === "Ready for Pickup" && "Ready for Pickup"}
                              {order.status === "Completed" && "Completed"}
                              {order.status === "Cancelled" && "Cancelled"}
                            </span>

                            {/* Status Quick Dropdown */}
                            <select
                              className="admin-status-dropdown"
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Ready for Pickup">Ready for Pickup</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer & Delivery Grid */}
                        <div className="admin-order-details-grid">
                          <div className="admin-order-info-block">
                            <strong>Student Customer</strong>
                            <p style={{ fontWeight: "700" }}>{order.customerName || "Student"}</p>
                            <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                              USN: <strong>{order.customerUsn || "N/A"}</strong>
                            </p>
                            <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                              Email: {order.customerEmail || "N/A"}
                              {order.customerPhone ? ` · Phone: ${order.customerPhone}` : ""}
                            </p>
                          </div>

                          <div className="admin-order-info-block">
                            <strong>Campus Handover & Notes</strong>
                            <p style={{ fontWeight: "600", color: "#0f172a" }}>
                              📍 {order.deliveryLocation || "Campus Store Counter"}
                            </p>
                            {order.deliveryNotes ? (
                              <p style={{ fontSize: "12.5px", color: "#475569", marginTop: "4px" }}>
                                📝 Note: {order.deliveryNotes}
                              </p>
                            ) : (
                              <p style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                                No special notes provided
                              </p>
                            )}
                            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                              💳 {order.paymentMethod || "Campus Cash / UPI"}
                            </p>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="admin-order-items-list">
                          {order.items &&
                            order.items.map((item, idx) => (
                              <div key={idx} className="admin-order-item-row">
                                <div className="admin-order-item-left">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="admin-order-item-img"
                                    />
                                  ) : (
                                    <div
                                      className="admin-order-item-img"
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "#f1f5f9",
                                        fontSize: "20px",
                                      }}
                                    >
                                      🛍️
                                    </div>
                                  )}
                                  <div>
                                    <strong style={{ display: "block", color: "#0f172a", fontSize: "13.5px" }}>
                                      {item.title}
                                    </strong>
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                                      {item.category || "General"} · Qty: {item.quantity || 1} · ₹{item.price} each
                                    </span>
                                  </div>
                                </div>

                                <strong style={{ color: "#0f172a", fontSize: "14px" }}>
                                  ₹{(Number(item.price) || 0) * (item.quantity || 1)}
                                </strong>
                              </div>
                            ))}
                        </div>

                        {/* Footer & Actions */}
                        <div className="admin-order-footer-row">
                          <div className="admin-order-total-block">
                            <span style={{ fontSize: "13px", color: "#64748b" }}>Order Total:</span>
                            <span className="admin-order-total-price">₹{order.totalAmount}</span>
                          </div>

                          <div className="admin-order-actions-group">
                            {order.status === "Pending" && (
                              <button
                                type="button"
                                className="btn-status-confirm"
                                onClick={() => handleUpdateOrderStatus(order._id, "Confirmed")}
                              >
                                ✓ Confirm Order
                              </button>
                            )}

                            {(order.status === "Pending" || order.status === "Confirmed") && (
                              <button
                                type="button"
                                className="btn-status-ready"
                                onClick={() => handleUpdateOrderStatus(order._id, "Ready for Pickup")}
                              >
                                Ready for Pickup
                              </button>
                            )}

                            {order.status === "Ready for Pickup" && (
                              <button
                                type="button"
                                className="btn-status-complete"
                                onClick={() => handleUpdateOrderStatus(order._id, "Completed")}
                              >
                                Mark Completed
                              </button>
                            )}

                            {order.status !== "Cancelled" && order.status !== "Completed" && (
                              <button
                                type="button"
                                className="btn-status-cancel"
                                onClick={() => handleUpdateOrderStatus(order._id, "Cancelled")}
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              type="button"
                              className="admin-btn-action-delete"
                              title="Delete Order"
                              onClick={() => handleDeleteOrder(order._id, order.orderId)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* =========================================
            TAB 4: PROFILE
            ========================================= */}
        {activeTab === "profile" && (
          <div className="admin-card-section" style={{ maxWidth: "560px" }}>
            <div className="admin-section-header">
              <h2 className="admin-section-title">Administrator Profile</h2>
              <span className="admin-role-badge">Campus Store Admin</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div className="admin-avatar" style={{ width: "54px", height: "54px", fontSize: "22px" }}>
                {avatarLetter}
              </div>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#0f172a" }}>{displayName}</h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{user?.email || "admin@studentmart.com"}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>USN / Admin ID:</span>
                <strong style={{ color: "#0f172a", fontSize: "13px" }}>{user?.usn || "ADM001"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>Department:</span>
                <strong style={{ color: "#0f172a", fontSize: "13px" }}>{user?.department || "CSE"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>Role:</span>
                <strong style={{ color: "#7c3aed", fontSize: "13px" }}>Administrator</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="admin-btn-action-edit"
                style={{ padding: "8px 16px", fontSize: "13px" }}
                onClick={() => setIsEditProfileOpen(true)}
              >
                ✏️ Edit Profile
              </button>
              <button
                type="button"
                className="admin-btn-back"
                style={{ padding: "8px 16px", fontSize: "13px" }}
                onClick={() => setIsPasswordModalOpen(true)}
              >
                🔒 Change Password
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =========================================
          EDIT PRODUCT MODAL
          ========================================= */}
      {editingProduct && (
        <div className="admin-modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-section-header">
              <h3 className="admin-section-title">Edit Catalog Product</h3>
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

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Stock Units *</label>
                  <input
                    type="number"
                    min="0"
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
                  <option value="Gadgets">Gadgets</option>
                  <option value="College Bags">College Bags</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Uniform">Uniform</option>
                  <option value="Books">Books</option>
                  <option value="Essentials">Essentials</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingProduct.desc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                />
              </div>

              {/* Edit Image */}
              <div className="admin-form-group">
                <label>Product Image</label>
                <div className="admin-image-dropzone" style={{ padding: "14px" }}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleEditImageUpload}
                  />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Click to choose a replacement image file
                  </span>
                </div>

                <div style={{ marginTop: "6px" }}>
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={editingProduct.image.startsWith("data:") ? "" : editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  />
                </div>

                {editingProduct.image && (
                  <div className="admin-preview-box">
                    <img src={editingProduct.image} alt="Preview" className="admin-preview-img" />
                    <button
                      type="button"
                      className="admin-btn-remove-preview"
                      onClick={() => setEditingProduct({ ...editingProduct, image: "" })}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-back"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-add-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          EDIT PROFILE MODAL
          ========================================= */}
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
                <label>Department</label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
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
                <button type="submit" className="admin-btn-add-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          CHANGE PASSWORD MODAL
          ========================================= */}
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
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
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
                <button type="submit" className="admin-btn-add-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>
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
