"use client";

import type { AnimalId } from "@/lib/animals";

interface AnimalFrameProps {
  animal: AnimalId;
  earColor: string;
  accentSoft: string;
  children: React.ReactNode;
  bounce?: boolean;
}

/**
 * Wraps the QR code in an animal-themed frame. All decorative elements
 * (ears, paws, eyes, whiskers) are positioned OUTSIDE the QR image's own
 * bounding box via absolute positioning on the frame itself, so they never
 * touch a single QR module or finder pattern. Scannability is guaranteed
 * by construction, not by careful placement within the QR.
 */
export function AnimalFrame({ animal, earColor, accentSoft, children, bounce }: AnimalFrameProps) {
  return (
    <div className={`relative inline-block ${bounce ? "animate-bounce-soft" : ""}`}>
      <Ears animal={animal} color={earColor} />
      <Whiskers animal={animal} />

      <div className="relative rounded-[2.25rem] bg-white p-5 shadow-[0_20px_50px_-15px_rgba(61,50,38,0.25)] ring-4" style={{ ["--tw-ring-color" as string]: accentSoft }}>
        <Eyes animal={animal} />
        <div className="relative rounded-2xl overflow-hidden">{children}</div>
        <Paws animal={animal} color={earColor} />
      </div>
    </div>
  );
}

function Ears({ animal, color }: { animal: AnimalId; color: string }) {
  const common = "absolute -top-9 z-0";

  switch (animal) {
    case "cat":
      return (
        <>
          <svg className={`${common} left-3`} width="46" height="48" viewBox="0 0 46 48" fill="none">
            <path d="M4 46 L10 4 L42 40 Z" fill={color} />
            <path d="M13 34 L15 16 L33 32 Z" fill="#fff" opacity="0.5" />
          </svg>
          <svg className={`${common} right-3 scale-x-[-1]`} width="46" height="48" viewBox="0 0 46 48" fill="none">
            <path d="M4 46 L10 4 L42 40 Z" fill={color} />
            <path d="M13 34 L15 16 L33 32 Z" fill="#fff" opacity="0.5" />
          </svg>
        </>
      );
    case "puppy":
      return (
        <>
          <svg className={`${common} -left-2 top-[-14px]`} width="40" height="60" viewBox="0 0 40 60" fill="none">
            <ellipse cx="20" cy="28" rx="16" ry="26" fill={color} transform="rotate(-18 20 28)" />
          </svg>
          <svg className={`${common} -right-2 top-[-14px] scale-x-[-1]`} width="40" height="60" viewBox="0 0 40 60" fill="none">
            <ellipse cx="20" cy="28" rx="16" ry="26" fill={color} transform="rotate(-18 20 28)" />
          </svg>
        </>
      );
    case "panda":
      return (
        <>
          <svg className={`${common} left-1`} width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="20" fill={color} />
          </svg>
          <svg className={`${common} right-1`} width="42" height="42" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="20" fill={color} />
          </svg>
        </>
      );
    case "bunny":
      return (
        <>
          <svg className={`${common} left-5 -top-16`} width="26" height="70" viewBox="0 0 26 70" fill="none">
            <rect x="2" y="2" width="22" height="62" rx="11" fill={color} />
            <rect x="8" y="12" width="10" height="44" rx="5" fill="#fff" opacity="0.55" />
          </svg>
          <svg className={`${common} right-5 -top-16`} width="26" height="70" viewBox="0 0 26 70" fill="none">
            <rect x="2" y="2" width="22" height="62" rx="11" fill={color} />
            <rect x="8" y="12" width="10" height="44" rx="5" fill="#fff" opacity="0.55" />
          </svg>
        </>
      );
    case "fox":
      return (
        <>
          <svg className={`${common} left-2`} width="50" height="52" viewBox="0 0 50 52" fill="none">
            <path d="M2 50 L8 2 L46 44 Z" fill={color} />
            <path d="M12 38 L15 16 L36 36 Z" fill="#fff" opacity="0.6" />
          </svg>
          <svg className={`${common} right-2 scale-x-[-1]`} width="50" height="52" viewBox="0 0 50 52" fill="none">
            <path d="M2 50 L8 2 L46 44 Z" fill={color} />
            <path d="M12 38 L15 16 L36 36 Z" fill="#fff" opacity="0.6" />
          </svg>
        </>
      );
  }
}

function Eyes({ animal }: { animal: AnimalId }) {
  if (animal === "panda") {
    return (
      <div className="flex justify-center gap-6 mb-2">
        <div className="w-4 h-5 rounded-full bg-[#232323]" />
        <div className="w-4 h-5 rounded-full bg-[#232323]" />
      </div>
    );
  }
  return (
    <div className="flex justify-center gap-5 mb-2">
      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-ink)]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-ink)]" />
    </div>
  );
}

function Whiskers({ animal }: { animal: AnimalId }) {
  if (animal !== "cat" && animal !== "fox" && animal !== "bunny") return null;
  return (
    <>
      <div className="absolute left-[-18px] top-[38%] flex flex-col gap-1.5 opacity-40">
        <div className="w-4 h-[1.5px] bg-[var(--color-ink)] rounded-full" />
        <div className="w-5 h-[1.5px] bg-[var(--color-ink)] rounded-full" />
      </div>
      <div className="absolute right-[-18px] top-[38%] flex flex-col gap-1.5 opacity-40">
        <div className="w-4 h-[1.5px] bg-[var(--color-ink)] rounded-full ml-auto" />
        <div className="w-5 h-[1.5px] bg-[var(--color-ink)] rounded-full ml-auto" />
      </div>
    </>
  );
}

function Paws({ animal, color }: { animal: AnimalId; color: string }) {
  return (
    <div className="flex justify-center gap-8 mt-3">
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <ellipse cx="14" cy="12" rx="10" ry="7" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
        <circle cx="6" cy="4" r="3.2" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
        <circle cx="14" cy="2" r="3.2" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
        <circle cx="22" cy="4" r="3.2" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
      </svg>
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <ellipse cx="14" cy="12" rx="10" ry="7" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
        <circle cx="6" cy="4" r="3.2" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
        <circle cx="14" cy="2" r="3.2" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
        <circle cx="22" cy="4" r="3.2" fill={color} opacity={animal === "panda" ? 1 : 0.85} />
      </svg>
    </div>
  );
}
