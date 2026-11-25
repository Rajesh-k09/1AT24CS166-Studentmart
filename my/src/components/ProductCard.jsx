import { useState } from "react";
import { Heart, ShoppingBag, Eye, MapPin, Sparkles, Plus } from "lucide-react";

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  onToggleWishlist,
  isWishlisted = false,
  showSellerInfo = true,
}) {
  const [imageError, setImageError] = useState(false);

  const title = product.title || product.name || "Campus Item";
  const price = Number(product.price) || 0;
  const category = product.category || "General";
  const desc = product.desc || product.description || "Available for on-campus handover.";
  const location = product.location || "Campus Center / Library";
  const sellerName = product.sellerName || "Verified Peer";
  const condition = product.condition || "Like New";

  // Category fallback images
  const getFallbackImage = (cat) => {
    switch ((cat || "").toLowerCase()) {
      case "books":
        return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80";
      case "gadgets":
      case "electronics":
        return "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80";
      case "college bags":
      case "accessories":
        return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80";
      case "uniform":
        return "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80";
      case "stationery":
      case "notes":
        return "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80";
      default:
        return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
    }
  };

  // Pastel styling by category
  const getCategoryTheme = (cat) => {
    switch ((cat || "").toLowerCase()) {
      case "books":
        return { bg: "#e0f2fe", text: "#0284c7" };
      case "gadgets":
      case "electronics":
        return { bg: "#ede9fe", text: "#7c3aed" };
      case "notes":
      case "stationery":
        return { bg: "#d1fae5", text: "#059669" };
      case "furniture":
        return { bg: "#fef3c7", text: "#d97706" };
      case "accessories":
      case "college bags":
        return { bg: "#ffe4e6", text: "#e11d48" };
      case "sports":
        return { bg: "#ffedd5", text: "#ea580c" };
      default:
        return { bg: "#f3f4f6", text: "#4b5563" };
    }
  };

  const catTheme = getCategoryTheme(category);
  const displayImage = imageError || !product.image ? getFallbackImage(category) : product.image;
  const sellerInitial = (sellerName || "S").charAt(0).toUpperCase();

  return (
    <div className="compact-product-card">
      {/* Card Image Banner */}
      <div className="compact-card-media" onClick={() => onViewDetails && onViewDetails(product)}>
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="compact-card-img"
        />

        {/* Category Pill Tag */}
        <span 
          className="compact-category-tag"
          style={{ backgroundColor: catTheme.bg, color: catTheme.text }}
        >
          {category}
        </span>

        {/* Condition Tag */}
        <span className="compact-condition-tag">
          {condition}
        </span>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          className={`compact-wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product);
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={15} fill={isWishlisted ? "#f43f5e" : "none"} color={isWishlisted ? "#f43f5e" : "#475569"} />
        </button>

        {/* Quick View Pill */}
        <div className="compact-hover-pill">
          <Eye size={13} />
          <span>Quick View</span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="compact-card-content">
        <div className="compact-location-line">
          <MapPin size={12} className="loc-icon" />
          <span className="loc-text">{location}</span>
        </div>

        <h3 
          className="compact-card-title" 
          title={title}
          onClick={() => onViewDetails && onViewDetails(product)}
        >
          {title}
        </h3>

        {showSellerInfo && (
          <div className="compact-seller-chip">
            <span className="seller-avatar-mini">{sellerInitial}</span>
            <span className="seller-text">Listed by <strong>{sellerName}</strong></span>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="compact-card-footer">
          <div className="compact-price-wrap">
            <span className="curr">₹</span>
            <span className="amt">{price.toLocaleString("en-IN")}</span>
          </div>

          <button
            type="button"
            className="compact-add-cart-btn"
            onClick={() => onAddToCart && onAddToCart(product)}
            title="Add to Shopping Cart"
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
