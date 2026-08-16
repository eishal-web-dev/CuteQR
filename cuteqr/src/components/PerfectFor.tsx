const USE_CASES = [
  { emoji: "☕", label: "Cafés" },
  { emoji: "📦", label: "Packaging" },
  { emoji: "🎉", label: "Events" },
  { emoji: "🛍️", label: "Small businesses" },
  { emoji: "💌", label: "Invitations" },
  { emoji: "📱", label: "Social profiles" },
];

export function PerfectFor() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-center font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)]">
        Perfect for
      </h2>
      <div className="mt-10 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
        {USE_CASES.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white py-6 px-3 shadow-[0_8px_20px_-10px_rgba(61,50,38,0.2)] transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className="font-display text-sm font-semibold text-[var(--color-ink)] text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
