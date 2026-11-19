import { useState } from "react";
import { Heart, ShoppingBag, Eye, MapPin, User, Sparkles } from "lucide-react";

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

  const displayImage = imageError || !product.image ? getFallbackImage(category) : product.image;

  return (
    <div className="modern-product-card">
      {/* Card Image Banner */}
      <div className="product-card-image-wrap">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImageError(true)}
          className="product-card-img"
        />

        {/* Category Pill Tag */}
        <span className="product-category-pill">{category}</span>

        {/* Condition / Verified Tag */}
        <span className="product-condition-pill">{condition}</span>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product);
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "#f43f5e" : "none"} color={isWishlisted ? "#f43f5e" : "#ffffff"} />
        </button>

        {/* Hover Quick Actions Overlay */}
        <div className="product-hover-overlay">
          <button
            type="button"
            className="quick-view-btn"
            onClick={() => onViewDetails && onViewDetails(product)}
          >
            <Eye size={15} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="product-card-body">
        <div className="product-location-row">
          <MapPin size={13} className="loc-pin" />
          <span className="location-name">{location}</span>
        </div>

        <h3 className="product-card-title" title={title}>
          {title}
        </h3>

        <p className="product-card-desc">
          {desc}
        </p>

        {showSellerInfo && (
          <div className="product-seller-row">
            <div className="seller-mini-avatar">
              <User size={12} />
            </div>
            <span className="seller-label">Seller: <strong>{sellerName}</strong></span>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="currency-symbol">₹</span>
            <span className="price-number">{price.toLocaleString("en-IN")}</span>
          </div>

          <button
            type="button"
            className="product-add-cart-btn"
            onClick={() => onAddToCart && onAddToCart(product)}
            title="Add to Shopping Cart"
          >
            <ShoppingBag size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
