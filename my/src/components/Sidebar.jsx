import { 
  LayoutDashboard, 
  Compass, 
  Tag, 
  Heart, 
  ShoppingBag, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  X
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  cartCount = 0,
  wishlistCount = 0,
  ordersCount = 0,
  unreadMessagesCount = 2,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  isAdmin = false,
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "view-products",
      label: "Browse Products",
      icon: Compass,
      badge: null,
    },
    {
      id: "my-listings",
      label: "My Listings",
      icon: Tag,
      badge: null,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
      badgeColor: "rose",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: ShoppingBag,
      badge: ordersCount > 0 ? ordersCount : null,
      badgeColor: "primary",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      badgeColor: "emerald",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      badge: null,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  const displayName = user?.name || user?.usn || "Student";
  const displayRole = user?.role === "admin" ? "Store Admin" : "Verified Student";
  const avatarLetter = (user?.name || user?.usn || "S").charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-mobile-backdrop" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand-link" onClick={() => handleNavClick("dashboard")}>
            <div className="brand-logo-icon">
              <ShoppingBag size={20} />
            </div>
            {!isCollapsed && (
              <div className="brand-title-wrap">
                <span className="brand-title-text">StudentMart<span className="brand-accent">.</span></span>
                <span className="brand-tagline">Campus Marketplace</span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button 
            className="sidebar-close-mobile-btn" 
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            {!isCollapsed && <span>MAIN MENU</span>}
          </div>

          <div className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === "view-products" && activeTab === "products");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="nav-item-icon">
                    <Icon size={19} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="nav-item-label">{item.label}</span>
                      {item.badge !== null && (
                        <span className={`nav-item-badge ${item.badgeColor || "primary"}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Switcher Shortcut if user has admin privileges */}
          {isAdmin && (
            <div className="sidebar-admin-shortcut">
              <a href="/admin/dashboard" className="admin-switch-btn">
                <ShieldCheck size={18} />
                {!isCollapsed && <span>Switch to Admin Portal</span>}
              </a>
            </div>
          )}
        </nav>

        {/* Sidebar Footer User & Collapse */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card" onClick={() => handleNavClick("profile")}>
            <div className="sidebar-avatar">
              {avatarLetter}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <span className="user-name-text">{displayName}</span>
                <span className="user-role-text">{displayRole}</span>
              </div>
            )}
          </div>

          <div className="sidebar-bottom-actions">
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              className="sidebar-collapse-btn desktop-only"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
