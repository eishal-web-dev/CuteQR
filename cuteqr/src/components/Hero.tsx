export function Hero() {
  return (
    <header className="relative px-6 pt-20 pb-4 text-center overflow-hidden">
      <div className="absolute inset-0 paw-bg pointer-events-none" aria-hidden="true" />
      <div className="relative">
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--color-ink)]">
          CuteQR <span className="inline-block animate-float-slow">🐾</span>
        </h1>
        <p className="mt-4 font-display text-xl sm:text-2xl font-semibold text-[var(--color-ink)]">
          Turn any link into an adorable QR code.
        </p>
        <p className="mt-3 text-base text-[var(--color-ink-soft)] max-w-md mx-auto">
          Create beautiful animal QR codes that people actually want to scan.
        </p>
      </div>
    </header>
  );
}
