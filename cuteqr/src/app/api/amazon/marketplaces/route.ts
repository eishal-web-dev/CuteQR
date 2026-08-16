import { NextRequest, NextResponse } from "next/server";
import { decryptAmazonSession, getAmazonMarketplaces } from "@/lib/amazon";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const encrypted = request.cookies.get("cuteqr_amazon_session")?.value;
  const session = encrypted ? decryptAmazonSession(encrypted) : null;
  if (!session) return NextResponse.json({ error: "Amazon not connected" }, { status: 401 });

  try {
    const marketplaces = await getAmazonMarketplaces(session);
    return NextResponse.json({ marketplaces });
  } catch (error) {
    console.error("Amazon marketplaces failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Amazon request failed" }, { status: 502 });
  }
}
