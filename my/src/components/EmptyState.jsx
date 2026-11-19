export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = "indigo",
}) {
  return (
    <div className="modern-empty-state">
      <div className={`empty-icon-ring ${accentColor}`}>
        <Icon size={32} />
      </div>

      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="empty-action-btn"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
