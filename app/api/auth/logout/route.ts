import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";

export async function GET() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
