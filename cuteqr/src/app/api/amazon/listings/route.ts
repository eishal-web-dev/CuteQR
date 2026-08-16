import { NextRequest, NextResponse } from "next/server";
import { decryptAmazonSession, getAmazonListings } from "@/lib/amazon";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const marketplaceId = request.nextUrl.searchParams.get("marketplaceId");
  if (!marketplaceId) {
    return NextResponse.json({ error: "marketplaceId is required" }, { status: 400 });
  }

  const encrypted = request.cookies.get("cuteqr_amazon_session")?.value;
  const session = encrypted ? decryptAmazonSession(encrypted) : null;
  if (!session) return NextResponse.json({ error: "Amazon not connected" }, { status: 401 });

  try {
    const listings = await getAmazonListings(session, marketplaceId);
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Amazon listings failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Amazon request failed" }, { status: 502 });
  }
}
