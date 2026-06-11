function SummaryCard({ label, value, tone = "default" }) {
  return (
    <article className={`summary-card summary-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default SummaryCard;
