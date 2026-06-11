function MainSection({ title, meta, children }) {
  return (
    <section className="main-section">
      <div className="section-bar">
        <h2>{title}</h2>
        {meta ? <span>{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

export default MainSection;
