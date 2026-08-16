import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/amazon", request.url), 303);
  response.cookies.delete("cuteqr_amazon_session");
  response.cookies.delete("cuteqr_amazon_oauth");
  return response;
}
