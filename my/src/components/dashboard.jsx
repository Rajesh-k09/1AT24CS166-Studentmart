import "../style/dashboard.css";
import { API_BASE_URL } from "../config";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Icons from lucide-react
import {
  Tag,
  Package,
  Clock,
  Heart,
  ShoppingBag,
  Sparkles,
  BookOpen,
  Laptop,
  FileText,
  Armchair,
  Shirt,
  Trophy,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  SlidersHorizontal,
  Lock,
  User as UserIcon,
  Bell,
  Mail,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

// Sub-components
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import StatCard from "./StatCard";
import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import SellModal from "./SellModal";
import EmptyState from "./EmptyState";
import ChatMessages from "./ChatMessages";

export default function Dashboard({ role: propRole, initialTab = "dashboard" }) {
  const navigate = useNavigate();

  // Navigation & layout state
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

  // User & Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile & password modal states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
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

  // Toast alert notification state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceSort, setPriceSort] = useState("default");

  // Initial Seed / Fallback catalog
  const defaultProducts = useMemo(() => [
    {
      id: "prod-1",
      _id: "prod-1",
      title: "Casio FX-991CW Scientific Calculator",
      name: "Casio FX-991CW Scientific Calculator",
      price: 1250,
      category: "Electronics",
      condition: "Like New",
      desc: "Advanced engineering calculator with solar + dual battery backup. Approved for university exams.",
      image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
      location: "Central Library Counter",
      sellerName: "Prajwal M.",
      featured: true,
      soldCount: 14,
    },
    {
      id: "prod-2",
      _id: "prod-2",
      title: "Campus Waterproof Laptop Backpack",
      name: "Campus Waterproof Laptop Backpack",
      price: 899,
      category: "Accessories",
      condition: "Brand New",
      desc: "Durable 25L backpack with 15.6 inch padded laptop sleeve, USB charging port, and water bottle holder.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      location: "Hostel Block B",
      sellerName: "Sneha P.",
      featured: true,
      soldCount: 9,
    },
    {
      id: "prod-3",
      _id: "prod-3",
      title: "Engineering Drawing & Drafting Kit",
      name: "Engineering Drawing & Drafting Kit",
      price: 450,
      category: "Notes",
      condition: "Gently Used",
      desc: "Complete mini-drafter, compass set, set squares, and scale sheet clips in hardcover travel case.",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
      location: "Mechanical Dept Block",
      sellerName: "Rahul S.",
      featured: true,
      soldCount: 22,
    },
    {
      id: "prod-4",
      _id: "prod-4",
      title: "VTU Higher Engineering Mathematics (Sem 3 & 4)",
      name: "VTU Higher Engineering Mathematics (Sem 3 & 4)",
      price: 499,
      category: "Books",
      condition: "Like New",
      desc: "Latest edition with step-by-step solved question papers and clear notes. Zero markings.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      location: "Library Reading Room",
      sellerName: "Ananya K.",
      featured: false,
      soldCount: 7,
    },
    {
      id: "prod-5",
      _id: "prod-5",
      title: "Ergonomic Mesh Study Desk Chair",
      name: "Ergonomic Mesh Study Desk Chair",
      price: 1850,
      category: "Furniture",
      condition: "Gently Used",
      desc: "Adjustable height with breathable lumbar support mesh back. Perfect for long study marathons.",
      image: "https://images.unsplash.com/photo-1580481077195-c3a8210ae938?w=600&auto=format&fit=crop&q=80",
      location: "Dorm Campus Wing 2",
      sellerName: "Vikram R.",
      featured: false,
      soldCount: 3,
    },
    {
      id: "prod-6",
      _id: "prod-6",
      title: "Yonex Badminton Racket with Thermal Cover",
      name: "Yonex Badminton Racket with Thermal Cover",
      price: 950,
      category: "Sports",
      condition: "Like New",
      desc: "Graphite isometric frame with high-tension strings. Used only for college tournament practice.",
      image: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600&auto=format&fit=crop&q=80",
      location: "Indoor Sports Complex",
      sellerName: "Rohan D.",
      featured: false,
      soldCount: 5,
    },
  ], []);

  // Persistent products
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("studentmartProducts");
      return saved ? JSON.parse(saved) : defaultProducts;
    } catch {
      return defaultProducts;
    }
  });

  // Persistent Shopping Cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("studentmartCart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Wishlist
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("studentmartWishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent User's Own Listings
  const [myListings, setMyListings] = useState(() => {
    try {
      const saved = localStorage.getItem("studentmartMyListings");
      return saved ? JSON.parse(saved) : [
        {
          id: "listing-1",
          title: "Engineering Mathematics Textbook (3rd Sem)",
          price: 450,
          category: "Books",
          condition: "Like New",
          status: "Active",
          views: 38,
          createdAt: "2 days ago",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        },
      ];
    } catch {
      return [];
    }
  });

  // Customer Orders State
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("Campus Store Main Counter / Direct Handover");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem("studentmartCart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("studentmartWishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem("studentmartMyListings", JSON.stringify(myListings));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [myListings]);

  // Fetch backend products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          localStorage.setItem("studentmartProducts", JSON.stringify(data.products));
        }
      }
    } catch (err) {
      console.warn("API unreachable, using stored products catalog:", err);
    }
  };

  // Fetch customer orders from backend
  const fetchCustomerOrders = async () => {
    const token = localStorage.getItem("studentmartToken");
    if (!token) return;
    try {
      setOrdersLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setCustomerOrders(data.orders);
        }
      }
    } catch (err) {
      console.warn("Could not fetch customer orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch logged in user profile
  useEffect(() => {
    fetchProducts();
    fetchCustomerOrders();

    const fetchUser = async () => {
      const token = localStorage.getItem("studentmartToken");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("studentmartToken");
          localStorage.removeItem("studentmartUser");
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();
        const userData = data.user || data;

        if (userData) {
          setUser(userData);
          setEditForm({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            department: userData.department || userData.course || "Computer Science & Engineering",
            year: userData.year || "3rd Year (2026)",
            address: userData.address || userData.college || "Atria Institute of Technology, Bangalore",
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const effectiveRole = propRole || user?.role || "customer";
  const isAdmin = effectiveRole === "admin";

  const handleLogout = () => {
    localStorage.removeItem("studentmartToken");
    localStorage.removeItem("studentmartUser");
    navigate("/login", { replace: true });
  };

  // Add to cart with quantity increment
  const handleAddToCart = (product) => {
    const prodId = product._id || product.id;
    const existingIndex = cart.findIndex((item) => (item._id || item.id) === prodId);

    let updated;
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: (updated[existingIndex].quantity || 1) + 1,
      };
    } else {
      updated = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updated);
    showToast("success", `Added "${product.title || product.name}" to cart!`);
  };

  // Direct Buy Now handler
  const handleBuyNow = (product) => {
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  // Cart quantity controls
  const handleUpdateQuantity = (idx, delta) => {
    const updated = [...cart];
    const currentQty = updated[idx].quantity || 1;
    const nextQty = currentQty + delta;

    if (nextQty <= 0) {
      updated.splice(idx, 1);
    } else {
      updated[idx] = { ...updated[idx], quantity: nextQty };
    }
    setCart(updated);
  };

  const handleRemoveFromCart = (idx) => {
    const updated = [...cart];
    updated.splice(idx, 1);
    setCart(updated);
  };

  // Wishlist toggle handler
  const handleToggleWishlist = (product) => {
    const prodId = product._id || product.id;
    const exists = wishlist.some((item) => (item._id || item.id) === prodId);

    let updated;
    if (exists) {
      updated = wishlist.filter((item) => (item._id || item.id) !== prodId);
      showToast("neutral", `Removed from your wishlist.`);
    } else {
      updated = [...wishlist, product];
      showToast("success", `Saved "${product.title || product.name}" to your wishlist!`);
    }
    setWishlist(updated);
  };

  // Student Post Listing Handler
  const handleAddStudentListing = (newListingData) => {
    const newListing = {
      id: `listing-${Date.now()}`,
      _id: `listing-${Date.now()}`,
      title: newListingData.title,
      name: newListingData.title,
      price: Number(newListingData.price),
      category: newListingData.category,
      desc: newListingData.desc,
      image: newListingData.image,
      condition: newListingData.condition,
      location: newListingData.location,
      sellerName: user?.name || "Verified Student Peer",
      status: "Active",
      views: 1,
      createdAt: "Just now",
    };

    setMyListings([newListing, ...myListings]);
    setProducts([newListing, ...products]);
    showToast("success", `"${newListing.title}" posted to campus marketplace!`);
  };

  // Delete student listing
  const handleDeleteListing = (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setMyListings(myListings.filter((l) => l.id !== listingId && l._id !== listingId));
      setProducts(products.filter((p) => p.id !== listingId && p._id !== listingId));
      showToast("neutral", "Listing removed from campus marketplace.");
    }
  };

  // Place Campus Order handler
  const handlePlaceCampusOrder = async () => {
    if (cart.length === 0) return;

    const token = localStorage.getItem("studentmartToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const computedTotal = cart.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0
      );

      const payload = {
        items: cart.map((item) => ({
          productId: item._id || item.id,
          title: item.title || item.name,
          price: Number(item.price),
          quantity: item.quantity || 1,
          image: item.image || "",
          category: item.category || "General",
        })),
        totalAmount: computedTotal,
        deliveryLocation,
        deliveryNotes,
        paymentMethod: "Campus Cash on Delivery (COD) / UPI on Handover",
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      setCart([]);
      setIsCartOpen(false);
      showToast("success", `🎉 Order #${data.order?.orderId || "SM-" + Date.now().toString().slice(-4)} placed!`);

      await fetchCustomerOrders();
      setActiveTab("orders");
    } catch (err) {
      console.error("Order error:", err);
      showToast("error", err.message || "Order placement failed.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Profile Update Handler
  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("studentmartToken");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      const updated = data.user || { ...user, ...editForm };
      setUser(updated);
      localStorage.setItem("studentmartUser", JSON.stringify(updated));
      setIsEditProfileModalOpen(false);
      showToast("success", "Profile updated successfully!");
    } catch (err) {
      showToast("error", err.message);
    }
  };

  // Password Change Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      showToast("error", "New password must be at least 6 characters.");
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
      showToast("success", "Password updated successfully!");
    } catch (err) {
      showToast("error", err.message);
    }
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const title = (item.title || item.name || "").toLowerCase();
      const desc = (item.desc || item.description || "").toLowerCase();
      const cat = (item.category || "").toLowerCase();

      const matchesSearch =
        term === "" || title.includes(term) || desc.includes(term) || cat.includes(term);

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (priceSort === "low-to-high") return Number(a.price) - Number(b.price);
      if (priceSort === "high-to-low") return Number(b.price) - Number(a.price);
      return 0;
    });
  }, [filteredProducts, priceSort]);

  // Categories list with counts
  const categoryList = [
    { name: "Books", icon: BookOpen, color: "#4f46e5" },
    { name: "Electronics", icon: Laptop, color: "#0ea5e9" },
    { name: "Notes", icon: FileText, color: "#10b981" },
    { name: "Furniture", icon: Armchair, color: "#f59e0b" },
    { name: "Accessories", icon: Tag, color: "#8b5cf6" },
    { name: "Sports", icon: Trophy, color: "#f43f5e" },
    { name: "Other", icon: HelpCircle, color: "#64748b" },
  ];

  // Recommended / Trending Products
  const recommendedProducts = useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

  // Cart total sum
  const cartSubtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );
  }, [cart]);

  if (loading) {
    return (
      <div className="portal-container" style={{ alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="btn-spinner" style={{ width: 36, height: 36, borderColor: "rgba(99, 102, 241, 0.2)", borderTopColor: "#4f46e5" }} />
          <h3 style={{ fontSize: 16, color: "#475569", fontWeight: 600 }}>Loading StudentMart...</h3>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.usn || "Student";

  return (
    <div className="portal-container">
      {/* =========================================
          1. SIDEBAR NAVIGATION
          ========================================= */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        cartCount={cart.length}
        wishlistCount={wishlist.length}
        ordersCount={customerOrders.length}
        unreadMessagesCount={2}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        isAdmin={isAdmin}
      />

      {/* =========================================
          MAIN APPLICATION WORKSPACE
          ========================================= */}
      <div className="main-content-area">
        {/* =========================================
            2. TOP NAVIGATION BAR
            ========================================= */}
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          cartCount={cart.reduce((c, i) => c + (i.quantity || 1), 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSellModal={() => setIsSellModalOpen(true)}
          user={user}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />

        {/* =========================================
            PAGE CONTENT SWITCHER
            ========================================= */}
        <main className="dashboard-page-content">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "dashboard" && (
            <>
              {/* 3. Welcome Section Banner */}
              <section className="dashboard-welcome-banner">
                <div className="welcome-banner-decor-glow" />
                <div className="welcome-banner-copy">
                  <div className="welcome-campus-pill">
                    <Sparkles size={14} />
                    <span>Campus Marketplace · Verified Community</span>
                  </div>

                  <div className="welcome-title-row">
                    <h2>Good morning, {displayName}! 👋</h2>
                  </div>

                  <p className="welcome-subtitle">
                    Find great deals and discover items from your campus. Save money, recycle essentials, and meet verified students safely.
                  </p>

                  <div className="welcome-banner-actions">
                    <button
                      type="button"
                      className="btn-banner-primary"
                      onClick={() => setActiveTab("view-products")}
                    >
                      <ShoppingBag size={16} />
                      <span>Explore Marketplace</span>
                    </button>

                    <button
                      type="button"
                      className="btn-banner-secondary"
                      onClick={() => setIsSellModalOpen(true)}
                    >
                      <PlusCircle size={16} />
                      <span>Post Listing</span>
                    </button>
                  </div>
                </div>

                <div className="welcome-banner-badge-preview">
                  <span className="preview-stat-number">{products.length}</span>
                  <span className="preview-stat-label">Available Items Near You</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#34d399", marginTop: 4 }}>
                    <CheckCircle2 size={13} />
                    <span>100% Student Verified</span>
                  </div>
                </div>
              </section>

              {/* 4. Statistics Cards */}
              <section className="statistics-cards-grid">
                <StatCard
                  title="Total Listings"
                  value={products.length}
                  icon={Package}
                  trend="+8 this week"
                  trendPositive={true}
                  accentColor="indigo"
                  onClick={() => setActiveTab("view-products")}
                />
                <StatCard
                  title="Items Sold"
                  value={myListings.length > 0 ? "2" : "0"}
                  icon={Tag}
                  trend="₹1,450 earned"
                  trendPositive={true}
                  accentColor="emerald"
                  onClick={() => setActiveTab("my-listings")}
                />
                <StatCard
                  title="Active Orders"
                  value={customerOrders.length}
                  icon={Clock}
                  trend={customerOrders.length > 0 ? "In Progress" : "No active orders"}
                  trendPositive={customerOrders.length > 0}
                  accentColor="amber"
                  onClick={() => setActiveTab("orders")}
                />
                <StatCard
                  title="Wishlist Items"
                  value={wishlist.length}
                  icon={Heart}
                  trend="Saved items"
                  trendPositive={true}
                  accentColor="rose"
                  onClick={() => setActiveTab("wishlist")}
                />
              </section>

              {/* 6. Categories Section */}
              <section className="dashboard-section">
                <div className="section-header-row">
                  <div className="section-header-title">
                    <h3>Explore Categories</h3>
                    <p>Browse student essentials by category</p>
                  </div>
                  <button
                    type="button"
                    className="section-view-all-btn"
                    onClick={() => {
                      setSelectedCategory("All");
                      setActiveTab("view-products");
                    }}
                  >
                    <span>View all categories</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="categories-grid">
                  {categoryList.map((cat) => {
                    const count = products.filter((p) => p.category === cat.name).length;
                    return (
                      <CategoryCard
                        key={cat.name}
                        category={cat.name}
                        icon={cat.icon}
                        count={count}
                        accentColor={cat.color}
                        isSelected={selectedCategory === cat.name}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setActiveTab("view-products");
                        }}
                      />
                    );
                  })}
                </div>
              </section>

              {/* 7. Recommended / Trending Products */}
              <section className="dashboard-section">
                <div className="section-header-row">
                  <div className="section-header-title">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3>Trending on Campus</h3>
                      <span className="nav-item-badge rose">Hot Deals</span>
                    </div>
                    <p>Highly requested textbooks and gear this exam week</p>
                  </div>
                </div>

                <div className="products-responsive-grid">
                  {recommendedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id || prod._id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                      onViewDetails={setSelectedProductForDetail}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.some((w) => (w.id || w._id) === (prod.id || prod._id))}
                    />
                  ))}
                </div>
              </section>

              {/* 5. Recently Added Products */}
              <section className="dashboard-section">
                <div className="section-header-row">
                  <div className="section-header-title">
                    <h3>Recently Added Products</h3>
                    <p>Fresh listings posted by students across faculties</p>
                  </div>
                  <button
                    type="button"
                    className="section-view-all-btn"
                    onClick={() => setActiveTab("view-products")}
                  >
                    <span>Browse complete catalog ({products.length})</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="products-responsive-grid">
                  {products.slice(0, 6).map((prod) => (
                    <ProductCard
                      key={prod.id || prod._id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                      onViewDetails={setSelectedProductForDetail}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.some((w) => (w.id || w._id) === (prod.id || prod._id))}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* TAB 2: BROWSE ALL PRODUCTS */}
          {(activeTab === "view-products" || activeTab === "products") && (
            <div className="dashboard-section">
              <div className="section-header-row">
                <div className="section-header-title">
                  <h2>Campus Marketplace</h2>
                  <p>Search and filter pre-loved student textbooks, calculators, and gadgets</p>
                </div>
                <button
                  type="button"
                  className="btn-banner-primary"
                  onClick={() => setIsSellModalOpen(true)}
                >
                  <PlusCircle size={16} />
                  <span>Sell an Item</span>
                </button>
              </div>

              {/* Filter bar */}
              <div className="browse-filter-bar">
                <div className="category-pill-filter-list">
                  <button
                    type="button"
                    className={`category-pill-filter-btn ${selectedCategory === "All" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("All")}
                  >
                    All Items ({products.length})
                  </button>
                  {categoryList.map((cat) => {
                    const count = products.filter((p) => p.category === cat.name).length;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        className={`category-pill-filter-btn ${selectedCategory === cat.name ? "active" : ""}`}
                        onClick={() => setSelectedCategory(cat.name)}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="browse-sort-controls">
                  <span className="sort-label">Sort by:</span>
                  <select
                    className="sort-select"
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value)}
                  >
                    <option value="default">Featured & Recent</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Product Grid or Empty State */}
              {sortedProducts.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No items found"
                  description={`We couldn't find any products matching "${searchTerm || selectedCategory}". Try checking your spelling or clearing filters.`}
                  actionLabel="Clear All Filters"
                  onAction={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  accentColor="indigo"
                />
              ) : (
                <div className="products-responsive-grid">
                  {sortedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id || prod._id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                      onViewDetails={setSelectedProductForDetail}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.some((w) => (w.id || w._id) === (prod.id || prod._id))}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY LISTINGS */}
          {activeTab === "my-listings" && (
            <div className="my-listings-container">
              <div className="listings-header-bar">
                <div className="section-header-title">
                  <h2>My Campus Listings</h2>
                  <p>Manage items you've posted for other students to buy</p>
                </div>
                <button
                  type="button"
                  className="btn-banner-primary"
                  onClick={() => setIsSellModalOpen(true)}
                >
                  <PlusCircle size={16} />
                  <span>Post New Listing</span>
                </button>
              </div>

              {myListings.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title="You haven't listed any items yet"
                  description="Have extra textbooks, engineering tools, or room accessories? Post a listing to make cash and help peers on campus."
                  actionLabel="Post Your First Listing"
                  onAction={() => setIsSellModalOpen(true)}
                  accentColor="indigo"
                />
              ) : (
                <div className="listings-table-card">
                  <table className="listings-table">
                    <thead>
                      <tr>
                        <th>Item Details</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myListings.map((item) => (
                        <tr key={item.id || item._id}>
                          <td>
                            <div className="table-product-cell">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="table-product-thumb"
                              />
                              <div className="table-product-info">
                                <span className="table-product-title">{item.title}</span>
                                <span className="table-product-cat">{item.condition || "Like New"} · {item.createdAt || "Recent"}</span>
                              </div>
                            </div>
                          </td>
                          <td>{item.category}</td>
                          <td>
                            <strong>₹{item.price}</strong>
                          </td>
                          <td>
                            <span className="status-badge active">
                              <CheckCircle2 size={12} /> Active
                            </span>
                          </td>
                          <td>
                            <div className="table-action-btns">
                              <button
                                type="button"
                                className="table-btn-icon delete"
                                onClick={() => handleDeleteListing(item.id || item._id)}
                                title="Delete Listing"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="dashboard-section">
              <div className="section-header-row">
                <div className="section-header-title">
                  <h2>My Wishlist ({wishlist.length})</h2>
                  <p>Items you've bookmarked for later purchase</p>
                </div>
              </div>

              {wishlist.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="Your wishlist is empty"
                  description="Tap the heart icon on any campus item to save it here for later reference or price drops."
                  actionLabel="Explore Marketplace"
                  onAction={() => setActiveTab("view-products")}
                  accentColor="rose"
                />
              ) : (
                <div className="products-responsive-grid">
                  {wishlist.map((prod) => (
                    <ProductCard
                      key={prod.id || prod._id}
                      product={prod}
                      onAddToCart={handleAddToCart}
                      onViewDetails={setSelectedProductForDetail}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="orders-page-container">
              <div className="section-header-title">
                <h2>My Campus Orders</h2>
                <p>Track your orders and counter handover pickups</p>
              </div>

              {ordersLoading ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <div className="btn-spinner" style={{ borderColor: "#cbd5e1", borderTopColor: "#4f46e5", margin: "0 auto 12px" }} />
                  <p style={{ color: "#64748b" }}>Fetching your orders...</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="No orders placed yet"
                  description="Browse the campus marketplace, add items to your cart, and place an order for zero-fee campus handover."
                  actionLabel="Start Shopping"
                  onAction={() => setActiveTab("view-products")}
                  accentColor="indigo"
                />
              ) : (
                <div className="orders-grid-list">
                  {customerOrders.map((order, idx) => (
                    <div key={order._id || idx} className="modern-order-card">
                      <div className="order-card-header">
                        <div className="order-header-left">
                          <span className="order-id-tag">Order #{order.orderId || (order._id && order._id.slice(-6).toUpperCase())}</span>
                          <span className="order-date-tag">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Today"}
                          </span>
                        </div>
                        <span className={`status-badge ${order.orderStatus === "Completed" ? "active" : ""}`}>
                          {order.orderStatus || "Pending Handover"}
                        </span>
                      </div>

                      <div className="order-card-body">
                        <div className="order-items-list">
                          {(order.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="order-single-item">
                              <div className="order-item-left">
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                                  alt={item.title}
                                  className="order-item-img"
                                />
                                <div className="order-item-details">
                                  <span className="order-item-title">{item.title}</span>
                                  <span className="order-item-qty">Qty: {item.quantity || 1} · {item.category || "General"}</span>
                                </div>
                              </div>
                              <span className="order-item-price">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-card-footer">
                        <div className="order-location-info">
                          <MapPin size={15} style={{ color: "#4f46e5" }} />
                          <span>Handover at: <strong>{order.deliveryLocation || "Campus Store Counter"}</strong></span>
                        </div>
                        <div className="order-total-amount">
                          Total: ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MESSAGES / CAMPUS CHAT */}
          {activeTab === "messages" && (
            <div className="dashboard-section">
              <div className="section-header-title">
                <h2>Campus Messages</h2>
                <p>Chat directly with student sellers and buyers to arrange item viewings and campus handovers</p>
              </div>

              <ChatMessages currentUser={user} />
            </div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === "profile" && (
            <div className="profile-view-layout">
              {/* Left: Student Digital ID Card Preview */}
              <div className="student-card-preview">
                <div className="student-card-glow" />

                <div className="card-campus-badge">
                  <span className="card-campus-name">StudentMart ID</span>
                  <span className="card-verified-tag">
                    <CheckCircle2 size={12} /> Verified Peer
                  </span>
                </div>

                <div className="card-profile-header">
                  <div className="card-avatar-huge">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="card-user-titles">
                    <h3>{displayName}</h3>
                    <span className="card-usn-text">USN: {user?.usn || "1AT24CS151"}</span>
                  </div>
                </div>

                <div className="card-details-grid">
                  <div className="card-detail-item">
                    <span className="detail-label-micro">Department</span>
                    <span className="detail-value-micro">{user?.department || "CSE"}</span>
                  </div>
                  <div className="card-detail-item">
                    <span className="detail-label-micro">Batch Year</span>
                    <span className="detail-value-micro">{user?.year || "2026"}</span>
                  </div>
                  <div className="card-detail-item" style={{ gridColumn: "span 2" }}>
                    <span className="detail-label-micro">Campus Address / Location</span>
                    <span className="detail-value-micro">{user?.address || "Atria Institute of Technology, Bangalore"}</span>
                  </div>
                </div>
              </div>

              {/* Right: Profile Details & Settings */}
              <div className="profile-details-card">
                <div className="profile-card-header">
                  <div className="profile-card-title">
                    <h3>Personal Academic Information</h3>
                    <p>Details displayed on your campus listing receipts</p>
                  </div>
                </div>

                <div className="profile-info-rows">
                  <div className="info-field-box">
                    <span className="field-title">Full Name</span>
                    <span className="field-value">{displayName}</span>
                  </div>
                  <div className="info-field-box">
                    <span className="field-title">Campus Email</span>
                    <span className="field-value">{user?.email || "student@campus.edu"}</span>
                  </div>
                  <div className="info-field-box">
                    <span className="field-title">Student Roll / USN</span>
                    <span className="field-value">{user?.usn || "1AT24CS151"}</span>
                  </div>
                  <div className="info-field-box">
                    <span className="field-title">Phone Number</span>
                    <span className="field-value">{user?.phone || "+91 98765 43210"}</span>
                  </div>
                  <div className="info-field-box">
                    <span className="field-title">Department / Stream</span>
                    <span className="field-value">{user?.department || "Computer Science & Engineering"}</span>
                  </div>
                  <div className="info-field-box">
                    <span className="field-title">Graduation Year</span>
                    <span className="field-value">{user?.year || "2026"}</span>
                  </div>
                </div>

                <div className="profile-action-buttons">
                  <button
                    type="button"
                    className="btn-edit-profile"
                    onClick={() => setIsEditProfileModalOpen(true)}
                  >
                    <Edit2 size={16} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    className="btn-change-password"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    <Lock size={16} />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "settings" && (
            <div className="dashboard-section" style={{ maxWidth: 800 }}>
              <div className="section-header-title">
                <h2>Account Settings & Preferences</h2>
                <p>Customize your campus notification alerts and delivery preferences</p>
              </div>

              <div className="profile-details-card" style={{ gap: 20 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Campus Notification Alerts</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>New Campus Message Alerts</strong>
                      <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>Notify me when a peer messages regarding my listings</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "#4f46e5" }} />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>Order Status & Handover Updates</strong>
                      <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>Receive alerts when orders are ready for pickup at store counter</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "#4f46e5" }} />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>Price Drop Alerts on Wishlist</strong>
                      <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>Get notified when sellers discount saved items</p>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "#4f46e5" }} />
                  </label>
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                  <button
                    type="button"
                    className="btn-edit-profile"
                    onClick={() => showToast("success", "Settings saved successfully!")}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================
          PRODUCT DETAIL MODAL
          ========================================= */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some(
            (w) => (w.id || w._id) === (selectedProductForDetail.id || selectedProductForDetail._id)
          )}
          onOpenMessage={() => {
            setActiveTab("messages");
          }}
        />
      )}

      {/* =========================================
          POST STUDENT LISTING MODAL
          ========================================= */}
      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onAddListing={handleAddStudentListing}
      />

      {/* =========================================
          SHOPPING CART SLIDE-OVER DRAWER
          ========================================= */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div className="cart-header-title">
                <ShoppingBag size={20} style={{ color: "#4f46e5" }} />
                <h3>Your Cart ({cart.length})</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                style={{ position: "static" }}
                onClick={() => setIsCartOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  description="Explore textbooks, gadgets, and campus notes to add them to your cart."
                  actionLabel="Browse Products"
                  onAction={() => {
                    setIsCartOpen(false);
                    setActiveTab("view-products");
                  }}
                  accentColor="indigo"
                />
              </div>
            ) : (
              <>
                <div className="cart-items-body">
                  {cart.map((item, idx) => (
                    <div key={idx} className="cart-item-card">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                        alt={item.title}
                        className="cart-item-thumb"
                      />
                      <div className="cart-item-info">
                        <span className="cart-item-title">{item.title}</span>
                        <span className="cart-item-price">₹{Number(item.price).toLocaleString("en-IN")}</span>

                        <div className="cart-qty-row">
                          <div className="qty-controls">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleUpdateQuantity(idx, -1)}
                            >
                              -
                            </button>
                            <span className="qty-num">{item.quantity || 1}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleUpdateQuantity(idx, 1)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-item-remove-btn"
                            onClick={() => handleRemoveFromCart(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-delivery-select">
                    <label className="form-label" style={{ fontSize: 12.5 }}>Campus Handover Location</label>
                    <select
                      className="form-select"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                    >
                      <option value="Campus Store Main Counter / Direct Handover">Campus Store Main Counter</option>
                      <option value="Central Library Ground Floor Entrance">Central Library Entrance</option>
                      <option value="Hostel Block A / B Gate">Hostel Block Gate</option>
                      <option value="Cafeteria Open Lounge">Cafeteria Open Lounge</option>
                    </select>
                  </div>

                  <div className="cart-subtotal-row">
                    <span>Total Amount</span>
                    <span className="subtotal-amount">₹{cartSubtotal.toLocaleString("en-IN")}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-checkout-order"
                    onClick={handlePlaceCampusOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <div className="btn-spinner" />
                    ) : (
                      <>
                        <span>Confirm Campus Order (COD / UPI)</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          EDIT PROFILE MODAL
          ========================================= */}
      {isEditProfileModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditProfileModalOpen(false)}>
          <div className="sell-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <h3 className="modal-title">Edit Campus Profile</h3>
                <p className="modal-subtitle">Update your contact information and department details.</p>
              </div>
              <button className="modal-close-icon-btn" onClick={() => setIsEditProfileModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="sell-modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Academic Year / Sem</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Campus Address / College</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-cancel" onClick={() => setIsEditProfileModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-primary">
                  Save Changes
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
        <div className="modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="sell-modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <h3 className="modal-title">Change Password</h3>
                <p className="modal-subtitle">Enter your current password and pick a new one.</p>
              </div>
              <button className="modal-close-icon-btn" onClick={() => setIsPasswordModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="sell-modal-form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  minLength={6}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-cancel" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          FLOATING TOAST NOTIFICATION
          ========================================= */}
      {toastMessage && (
        <div className={`toast-floating-banner ${toastMessage.type}`}>
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
