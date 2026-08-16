const STEPS = [
  { emoji: "🔗", label: "Paste your link" },
  { emoji: "🐾", label: "Pick your animal" },
  { emoji: "✨", label: "Generate" },
  { emoji: "✅", label: "Scan test" },
  { emoji: "⬇️", label: "Download" },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-center font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)]">
        How it works
      </h2>
      <div className="mt-10 max-w-4xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-4">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center gap-2 w-24">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl shadow-md">
              {step.emoji}
            </div>
            <span className="font-display text-xs font-bold text-[var(--color-ink-soft)]">
              {i + 1}. {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <p className="font-display text-lg font-bold text-[var(--color-ink)]">Free for now</p>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Create your first CuteQR completely free. No account required.
        </p>
      </div>
    </section>
  );
}
