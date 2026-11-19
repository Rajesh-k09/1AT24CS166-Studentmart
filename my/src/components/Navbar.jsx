import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Bell, 
  ShoppingCart, 
  PlusCircle, 
  Menu, 
  CheckCircle2, 
  Tag, 
  MessageSquare,
  Sparkles,
  X
} from "lucide-react";

export default function Navbar({
  searchTerm,
  setSearchTerm,
  cartCount = 0,
  onOpenCart,
  onOpenSellModal,
  user,
  onOpenMobileMenu,
  onNavigateToTab,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const notifications = [
    {
      id: "1",
      icon: Tag,
      iconColor: "#4f46e5",
      title: "Price drop on Casio FX-991CW",
      desc: "An item on your watchlist is now ₹850 (was ₹1,250).",
      time: "10m ago",
      unread: true,
    },
    {
      id: "2",
      icon: MessageSquare,
      iconColor: "#10b981",
      title: "New campus message from Rahul",
      desc: "Can we meet at the campus library around 3 PM?",
      time: "45m ago",
      unread: true,
    },
    {
      id: "3",
      icon: CheckCircle2,
      iconColor: "#0ea5e9",
      title: "Order #SM-4081 Confirmed",
      desc: "Ready for pickup at Campus Store Counter.",
      time: "2h ago",
      unread: false,
    },
  ];

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.usn || "Student";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Get time of day for dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="app-navbar">
      {/* Left Mobile Menu & Greeting */}
      <div className="navbar-left">
        <button 
          className="mobile-hamburger-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-greeting">
          <span className="greeting-sub">{getGreeting()},</span>
          <span className="greeting-name">{displayName} 👋</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="navbar-center">
        <div className="navbar-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search books, electronics, and more..."
          />
          {searchTerm && (
            <button 
              className="search-clear-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <div className="search-shortcut-badge">⌘K</div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-right">
        {/* Sell Item Action Button */}
        <button
          type="button"
          className="navbar-sell-btn"
          onClick={onOpenSellModal}
        >
          <PlusCircle size={17} />
          <span>Post Listing</span>
        </button>

        {/* Cart Button */}
        <button
          type="button"
          className="navbar-icon-btn cart-btn"
          onClick={onOpenCart}
          title="Shopping Cart"
          aria-label="Shopping Cart"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="badge-bubble primary">{cartCount}</span>
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="notifications-container" ref={notifRef}>
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="badge-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notif-dropdown-header">
                <div className="notif-header-title">
                  <span className="title-text">Notifications</span>
                  <span className="unread-pill">2 new</span>
                </div>
                <button 
                  className="mark-read-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  Mark all as read
                </button>
              </div>

              <div className="notif-list">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div 
                      key={n.id} 
                      className={`notif-item ${n.unread ? "unread" : ""}`}
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.id === "2") onNavigateToTab("messages");
                        if (n.id === "3") onNavigateToTab("orders");
                        if (n.id === "1") onNavigateToTab("view-products");
                      }}
                    >
                      <div className="notif-icon-wrap" style={{ backgroundColor: `${n.iconColor}15`, color: n.iconColor }}>
                        <Icon size={16} />
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-desc">{n.desc}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                      {n.unread && <span className="notif-unread-dot" />}
                    </div>
                  );
                })}
              </div>

              <div className="notif-dropdown-footer">
                <span>Campus alerts updated in real-time</span>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div 
          className="navbar-avatar-wrap" 
          onClick={() => onNavigateToTab("profile")}
          title="View Profile"
        >
          <div className="navbar-avatar">{avatarLetter}</div>
          <span className="online-status-ring" />
        </div>
      </div>
    </header>
  );
}
