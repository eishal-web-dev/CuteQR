"use client";

import { useState, useRef, useCallback } from "react";
import { Download, RotateCcw, Sparkles, Loader2, Palette } from "lucide-react";
import { AnimalPicker } from "./AnimalPicker";
import { ANIMALS, getAnimal, type AnimalId } from "@/lib/animals";
import { generateAndValidateQR, isLikelyUrl, normalizeUrl, type GenerateResult, type QRCustomization } from "@/lib/qr";

type Status = "idle" | "generating" | "ready" | "error";

export function QRGenerator() {
  const [url, setUrl] = useState("");
  const [animalId, setAnimalId] = useState<AnimalId>(ANIMALS[0].id);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customization, setCustomization] = useState<QRCustomization>({
    moduleStyle: "rounded",
    size: 560,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const generationId = useRef(0);

  const animal = getAnimal(animalId);

  const runGeneration = useCallback(
    async (targetUrl: string, targetAnimal: AnimalId, targetCustomization: QRCustomization) => {
      const myId = ++generationId.current;
      setStatus("generating");
      setErrorMsg("");
      try {
        const res = await generateAndValidateQR(targetUrl, getAnimal(targetAnimal), targetCustomization);
        if (myId !== generationId.current) return;
        setResult(res);
        setStatus("ready");
      } catch {
        if (myId !== generationId.current) return;
        setErrorMsg("Something went wrong generating your QR. Please try again.");
        setStatus("error");
      }
    },
    []
  );

  function handleGenerate() {
    if (!isLikelyUrl(url)) {
      setErrorMsg("That doesn't look like a valid link. Try something like example.com");
      setStatus("error");
      return;
    }
    void runGeneration(normalizeUrl(url), animalId, customization);
  }

  function handleReset() {
    setUrl("");
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
    setShowCustomize(false);
  }

  function handleCustomizationChange(next: Partial<QRCustomization>) {
    const merged = { ...customization, ...next };
    setCustomization(merged);
    if (status === "ready" && isLikelyUrl(url)) {
      void runGeneration(normalizeUrl(url), animalId, merged);
    }
  }

  function handleAnimalChange(id: AnimalId) {
    setAnimalId(id);
    if (status === "ready" && isLikelyUrl(url)) {
      void runGeneration(normalizeUrl(url), id, customization);
    }
  }

  function handleDownload() {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = `cuteqr-${animalId}-art.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your link here..."
          className="w-full rounded-2xl bg-white border-2 border-transparent focus:border-[var(--color-blush-deep)] px-5 py-4 text-base font-medium text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] shadow-[0_8px_24px_-10px_rgba(61,50,38,0.18)] outline-none transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
      </div>

      <div className="mt-8">
        <p className="text-center font-display text-sm font-semibold text-[var(--color-ink-soft)] mb-4">
          Choose your buddy
        </p>
        <AnimalPicker selected={animalId} onSelect={handleAnimalChange} />
      </div>

      {status !== "ready" && (
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={status === "generating"}
            className="font-display inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-[0_14px_30px_-8px_rgba(238,147,168,0.6)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            style={{ background: `linear-gradient(135deg, ${animal.cornerColor}, var(--color-blush-deep))` }}
          >
            {status === "generating" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Painting your CuteQR...
              </>
            ) : (
              <>
                Create my CuteQR <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
          {status === "error" && errorMsg && (
            <p className="mt-3 text-sm font-medium text-[var(--color-fox-deep)]">{errorMsg}</p>
          )}
        </div>
      )}

      {status === "ready" && result && (
        <div className="mt-10 flex flex-col items-center">
          <div className="relative w-full max-w-[430px]">
            <div className="absolute -inset-5 rounded-[3rem] blur-3xl opacity-30" style={{ background: animal.accentSoft }} aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.dataUrl}
              alt={`${animal.label} artwork containing a scannable QR code for ${url}`}
              className="relative block w-full rounded-[2.5rem] shadow-[0_28px_70px_-24px_rgba(61,50,38,0.35)] ring-1 ring-black/5"
            />
            {result.isValid && (
              <Sparkles
                className="absolute top-4 right-4 w-7 h-7 text-[var(--color-butter-deep)] animate-sparkle drop-shadow-sm"
                aria-hidden="true"
              />
            )}
          </div>

          <p className="mt-6 font-display text-lg font-bold text-[var(--color-ink)]">
            Your {animal.label} CuteQR is ready! 🥹
          </p>

          {result.isValid ? (
            <p className="mt-1 text-sm font-semibold text-[var(--color-mint-deep)] flex items-center gap-1.5">
              ✅ Final artwork scan tested{result.simplified ? " (cleaner mode used for reliability)" : ""}
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-[var(--color-fox-deep)] text-center max-w-md">
              ⚠️ This artwork could not be verified as scannable. Try a shorter link or a darker QR color.
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!result.isValid}
              className="font-display inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Download className="w-4 h-4" /> Download artwork
            </button>
            <button
              type="button"
              onClick={() => setShowCustomize((s) => !s)}
              className="font-display inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <Palette className="w-4 h-4" /> Customize
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="font-display inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--color-ink)] shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Create another
            </button>
          </div>

          {showCustomize && (
            <div className="mt-6 w-full max-w-sm rounded-2xl bg-white p-5 shadow-md">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--color-ink-soft)]">
                  QR color
                  <input
                    type="color"
                    value={customization.fgColor || animal.dotColor}
                    onChange={(e) => handleCustomizationChange({ fgColor: e.target.value })}
                    className="h-9 w-full rounded-lg cursor-pointer"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-[var(--color-ink-soft)]">
                  Art background
                  <input
                    type="color"
                    value={customization.bgColor || animal.bgColor}
                    onChange={(e) => handleCustomizationChange({ bgColor: e.target.value })}
                    className="h-9 w-full rounded-lg cursor-pointer"
                  />
                </label>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-[var(--color-ink-soft)] mb-2">QR texture</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange({ moduleStyle: "rounded" })}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                      customization.moduleStyle === "rounded"
                        ? "bg-[var(--color-ink)] text-white"
                        : "bg-[var(--color-cream-deep)] text-[var(--color-ink)]"
                    }`}
                  >
                    Soft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomizationChange({ moduleStyle: "square" })}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                      customization.moduleStyle === "square"
                        ? "bg-[var(--color-ink)] text-white"
                        : "bg-[var(--color-cream-deep)] text-[var(--color-ink)]"
                    }`}
                  >
                    Crisp
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-[var(--color-ink-soft)] mb-2">
                  Artwork size: {customization.size}px
                </p>
                <input
                  type="range"
                  min={420}
                  max={840}
                  step={40}
                  value={customization.size}
                  onChange={(e) => handleCustomizationChange({ size: Number(e.target.value) })}
                  className="w-full accent-[var(--color-blush-deep)]"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
