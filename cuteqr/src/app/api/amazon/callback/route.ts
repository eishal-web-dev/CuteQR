import { NextRequest, NextResponse } from "next/server";
import { encryptAmazonSession, exchangeAmazonAuthorizationCode, parseRegion } from "@/lib/amazon";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");
  const sellerId = request.nextUrl.searchParams.get("selling_partner_id");
  const code = request.nextUrl.searchParams.get("spapi_oauth_code");
  const oauthCookie = request.cookies.get("cuteqr_amazon_oauth")?.value;

  if (!state || !sellerId || !code || !oauthCookie) {
    return NextResponse.redirect(new URL("/amazon?error=missing-oauth-data", request.url));
  }

  let saved: { state?: string; region?: string; createdAt?: number } = {};
  try {
    saved = JSON.parse(oauthCookie);
  } catch {
    return NextResponse.redirect(new URL("/amazon?error=invalid-oauth-state", request.url));
  }

  const tooOld = !saved.createdAt || Date.now() - saved.createdAt > 10 * 60 * 1000;
  if (tooOld || saved.state !== state) {
    return NextResponse.redirect(new URL("/amazon?error=state-mismatch", request.url));
  }

  try {
    const tokens = await exchangeAmazonAuthorizationCode(code);
    const session = encryptAmazonSession({
      refreshToken: tokens.refreshToken,
      sellerId,
      region: parseRegion(saved.region),
    });

    const response = NextResponse.redirect(new URL("/amazon?connected=1", request.url));
    response.headers.set("Referrer-Policy", "no-referrer");
    response.cookies.delete("cuteqr_amazon_oauth");
    response.cookies.set("cuteqr_amazon_session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    console.error("Amazon OAuth callback failed", error);
    return NextResponse.redirect(new URL("/amazon?error=token-exchange", request.url));
  }
}
