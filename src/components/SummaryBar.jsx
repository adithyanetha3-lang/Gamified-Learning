import SummaryCard from "./SummaryCard";

function SummaryBar({ items }) {
  return (
    <section className="summary-bar" aria-label="Progress summary">
      {items.map((item) => (
        <SummaryCard key={item.label} {...item} />
      ))}
    </section>
  );
}

export default SummaryBar;
