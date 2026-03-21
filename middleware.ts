import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/jwt";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";

const AUTH_ONLY_PATHS = ["/user/login", "/user/signup"];
const PROTECTED_PATHS = ["/admin", "/mods/AddMod", "/user-management", "/api/mods", "/api/upload/file", "/api/admin"];
const ADMIN_PATHS = ["/admin", "/api/admin"];
const MOD_PATHS = ["/mods/AddMod", "/user-management", "/api/mods", "/api/upload/file"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let user: Awaited<ReturnType<typeof validateToken>> | null = null;

  if (token) {
    try {
      user = await validateToken(token);
    } catch {
      const response = NextResponse.next();
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  if (AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path)) && user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path)) && !user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/user/login", req.url));
  }

  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (!user || user.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/user/login", req.url));
    }
  }

  if (MOD_PATHS.some((path) => pathname.startsWith(path))) {
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|ads.txt|sitemap.xml).*)"],
};
