function SectionBar({ title, meta }) {
  return (
    <div className="section-bar">
      <h2>{title}</h2>
      {meta ? <span>{meta}</span> : null}
    </div>
  );
}

export default SectionBar;
