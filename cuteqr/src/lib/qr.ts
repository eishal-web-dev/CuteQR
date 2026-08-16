import QRCodeStyling, { type Options, type DotType } from "qr-code-styling";
import jsQR from "jsqr";
import type { AnimalConfig, AnimalId } from "./animals";

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

  const dotColor = simplified ? "#111111" : customization.fgColor || animal.dotColor;
  const cornerColor = simplified ? "#111111" : animal.dotColor;

  return {
    width: customization.size,
    height: customization.size,
    type: "canvas",
    data: url,
    margin: simplified ? 20 : 16,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { type: dotType, color: dotColor },
    cornersSquareOptions: {
      type: simplified ? "square" : "extra-rounded",
      color: cornerColor,
    },
    cornersDotOptions: {
      type: simplified ? "square" : "dot",
      color: cornerColor,
    },
    // Transparent so the QR can visually merge into the illustrated animal
    // instead of looking like a white sticker placed on top of it.
    backgroundOptions: { color: "rgba(255,255,255,0)" },
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

async function validateBlob(blob: Blob, expectedUrl: string): Promise<boolean> {
  try {
    const imageData = await blobToImageData(blob);
    const decoded = jsQR(imageData.data, imageData.width, imageData.height);
    return decoded?.data === expectedUrl;
  } catch {
    return false;
  }
}

async function createBaseQR(
  url: string,
  animal: AnimalConfig,
  customization: QRCustomization,
  simplified: boolean
): Promise<Blob> {
  const qr = new QRCodeStyling(buildOptions(url, animal, customization, simplified));
  const raw = await qr.getRawData("png");
  if (!raw || !(raw instanceof Blob)) throw new Error("Could not generate QR code");
  return raw;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawTriangleEar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  width: number,
  height: number,
  outer: string,
  inner: string,
  flip = false
) {
  ctx.save();
  if (flip) {
    ctx.translate(cx * 2, 0);
    ctx.scale(-1, 1);
  }
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, baseY);
  ctx.lineTo(cx - width * 0.28, baseY - height);
  ctx.lineTo(cx + width / 2, baseY);
  ctx.closePath();
  ctx.fillStyle = outer;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - width * 0.27, baseY - height * 0.15);
  ctx.lineTo(cx - width * 0.2, baseY - height * 0.72);
  ctx.lineTo(cx + width * 0.23, baseY - height * 0.14);
  ctx.closePath();
  ctx.fillStyle = inner;
  ctx.globalAlpha = 0.72;
  ctx.fill();
  ctx.restore();
}

function drawEars(
  ctx: CanvasRenderingContext2D,
  animal: AnimalId,
  size: number,
  color: string,
  accent: string
) {
  const y = size * 0.19;
  if (animal === "bunny") {
    ctx.fillStyle = color;
    roundedRect(ctx, size * 0.24, size * 0.01, size * 0.13, size * 0.28, size * 0.07);
    ctx.fill();
    roundedRect(ctx, size * 0.63, size * 0.01, size * 0.13, size * 0.28, size * 0.07);
    ctx.fill();
    ctx.globalAlpha = 0.48;
    ctx.fillStyle = accent;
    roundedRect(ctx, size * 0.275, size * 0.045, size * 0.06, size * 0.2, size * 0.04);
    ctx.fill();
    roundedRect(ctx, size * 0.665, size * 0.045, size * 0.06, size * 0.2, size * 0.04);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }

  if (animal === "panda") {
    ctx.fillStyle = "#202020";
    ctx.beginPath();
    ctx.arc(size * 0.27, size * 0.16, size * 0.105, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.73, size * 0.16, size * 0.105, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (animal === "puppy") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(size * 0.21, size * 0.22, size * 0.095, size * 0.16, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size * 0.79, size * 0.22, size * 0.095, size * 0.16, 0.35, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  drawTriangleEar(ctx, size * 0.28, y, size * 0.22, size * 0.22, color, accent);
  drawTriangleEar(ctx, size * 0.72, y, size * 0.22, size * 0.22, color, accent, true);
}

function drawFur(
  ctx: CanvasRenderingContext2D,
  animal: AnimalId,
  size: number,
  color: string,
  accent: string
) {
  const count = animal === "panda" ? 90 : 150;
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const angle = (i * 2.3999632297) % (Math.PI * 2);
    const radius = size * (0.31 + ((i * 37) % 100) / 1000);
    const cx = size * 0.5 + Math.cos(angle) * radius;
    const cy = size * 0.49 + Math.sin(angle) * radius * 0.92;
    const len = size * (0.018 + ((i * 17) % 25) / 1500);
    ctx.strokeStyle = i % 4 === 0 ? accent : color;
    ctx.globalAlpha = animal === "panda" ? 0.12 : 0.16;
    ctx.lineWidth = Math.max(1, size * 0.004);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMuzzle(
  ctx: CanvasRenderingContext2D,
  animal: AnimalId,
  size: number,
  color: string,
  accent: string
) {
  const y = size * 0.85;
  ctx.save();

  if (animal === "panda") {
    ctx.fillStyle = "rgba(255,255,255,0.92)";
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.68)";
  }
  ctx.beginPath();
  ctx.ellipse(size * 0.5, y, size * 0.16, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = animal === "fox" ? "#2F1D17" : animal === "panda" ? "#151515" : color;
  ctx.beginPath();
  ctx.moveTo(size * 0.47, y - size * 0.025);
  ctx.quadraticCurveTo(size * 0.5, y - size * 0.045, size * 0.53, y - size * 0.025);
  ctx.quadraticCurveTo(size * 0.5, y + size * 0.015, size * 0.47, y - size * 0.025);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = Math.max(1.4, size * 0.004);
  ctx.beginPath();
  ctx.moveTo(size * 0.5, y + size * 0.005);
  ctx.quadraticCurveTo(size * 0.47, y + size * 0.055, size * 0.43, y + size * 0.03);
  ctx.moveTo(size * 0.5, y + size * 0.005);
  ctx.quadraticCurveTo(size * 0.53, y + size * 0.055, size * 0.57, y + size * 0.03);
  ctx.stroke();

  if (animal === "cat" || animal === "fox" || animal === "bunny") {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.32;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const yy = y - size * 0.015 + i * size * 0.026;
        ctx.beginPath();
        ctx.moveTo(size * 0.5 + side * size * 0.1, yy);
        ctx.lineTo(size * 0.5 + side * size * 0.26, yy - size * 0.02 + i * size * 0.006);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

async function composeAnimalArtwork(
  qrBlob: Blob,
  animal: AnimalConfig,
  customization: QRCustomization,
  safeMode: boolean
): Promise<Blob> {
  const size = Math.max(420, customization.size);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const bg = customization.bgColor || animal.bgColor;
  const gradient = ctx.createRadialGradient(size * 0.5, size * 0.43, size * 0.08, size * 0.5, size * 0.5, size * 0.72);
  gradient.addColorStop(0, "#FFFFFF");
  gradient.addColorStop(0.56, bg);
  gradient.addColorStop(1, animal.accentSoft);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Soft halo behind the animal silhouette.
  ctx.save();
  ctx.shadowColor = "rgba(61,50,38,0.18)";
  ctx.shadowBlur = size * 0.05;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  roundedRect(ctx, size * 0.08, size * 0.105, size * 0.84, size * 0.82, size * 0.21);
  ctx.fill();
  ctx.restore();

  drawEars(ctx, animal.id, size, animal.earColor, animal.accentSoft);
  drawFur(ctx, animal.id, size, animal.earColor, animal.accentSoft);

  const qrSide = size * 0.66;
  const qx = (size - qrSide) / 2;
  const qy = size * 0.17;

  // The QR sits inside the face rather than on a separate card. In art mode
  // the backing is translucent so the animal palette/fur shows through;
  // fallback mode becomes nearly-white for maximum decoding reliability.
  ctx.fillStyle = safeMode ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.78)";
  roundedRect(ctx, qx - size * 0.018, qy - size * 0.018, qrSide + size * 0.036, qrSide + size * 0.036, size * 0.055);
  ctx.fill();

  const bitmap = await createImageBitmap(qrBlob);
  ctx.drawImage(bitmap, qx, qy, qrSide, qrSide);

  drawMuzzle(ctx, animal.id, size, animal.dotColor, animal.accentSoft);

  // Tiny glossy highlights make the finished output feel like an illustration,
  // not a QR pasted into a decorative frame.
  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.ellipse(size * 0.25, size * 0.27, size * 0.035, size * 0.016, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.75, size * 0.27, size * 0.035, size * 0.016, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
  if (!blob) throw new Error("Could not render animal artwork");
  return blob;
}

async function tryGenerate(
  url: string,
  animal: AnimalConfig,
  customization: QRCustomization,
  simplified: boolean
): Promise<{ blob: Blob; valid: boolean }> {
  const base = await createBaseQR(url, animal, customization, simplified);
  const art = await composeAnimalArtwork(base, animal, customization, simplified);
  return { blob: art, valid: await validateBlob(art, url) };
}

/**
 * Generates a cute animal artwork with the QR visually embedded into the face,
 * then scan-tests the FINAL composited image. If the art treatment harms
 * decoding, it automatically retries with a cleaner high-contrast treatment.
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
