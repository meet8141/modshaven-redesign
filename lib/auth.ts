import { cookies } from "next/headers";
import { validateToken, type UserPayload } from "@/lib/jwt";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";

export async function getUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    return await validateToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<UserPayload> {
  const user = await getUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}

export async function requireRole(...roles: Array<"USER" | "MODERATOR" | "ADMIN">): Promise<UserPayload> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function requireAdminOrModerator(): Promise<UserPayload> {
  return requireRole("ADMIN", "MODERATOR");
}
