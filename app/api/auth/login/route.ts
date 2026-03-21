import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/DB";
import User from "@/models/User";
import { loginRateLimiter } from "@/lib/rateLimiter";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";
const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = loginRateLimiter(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let body: { fullName?: unknown; email?: unknown; identifier?: unknown; password?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fullName, email, identifier, password } = body;
  const rawIdentifier =
    typeof identifier === "string"
      ? identifier
      : typeof fullName === "string"
        ? fullName
        : typeof email === "string"
          ? email
          : "";

  if (
    !rawIdentifier ||
    !password ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "Please provide a valid username and password" },
      { status: 400 }
    );
  }

  const sanitizedIdentifier = rawIdentifier.trim().replace(/\0/g, "");

  try {
    await connectToDatabase();
    const token = await User.matchPasswordAndGenerateToken(sanitizedIdentifier, password);

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }
}
