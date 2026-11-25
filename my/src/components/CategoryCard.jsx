export default function CategoryCard({
  category,
  icon: Icon,
  count,
  isSelected,
  onClick,
  accentColor = "#4f46e5",
}) {
  return (
    <div
      className={`modern-category-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div 
        className="category-icon-bubble"
        style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
      >
        <Icon size={24} />
      </div>

      <div className="category-text-wrap">
        <h4 className="category-title">{category}</h4>
        {count !== undefined && (
          <span className="category-count">{count} {count === 1 ? "item" : "items"}</span>
        )}
      </div>
    </div>
  );
}
