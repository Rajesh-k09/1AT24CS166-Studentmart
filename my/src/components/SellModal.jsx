import { useState } from "react";
import { X, Upload, PlusCircle, Image as ImageIcon, MapPin, Tag } from "lucide-react";

export default function SellModal({ isOpen, onClose, onAddListing }) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "Books",
    desc: "",
    image: "",
    condition: "Like New",
    location: "Main Campus Center",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter an item title.");
      return;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError("Please enter a valid price in ₹.");
      return;
    }

    const fallbackImages = {
      Books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      Electronics: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
      Gadgets: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
      Notes: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
      Furniture: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80",
      Accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      Sports: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
      Other: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    };

    const finalImage = formData.image.trim() || fallbackImages[formData.category] || fallbackImages.Other;

    onAddListing({
      ...formData,
      price: Number(formData.price),
      image: finalImage,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sell-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div>
            <h3 className="modal-title">Post Campus Listing</h3>
            <p className="modal-subtitle">List your textbooks, electronics, notes, or dorm gear for campus peers.</p>
          </div>
          <button className="modal-close-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sell-modal-form">
          {error && <div className="alert-badge error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. VTU Engineering Mathematics Book Sem 3"
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="450"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Notes">Notes</option>
                <option value="Furniture">Furniture</option>
                <option value="Accessories">Accessories</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Gently Used">Gently Used</option>
                <option value="Fair / Readable">Fair / Readable</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Campus Handover Spot</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Central Library / Hostel Block A"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Item Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Mention semester, highlights, inclusions, or best time to meet..."
            />
          </div>

          {/* Image upload / URL */}
          <div className="form-group">
            <label className="form-label">Product Photo</label>
            <div className="image-input-choice">
              <label className="file-dropzone">
                <Upload size={20} className="dropzone-icon" />
                <span className="dropzone-text">Upload from computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  style={{ display: "none" }}
                />
              </label>

              <div className="image-or-divider">or paste URL</div>

              <input
                type="url"
                className="form-input"
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {imagePreview && (
              <div className="image-preview-card">
                <img src={imagePreview} alt="Item Preview" />
                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={() => {
                    setImagePreview("");
                    setFormData({ ...formData, image: "" });
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit-primary">
              <PlusCircle size={18} />
              <span>Publish Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
