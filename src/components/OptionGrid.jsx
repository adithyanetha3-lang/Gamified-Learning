import OptionCard from "./OptionCard";

function OptionGrid({ items }) {
  return (
    <section className="option-grid" aria-label="Main options">
      {items.map((item, index) => {
        const { key, ...itemProps } = item;
        return <OptionCard key={item.title || item.key || index} {...itemProps} />;
      })}
    </section>
  );
}

export default OptionGrid;
