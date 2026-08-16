import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildAmazonAuthorizationUrl, isAmazonConfigured, parseRegion } from "@/lib/amazon";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAmazonConfigured()) {
    return NextResponse.redirect(new URL("/amazon?error=not-configured", request.url));
  }

  const region = parseRegion(request.nextUrl.searchParams.get("region"));
  const state = randomUUID();
  const response = NextResponse.redirect(buildAmazonAuthorizationUrl(region, state));
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(
    "cuteqr_amazon_oauth",
    JSON.stringify({ state, region, createdAt: Date.now() }),
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
