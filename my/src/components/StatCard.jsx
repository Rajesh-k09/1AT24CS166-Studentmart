export default function StatCard({
  title,
  value,
  icon: Icon,
  emoji,
  trend,
  trendPositive = true,
  accentColor = "indigo",
  onClick,
}) {
  const colorMap = {
    indigo: {
      bg: "#ede9fe",
      text: "#6d28d9",
      border: "#ddd6fe",
      badgeBg: "#f5f3ff",
    },
    emerald: {
      bg: "#d1fae5",
      text: "#059669",
      border: "#a7f3d0",
      badgeBg: "#ecfdf5",
    },
    amber: {
      bg: "#fef3c7",
      text: "#d97706",
      border: "#fde68a",
      badgeBg: "#fffbeb",
    },
    rose: {
      bg: "#ffe4e6",
      text: "#e11d48",
      border: "#fecdd3",
      badgeBg: "#fff1f2",
    },
    sky: {
      bg: "#e0f2fe",
      text: "#0284c7",
      border: "#bae6fd",
      badgeBg: "#f0f9ff",
    },
    orange: {
      bg: "#ffedd5",
      text: "#ea580c",
      border: "#fed7aa",
      badgeBg: "#fff7ed",
    },
    purple: {
      bg: "#f3e8ff",
      text: "#9333ea",
      border: "#e9d5ff",
      badgeBg: "#faf5ff",
    },
  };

  const current = colorMap[accentColor] || colorMap.indigo;

  return (
    <div 
      className={`modern-stat-card warm-compact ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="stat-card-top">
        <div 
          className="stat-card-icon-wrap warm-pill"
          style={{ backgroundColor: current.bg, color: current.text }}
        >
          {emoji ? <span className="stat-emoji">{emoji}</span> : <Icon size={18} />}
        </div>
        {trend && (
          <div className={`stat-card-trend-badge ${trendPositive ? "positive" : "neutral"}`}>
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="stat-card-bottom">
        <div className="stat-card-value-box">
          <span className="stat-card-value">{value}</span>
          <span className="stat-card-title">{title}</span>
        </div>
      </div>
    </div>
  );
}
