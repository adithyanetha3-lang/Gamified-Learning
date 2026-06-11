function InfoPanel({ items }) {
  return (
    <div className="info-panel">
      {items.map((item) => (
        <div className="info-pill" key={item}>
          {item}
        </div>
      ))}
    </div>
  );
}

export default InfoPanel;
