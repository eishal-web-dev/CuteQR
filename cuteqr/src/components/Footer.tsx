export function Footer() {
  return (
    <footer className="px-6 py-12 border-t border-[var(--color-cream-deep)] text-center">
      <p className="font-display text-lg font-bold text-[var(--color-ink)]">CuteQR 🐾</p>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        Made to make the internet a little cuter.
      </p>
      <div className="mt-4 flex justify-center gap-5 text-sm font-semibold text-[var(--color-ink-soft)]">
        <a href="#" className="hover:text-[var(--color-ink)] transition-colors">
          Privacy
        </a>
        <a href="#" className="hover:text-[var(--color-ink)] transition-colors">
          Terms
        </a>
        <a href="#" className="hover:text-[var(--color-ink)] transition-colors">
          Feedback
        </a>
      </div>
    </footer>
  );
}
