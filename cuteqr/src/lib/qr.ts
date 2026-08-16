import QRCodeStyling, { type Options, type DotType } from "qr-code-styling";
import jsQR from "jsqr";
import type { AnimalConfig } from "./animals";

export interface QRCustomization {
  fgColor?: string;
  bgColor?: string;
  moduleStyle: "rounded" | "square";
  size: number;
}

export interface GenerateResult {
  blob: Blob;
  dataUrl: string;
  isValid: boolean;
  simplified: boolean;
}

function hexToLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// QR codes need considerably more contrast than text (WCAG's 4.5:1 is too
// low) since decoders binarize the whole image. 4:1 is already borderline;
// we use this as an early signal to skip straight to the safe fallback
// rather than wasting a render-and-decode cycle on a combo likely to fail.
const MIN_QR_CONTRAST = 4.0;

function buildOptions(
  url: string,
  animal: AnimalConfig,
  customization: QRCustomization,
  simplified: boolean
): Options {
  const dotType: DotType = simplified
    ? "square"
    : customization.moduleStyle === "rounded"
    ? "extra-rounded"
    : "square";

  // Finder pattern corners MUST stay dark/high-contrast to remain
  // reliably scannable — verified empirically: pastel corner colors
  // cause total decode failure even when the rest of the QR is fine.
  // This is intentionally NOT user-customizable for this reason.
  const cornerColor = animal.dotColor;

  // In simplified/fallback mode, also override dot and background colors
  // to guaranteed-safe defaults — this is the last line of defense if a
  // user's custom color choice caused the styled version to fail
  // validation (e.g. a light color with insufficient contrast).
  const dotColor = simplified ? "#000000" : customization.fgColor || animal.dotColor;
  const bgColor = simplified ? "#FFFFFF" : customization.bgColor || "#FFFFFF";

  return {
    width: customization.size,
    height: customization.size,
    type: "canvas",
    data: url,
    margin: 16,
    qrOptions: {
      errorCorrectionLevel: "H",
    },
    dotsOptions: {
      type: dotType,
      color: dotColor,
    },
    cornersSquareOptions: {
      type: simplified ? "square" : "extra-rounded",
      color: simplified ? "#000000" : cornerColor,
    },
    cornersDotOptions: {
      type: simplified ? "square" : "dot",
      color: simplified ? "#000000" : cornerColor,
    },
    backgroundOptions: {
      color: bgColor,
      round: simplified ? 0 : 0.08,
    },
  };
}

async function blobToImageData(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function tryGenerate(
  url: string,
  animal: AnimalConfig,
  customization: QRCustomization,
  simplified: boolean
): Promise<{ blob: Blob; valid: boolean }> {
  const options = buildOptions(url, animal, customization, simplified);
  const qr = new QRCodeStyling(options);
  const raw = await qr.getRawData("png");
  if (!raw || !(raw instanceof Blob)) {
    return { blob: new Blob(), valid: false };
  }

  let valid = false;
  try {
    const imageData = await blobToImageData(raw);
    const decoded = jsQR(imageData.data, imageData.width, imageData.height);
    valid = decoded?.data === url;
  } catch {
    valid = false;
  }

  return { blob: raw, valid };
}

/**
 * Generates a styled QR code and validates it actually decodes back to the
 * original URL using an in-browser QR decoder. If the styled version fails
 * to decode, automatically falls back to a simplified, higher-contrast
 * style and re-validates before returning.
 */
export async function generateAndValidateQR(
  url: string,
  animal: AnimalConfig,
  customization: QRCustomization
): Promise<GenerateResult> {
  const fg = customization.fgColor || animal.dotColor;
  const bg = customization.bgColor || "#FFFFFF";
  const contrastOk = contrastRatio(fg, bg) >= MIN_QR_CONTRAST;

  const styled = contrastOk
    ? await tryGenerate(url, animal, customization, false)
    : { blob: new Blob(), valid: false };

  let finalBlob = styled.blob;
  let isValid = styled.valid;
  let simplified = false;

  if (!styled.valid) {
    const fallback = await tryGenerate(url, animal, customization, true);
    finalBlob = fallback.blob;
    isValid = fallback.valid;
    simplified = true;
  }

  const dataUrl = URL.createObjectURL(finalBlob);

  return { blob: finalBlob, dataUrl, isValid, simplified };
}

export function isLikelyUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  try {
    new URL(trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
