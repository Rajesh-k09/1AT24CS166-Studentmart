import { useState } from "react";
import { 
  X, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Tag, 
  Share2, 
  CheckCircle2, 
  Clock,
  Sparkles 
} from "lucide-react";

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onOpenMessage,
}) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const title = product.title || product.name || "Campus Item";
  const price = Number(product.price) || 0;
  const category = product.category || "General";
  const desc = product.desc || product.description || "In clean condition and ready for campus pickup.";
  const location = product.location || "Campus Center / Library";
  const sellerName = product.sellerName || "Verified Student Peer";
  const condition = product.condition || "Like New / Verified";

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="detail-modal-grid">
          {/* Left: Product Image */}
          <div className="detail-image-section">
            <div className="detail-image-wrap">
              <img src={product.image} alt={title} className="detail-main-img" />
              <span className="detail-category-badge">{category}</span>
            </div>

            <div className="detail-guarantee-box">
              <ShieldCheck size={18} className="shield-icon" />
              <div>
                <strong>Campus Safe Meetup</strong>
                <p>Verified enrolled student. Trade safely at campus public counters.</p>
              </div>
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="detail-info-section">
            <div className="detail-header">
              <div className="detail-tag-row">
                <span className="condition-tag">{condition}</span>
                <span className="location-tag">
                  <MapPin size={12} />
                  <span>{location}</span>
                </span>
              </div>

              <h2 className="detail-title">{title}</h2>

              <div className="detail-price-box">
                <div className="detail-price-main">
                  <span className="curr">₹</span>
                  <span className="amount">{price.toLocaleString("en-IN")}</span>
                </div>
                <span className="price-badge-sub">Fixed campus pricing · No hidden fees</span>
              </div>
            </div>

            <div className="detail-body">
              <h4 className="detail-section-label">Item Description</h4>
              <p className="detail-description-text">{desc}</p>

              {/* Seller Information Card */}
              <div className="detail-seller-card">
                <div className="seller-card-avatar">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="seller-card-info">
                  <div className="seller-name-row">
                    <strong>{sellerName}</strong>
                    <span className="verified-badge">
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  </div>
                  <span className="seller-meta">Enrolled Campus Student · Active Today</span>
                </div>

                <button
                  type="button"
                  className="contact-seller-btn"
                  onClick={() => {
                    onClose();
                    onOpenMessage && onOpenMessage(product);
                  }}
                  title="Chat with seller"
                >
                  <MessageSquare size={16} />
                  <span>Chat</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="detail-actions-footer">
              <div className="action-buttons-group">
                <button
                  type="button"
                  className="detail-add-cart-btn"
                  onClick={() => {
                    onAddToCart(product);
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  className="detail-buy-now-btn"
                  onClick={() => {
                    onBuyNow(product);
                  }}
                >
                  <Sparkles size={18} />
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="secondary-actions-row">
                <button
                  type="button"
                  className={`detail-wishlist-toggle-btn ${isWishlisted ? "active" : ""}`}
                  onClick={() => onToggleWishlist(product)}
                >
                  <Heart size={16} fill={isWishlisted ? "#f43f5e" : "none"} color={isWishlisted ? "#f43f5e" : "currentColor"} />
                  <span>{isWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}</span>
                </button>

                <button
                  type="button"
                  className="detail-share-btn"
                  onClick={handleShare}
                >
                  <Share2 size={16} />
                  <span>{copied ? "Link Copied!" : "Share Item"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
