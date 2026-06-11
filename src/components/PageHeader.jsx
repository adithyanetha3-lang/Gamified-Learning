function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <header className="page-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

export default PageHeader;
