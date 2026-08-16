import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isAmazonCallback(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "amazon.com" || url.hostname.endsWith(".amazon.com") || url.hostname.startsWith("amazon."));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const callbackUri = request.nextUrl.searchParams.get("amazon_callback_uri");
  const amazonState = request.nextUrl.searchParams.get("amazon_state");
  const sellerId = request.nextUrl.searchParams.get("selling_partner_id");
  const version = request.nextUrl.searchParams.get("version");

  if (!callbackUri || !amazonState || !sellerId || !isAmazonCallback(callbackUri)) {
    return NextResponse.redirect(new URL("/amazon?error=invalid-amazon-login", request.url));
  }

  const state = randomUUID();
  const callback = new URL(callbackUri);
  callback.searchParams.set("amazon_state", amazonState);
  callback.searchParams.set("state", state);
  callback.searchParams.set("redirect_uri", "https://cuteqr-weld.vercel.app/api/amazon/callback");
  if (version === "beta") callback.searchParams.set("version", "beta");

  const response = NextResponse.redirect(callback);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(
    "cuteqr_amazon_oauth",
    JSON.stringify({ state, region: "eu", createdAt: Date.now(), sellerId }),
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    }
  );
  return response;
}
