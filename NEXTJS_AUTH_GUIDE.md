# Modshaven Auth System — Next.js Recreation Guide

Full recreation of the existing Express/JWT/MongoDB login system in **Next.js 14+ (App Router)**.
This is a **custom JWT + httpOnly cookie** implementation — no NextAuth, no third-party auth library — so it mirrors the current system exactly.

---

## Table of Contents

1. [How the Current System Works](#1-current-system-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Environment Variables (all keys)](#3-environment-variables)
4. [Project File Structure](#4-file-structure)
5. [Database — User Model](#5-user-model)
6. [JWT Service](#6-jwt-service)
7. [Password Hashing Utility](#7-password-hashing)
8. [API Routes](#8-api-routes)
9. [Next.js Middleware (Route Protection)](#9-nextjs-middleware)
10. [Server-side Auth Helper](#10-server-side-auth-helper)
11. [Rate Limiter](#11-rate-limiter)
12. [UI Pages — Login & Signup](#12-ui-pages)
13. [useUser Hook (Client Components)](#13-useuser-hook)
14. [Role-based Access Control](#14-role-based-access-control)
15. [Security Notes](#15-security-notes)
16. [Setup Checklist](#16-setup-checklist)

---

## 1. Current System Overview

| Concern | Current (Express) | Next.js Equivalent |
|---|---|---|
| Password hashing | `crypto.createHmac("sha256", salt)` | Same — no change |
| Token format | JWT (jsonwebtoken) | JWT (jose — Edge-compatible) |
| Token storage | `httpOnly` cookie named `token` | Same |
| Cookie flags | `httpOnly`, `secure`, `sameSite:strict`, 7d maxAge | Same via `cookies()` API |
| Auth check | `checkForAuthenticationCookie` middleware | `middleware.ts` + `getUser()` helper |
| Rate limiting | In-memory Map (per IP) | In-memory Map via `middleware.ts` or `upstash/ratelimit` |
| Roles | `USER` / `MODERATOR` / `ADMIN` enum | Same — stored in JWT payload |
| DB | MongoDB via Mongoose | Same |

---

## 2. Tech Stack & Dependencies

```bash
npm install mongoose jose bcryptjs
# or use the existing crypto-based hashing (no bcrypt needed — see §7)

# Optional but recommended for production rate limiting:
npm install @upstash/ratelimit @upstash/redis
```

> **Why `jose` instead of `jsonwebtoken`?**  
> Next.js Middleware runs on the **Edge Runtime** which does not support Node.js `crypto` or `jsonwebtoken`.  
> `jose` is a Web-Crypto-based JWT library that works in both Edge and Node environments.

---

## 3. Environment Variables

Create a `.env.local` file in your Next.js project root.

```env
# ─── MongoDB ───────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/modshaven?retryWrites=true&w=majority

# ─── JWT ───────────────────────────────────────────────────
# MUST be at least 32 characters. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_32_plus_char_secret_here

JWT_ISSUER=modshaven.com
JWT_AUDIENCE=modshaven-users
JWT_EXPIRES_IN=7d          # 7 days — matches current system

# ─── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://modshaven.com   # used for CORS / redirects
NODE_ENV=production                          # set to "development" locally

# ─── Rate Limiting (optional — Upstash Redis for production) ──
UPSTASH_REDIS_REST_URL=https://your-upstash-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# ─── Cookie name (optional — defaults to "token") ──────────
AUTH_COOKIE_NAME=token
```

### Key Reference Table

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | Full MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing/verifying JWTs. Min 32 chars |
| `JWT_ISSUER` | ✅ | JWT `iss` claim. Must match on sign + verify |
| `JWT_AUDIENCE` | ✅ | JWT `aud` claim. Must match on sign + verify |
| `JWT_EXPIRES_IN` | ✅ | Token lifetime e.g. `7d`, `24h` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL of the site |
| `NODE_ENV` | ✅ | `production` enables secure cookie flag |
| `UPSTASH_REDIS_REST_URL` | ⚠️ optional | For distributed rate limiting in production |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ optional | For distributed rate limiting in production |
| `AUTH_COOKIE_NAME` | ❌ optional | Defaults to `token` |

---

## 4. File Structure

```
your-nextjs-app/
├── .env.local
├── middleware.ts                        ← Route protection + rate limiting
├── app/
│   ├── layout.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                ← Login UI
│   │   └── signup/
│   │       └── page.tsx                ← Signup UI
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts            ← POST /api/auth/login
│   │       ├── logout/
│   │       │   └── route.ts            ← GET  /api/auth/logout
│   │       └── signup/
│   │           └── route.ts            ← POST /api/auth/signup
│   └── dashboard/
│       └── page.tsx                    ← Example protected page
├── lib/
│   ├── db.ts                           ← MongoDB connection helper
│   ├── jwt.ts                          ← Token create / validate (jose)
│   ├── hash.ts                         ← Password hashing (matches current)
│   ├── auth.ts                         ← Server-side getUser() helper
│   └── rateLimiter.ts                  ← In-memory rate limiter
├── models/
│   └── User.ts                         ← Mongoose User model
└── hooks/
    └── useUser.ts                      ← Client-side user hook
```

---

## 5. User Model

`models/User.ts` — identical schema and hashing logic to the current system.

```typescript
import { createHmac, randomBytes } from "crypto";
import mongoose, { Schema, model, models, Document } from "mongoose";
import { createTokenForUser } from "@/lib/jwt";

export interface IUser extends Document {
  fullName: string;
  email: string;
  salt?: string;
  password: string;
  profileImageURL: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  roleHistory: {
    oldRole?: string;
    newRole: string;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    reason?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends mongoose.Model<IUser> {
  matchPasswordAndGenerateToken(fullName: string, password: string): Promise<string>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    salt:     { type: String },
    password: { type: String, required: true },
    profileImageURL: { type: String, default: "/icon/logo_1.png" },
    role: {
      type: String,
      enum: ["USER", "MODERATOR", "ADMIN"],
      default: "USER",
    },
    roleHistory: [
      {
        oldRole:   { type: String, enum: ["USER", "MODERATOR", "ADMIN"] },
        newRole:   { type: String, enum: ["USER", "MODERATOR", "ADMIN"], required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
        changedAt: { type: Date, default: Date.now },
        reason:    { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving — same algorithm as existing Express app
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");
  this.salt = salt;
  this.password = hashedPassword;
  next();
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (fullName: string, password: string): Promise<string> {
    const user = await this.findOne({ fullName }).select(
      "salt password role email profileImageURL _id"
    );
    if (!user) throw new Error("User not found");

    const userProvidedHash = createHmac("sha256", user.salt!)
      .update(password)
      .digest("hex");

    if (user.password !== userProvidedHash) throw new Error("Incorrect password");

    return createTokenForUser(user);
  }
);

const User = (models.user as UserModel) || model<IUser, UserModel>("user", userSchema);
export default User;
```

---

## 6. JWT Service

`lib/jwt.ts` — uses `jose` so it works on both Edge and Node runtimes.

```typescript
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const issuer  = process.env.JWT_ISSUER   ?? "modshaven.com";
const audience = process.env.JWT_AUDIENCE ?? "modshaven-users";

export interface UserPayload extends JWTPayload {
  _id: string;
  email: string;
  profileImageURL: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

export async function createTokenForUser(user: {
  _id: unknown;
  email: string;
  profileImageURL: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    _id:             String(user._id),
    email:           user.email,
    profileImageURL: user.profileImageURL,
    role:            user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(secret);
}

export async function validateToken(token: string): Promise<UserPayload> {
  const { payload } = await jwtVerify(token, secret, { issuer, audience });
  return payload as UserPayload;
}
```

---

## 7. Password Hashing

`lib/hash.ts` — standalone helper if you ever need to hash outside of the model.

```typescript
import { createHmac, randomBytes } from "crypto";

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return hash === storedHash;
}
```

---

## 8. API Routes

### `lib/db.ts` — MongoDB connection (singleton for Next.js)

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: typeof import("mongoose") | null; promise: Promise<typeof import("mongoose")> | null };
}

let cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

### `app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginRateLimiter } from "@/lib/rateLimiter";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";
const IS_PROD     = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  // Rate limiting — 5 attempts per 15 minutes per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, remaining } = loginRateLimiter(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let body: { fullName?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fullName, password } = body;

  // Input validation
  if (
    !fullName || !password ||
    typeof fullName !== "string" || typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "Please provide a valid username and password" },
      { status: 400 }
    );
  }

  const sanitizedFullName = fullName.trim().replace(/\0/g, "");

  try {
    await connectDB();
    const token = await User.matchPasswordAndGenerateToken(sanitizedFullName, password);

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   IS_PROD,
      sameSite: "strict",
      maxAge:   7 * 24 * 60 * 60, // 7 days in seconds
      path:     "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Incorrect username or password" },
      { status: 401 }
    );
  }
}
```

---

### `app/api/auth/logout/route.ts`

```typescript
import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";

export async function GET() {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL!)
  );
  response.cookies.delete(COOKIE_NAME);
  return response;
}
```

---

### `app/api/auth/signup/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  let body: { fullName?: unknown; email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fullName, email, password } = body;

  if (
    !fullName || !email || !password ||
    typeof fullName !== "string" ||
    typeof email    !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  try {
    await connectDB();
    await User.create({
      fullName: fullName.trim().replace(/\0/g, ""),
      email:    email.trim().toLowerCase().replace(/\0/g, ""),
      password,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
```

---

## 9. Next.js Middleware

`middleware.ts` (project root) — runs on the Edge Runtime, validates the JWT cookie, and blocks unauthenticated/unauthorized access before the page renders.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/jwt";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";

// Routes that require the user to be logged out (redirect to / if already authed)
const AUTH_ONLY_PATHS = ["/login", "/signup"];

// Routes that require authentication — add your protected paths here
const PROTECTED_PATHS = ["/dashboard", "/admin", "/upload", "/user-management"];

// Routes that require ADMIN role
const ADMIN_PATHS = ["/admin"];

// Routes that require ADMIN or MODERATOR role
const MOD_PATHS = ["/upload", "/user-management"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let user = null;
  if (token) {
    try {
      user = await validateToken(token);
    } catch {
      // Invalid / expired token — clear it
      const response = NextResponse.next();
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // Logged-in users should not reach login/signup
  if (AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p)) && user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protected routes — must be logged in
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin-only routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Moderator-or-admin routes
  if (MOD_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|ads.txt|sitemap.xml).*)"],
};
```

---

## 10. Server-side Auth Helper

`lib/auth.ts` — call from **Server Components** and **Server Actions** to get the current user.

```typescript
import { cookies } from "next/headers";
import { validateToken, type UserPayload } from "@/lib/jwt";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "token";

/**
 * Returns the validated user payload from the JWT cookie, or null if not
 * authenticated / token is invalid. Safe to call from any Server Component.
 */
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

/** Throws a 401 response if the user is not authenticated. */
export async function requireAuth(): Promise<UserPayload> {
  const user = await getUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

/** Throws a 403 response if the user does not have the required role. */
export async function requireRole(
  ...roles: Array<"USER" | "MODERATOR" | "ADMIN">
): Promise<UserPayload> {
  const user = await requireAuth();
  if (!roles.includes(user.role as "USER" | "MODERATOR" | "ADMIN")) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}
```

**Usage example in a Server Component:**

```tsx
// app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth(); // redirects to /login if not authed

  return <div>Welcome, {user.email}</div>;
}
```

---

## 11. Rate Limiter

`lib/rateLimiter.ts` — in-memory, exact port of the existing Express rate limiter. For multi-instance production deployments, swap this with the Upstash Redis version shown below.

```typescript
// ── In-memory rate limiter (single instance / development) ──

interface AttemptRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, AttemptRecord>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store.entries()) {
      if (now > val.resetTime) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function loginRateLimiter(
  ip: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetTime) {
    store.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count };
}
```

**Production alternative — Upstash Redis (works across multiple server instances):**

```typescript
// lib/rateLimiter.ts (production version)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis:     Redis.fromEnv(),        // reads UPSTASH_REDIS_REST_URL + TOKEN
  limiter:   Ratelimit.slidingWindow(5, "15 m"),
  analytics: false,
});

export async function loginRateLimiter(ip: string) {
  const { success, remaining } = await ratelimit.limit(`login:${ip}`);
  return { allowed: success, remaining };
}
```

---

## 12. UI Pages

### `app/(auth)/login/page.tsx`

```tsx
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const fullName = form.get("fullName") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fullName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/");
      router.refresh(); // re-run Server Components with new auth state
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="fullName"
          type="text"
          placeholder="Username"
          required
          autoComplete="username"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="current-password"
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </main>
  );
}
```

### `app/(auth)/signup/page.tsx`

```tsx
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email:    form.get("email"),
          password: form.get("password"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        <input name="fullName" type="text"     placeholder="Username"  required />
        <input name="email"    type="email"    placeholder="Email"     required />
        <input name="password" type="password" placeholder="Password"  required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
```

---

## 13. useUser Hook

`hooks/useUser.ts` — lightweight client-side hook. Reads user info from a public `/api/auth/me` endpoint so Client Components can access auth state without exposing the JWT.

First add the `/api/auth/me` route:

```typescript
// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: {
      _id:             user._id,
      email:           user.email,
      role:            user.role,
      profileImageURL: user.profileImageURL,
    },
  });
}
```

Then the hook:

```typescript
// hooks/useUser.ts
"use client";
import { useEffect, useState } from "react";

interface AuthUser {
  _id: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  profileImageURL: string;
}

export function useUser() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => setUser(user))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
```

---

## 14. Role-based Access Control

### In Server Components (recommended)

```tsx
// any Server Component
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  await requireRole("ADMIN"); // throws 403 if not ADMIN
  return <div>Admin panel</div>;
}
```

### In middleware (for entire route segments)

Already covered in §9 — add the path to `ADMIN_PATHS` or `MOD_PATHS`.

### Role enum reference

| Role | Description |
|---|---|
| `USER` | Default role for all registered users |
| `MODERATOR` | Can upload mods and access user management |
| `ADMIN` | Full access, can change user roles |

---

## 15. Security Notes

All security measures from the current Express app are preserved:

| Measure | Implementation |
|---|---|
| **httpOnly cookie** | `response.cookies.set(…, { httpOnly: true })` — JS cannot access the token |
| **Secure flag** | Set when `NODE_ENV === "production"` — cookie only sent over HTTPS |
| **SameSite: strict** | Prevents CSRF — cookie not sent on cross-site requests |
| **JWT issuer + audience** | Token is rejected if `iss` or `aud` don't match |
| **7-day expiry** | Token auto-expires; Next.js middleware invalidates early if signature fails |
| **HMAC-SHA256 password hashing** | Same `crypto.createHmac` + random salt as existing system |
| **Input sanitization** | `.trim()` + null-byte `\0` removal before DB operations |
| **NoSQL injection prevention** | Mongoose casts values; only `findOne({ fullName })` with trusted string |
| **Rate limiting** | 5 login attempts per 15 min per IP |
| **No password in JWT** | Payload contains `_id`, `email`, `role`, `profileImageURL` only |

---

## 16. Setup Checklist

```
[ ] npx create-next-app@latest my-app --typescript --app
[ ] cd my-app
[ ] npm install mongoose jose
[ ] Copy .env.local with all variables from §3
[ ] Generate JWT_SECRET:
      node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
[ ] Create lib/db.ts
[ ] Create lib/jwt.ts
[ ] Create lib/hash.ts
[ ] Create lib/auth.ts
[ ] Create lib/rateLimiter.ts
[ ] Create models/User.ts
[ ] Create app/api/auth/login/route.ts
[ ] Create app/api/auth/logout/route.ts
[ ] Create app/api/auth/signup/route.ts
[ ] Create app/api/auth/me/route.ts
[ ] Create middleware.ts (root)
[ ] Create app/(auth)/login/page.tsx
[ ] Create app/(auth)/signup/page.tsx
[ ] Create hooks/useUser.ts
[ ] Add PROTECTED_PATHS / ADMIN_PATHS / MOD_PATHS to middleware.ts as needed
[ ] Test login → JWT in cookie → protected page → logout → cookie cleared
[ ] Verify cookie flags in browser DevTools → Application → Cookies
```

---

> **Password migration note:** User passwords are hashed with `HMAC-SHA256 + random salt`. This is portable — if you're migrating an existing MongoDB database from the current Express app to the Next.js app, **no re-hashing is needed**. The `matchPasswordAndGenerateToken` static method in `models/User.ts` uses the exact same algorithm, so existing user accounts will work immediately.
