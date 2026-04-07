const sectionStyle =
  "min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-200";
const cardStyle =
  "w-full max-w-3xl rounded-3xl border border-blue-200 bg-white/90 p-8 md:p-12 shadow-xl";

function FarewellPageTemplate({ title, subtitle }) {
  return (
    <section className={sectionStyle}>
      <div className={cardStyle}>
        <p className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-blue-600">
          Farewell 2K26
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-slate-900">{title}</h1>
        <p className="mt-4 text-base md:text-lg text-slate-700">{subtitle}</p>
      </div>
    </section>
  );
}

export default FarewellPageTemplate;
