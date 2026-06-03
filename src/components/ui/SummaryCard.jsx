export default function SummaryCard({ title, value, type, valueColor }) {
  return (
    <div className={`glass-panel card card-${type}`}>
      <h3 className="card-title">{title}</h3>
      <div className="card-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
    </div>
  );
}
