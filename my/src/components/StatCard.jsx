export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
  accentColor = "indigo",
  onClick,
}) {
  const colorMap = {
    indigo: {
      bg: "rgba(99, 102, 241, 0.1)",
      text: "#4f46e5",
      border: "rgba(99, 102, 241, 0.2)",
    },
    emerald: {
      bg: "rgba(16, 185, 129, 0.1)",
      text: "#059669",
      border: "rgba(16, 185, 129, 0.2)",
    },
    amber: {
      bg: "rgba(245, 158, 11, 0.1)",
      text: "#d97706",
      border: "rgba(245, 158, 11, 0.2)",
    },
    rose: {
      bg: "rgba(244, 63, 94, 0.1)",
      text: "#e11d48",
      border: "rgba(244, 63, 94, 0.2)",
    },
    sky: {
      bg: "rgba(14, 165, 233, 0.1)",
      text: "#0284c7",
      border: "rgba(14, 165, 233, 0.2)",
    },
  };

  const current = colorMap[accentColor] || colorMap.indigo;

  return (
    <div 
      className={`modern-stat-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        <div 
          className="stat-card-icon-wrap"
          style={{ backgroundColor: current.bg, color: current.text }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="stat-card-bottom">
        <div className="stat-card-value">{value}</div>
        {trend && (
          <div className={`stat-card-trend ${trendPositive ? "positive" : "neutral"}`}>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
