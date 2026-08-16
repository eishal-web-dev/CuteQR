"use client";

import { useState } from "react";
import { ANIMALS, type AnimalId } from "@/lib/animals";

interface AnimalPickerProps {
  selected: AnimalId;
  onSelect: (id: AnimalId) => void;
}

export function AnimalPicker({ selected, onSelect }: AnimalPickerProps) {
  const [wigglingId, setWigglingId] = useState<AnimalId | null>(null);

  function handleSelect(id: AnimalId) {
    onSelect(id);
    setWigglingId(id);
    window.setTimeout(() => setWigglingId(null), 500);
  }

  return (
    <div className="grid grid-cols-5 gap-2.5 sm:gap-4 max-w-xl mx-auto">
      {ANIMALS.map((animal) => {
        const isSelected = selected === animal.id;
        return (
          <button
            key={animal.id}
            type="button"
            onClick={() => handleSelect(animal.id)}
            aria-pressed={isSelected}
            className={`group flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1.5 sm:py-4 transition-all duration-200 ${
              isSelected
                ? "bg-white shadow-[0_10px_25px_-8px_rgba(61,50,38,0.3)] scale-105"
                : "bg-white/50 hover:bg-white/80"
            }`}
            style={isSelected ? { boxShadow: `0 0 0 2.5px ${animal.accentSoft}, 0 10px 25px -8px rgba(61,50,38,0.3)` } : undefined}
          >
            <span
              className={`text-2xl sm:text-3xl ${wigglingId === animal.id ? "animate-wiggle" : ""} ${
                isSelected ? "" : "grayscale-[0.3] opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
              }`}
            >
              {animal.emoji}
            </span>
            <span className="font-display text-[11px] sm:text-xs font-semibold text-[var(--color-ink)]">
              {animal.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
