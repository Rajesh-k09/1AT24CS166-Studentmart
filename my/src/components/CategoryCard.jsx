export default function CategoryCard({
  category,
  icon: Icon,
  emoji,
  count,
  isSelected,
  onClick,
  pastelBg = "#ede9fe",
  pastelText = "#6d28d9",
}) {
  return (
    <div
      className={`warm-category-chip ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      style={{
        "--chip-bg": pastelBg,
        "--chip-text": pastelText,
      }}
    >
      <div 
        className="category-chip-bubble"
        style={{ backgroundColor: pastelBg, color: pastelText }}
      >
        {emoji ? <span className="category-emoji">{emoji}</span> : <Icon size={18} />}
      </div>

      <div className="category-chip-meta">
        <span className="category-chip-title">{category}</span>
        {count !== undefined && (
          <span className="category-chip-count">{count} items</span>
        )}
      </div>
    </div>
  );
}
