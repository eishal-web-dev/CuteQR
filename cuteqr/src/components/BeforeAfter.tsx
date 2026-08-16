import { AnimalFrame } from "./AnimalFrame";

// Deterministic decorative pattern — purely illustrative, not a real QR.
const PATTERN = [
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 0, 0, 0, 1, 0, 1,
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  0, 0, 0, 0, 1, 0, 0, 0, 0,
  1, 0, 1, 1, 0, 1, 1, 0, 1,
  0, 0, 0, 0, 1, 0, 0, 0, 0,
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 0, 0, 0, 1, 0, 1,
  1, 1, 1, 0, 1, 0, 1, 1, 1,
];

function DecorativeGrid({ color }: { color: string }) {
  return (
    <div className="grid grid-cols-9 gap-[2px] w-[140px] h-[140px]">
      {PATTERN.map((filled, i) => (
        <div key={i} className="rounded-[1px]" style={{ background: filled ? color : "transparent" }} />
      ))}
    </div>
  );
}

export function BeforeAfter() {
  return (
    <section className="px-6 py-20">
      <h2 className="text-center font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)]">
        Make boring QR codes adorable
      </h2>

      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-white p-6 shadow-md opacity-70">
            <DecorativeGrid color="#3D3226" />
          </div>
          <p className="font-display font-semibold text-[var(--color-ink-soft)]">Normal QR 😐</p>
        </div>

        <div className="font-display text-3xl text-[var(--color-blush-deep)] rotate-90 sm:rotate-0">→</div>

        <div className="flex flex-col items-center gap-3">
          <AnimalFrame animal="cat" earColor="#F6B8C6" accentSoft="#F6B8C6">
            <div className="p-1">
              <DecorativeGrid color="#3D3226" />
            </div>
          </AnimalFrame>
          <p className="font-display font-semibold text-[var(--color-ink)]">CuteQR 🐱✨</p>
        </div>
      </div>
    </section>
  );
}
