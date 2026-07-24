export default function Section({ title, desc, children }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {desc && <p className="section-desc">{desc}</p>}
      {children}
    </section>
  );
}
