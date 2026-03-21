# Modshaven Admin Pages — Next.js Recreation Guide

This guide recreates your current Express admin dashboard in Next.js 14+ (App Router), including:

- Admin dashboard page
- Mod management (list/filter/edit/delete)
- Ads mode controls per mod (0/1/2)
- User management (create/edit/delete)
- Role history tracking
- User upload history
- Blog management hooks used by admin dashboard
- Dashboard stats and top downloads APIs

It is written to preserve current behavior while fitting Next.js server/client patterns.

---

## 1) Current Admin Behavior (Contract)

Your existing admin implementation does the following:

- Global route protection via `checkForAdmin`
- Sanitization middleware via `sanitizeInput`
- Dashboard with pagination, search, sort, game filter
- Data sections on one page:
  - Mods table
  - Blogs table
  - Users table
- APIs used by dashboard JS:
  - `GET /admin/api/stats`
  - `GET /admin/api/top-downloads`
  - `GET /admin/api/mod/:id`
  - `PUT /admin/api/mod/:id`
  - `PATCH /admin/api/mod/:id/ads`
  - `DELETE /admin/api/mod/:id`
  - `GET /admin/api/user/:id`
  - `GET /admin/api/user/:id/role-history`
  - `GET /admin/api/user/:id/upload-history`
  - `POST /admin/api/user`
  - `PUT /admin/api/user/:id`
  - `DELETE /admin/api/user/:id`
- Blog admin actions triggered from admin UI:
  - `DELETE /blog/delete/:id`
  - edit redirect to `/blog/edit/:id`

---

## 2) Dependencies

```bash
npm install mongoose jose zod
npm install @tanstack/react-query recharts
# optional but recommended for validation and forms
npm install react-hook-form @hookform/resolvers
```

Why these:
- `jose`: Edge-compatible JWT validation
- `react-query`: dashboard data fetching + mutation cache invalidation
- `recharts`: chart replacement for Chart.js-style widgets
- `zod`: request payload validation

---

## 3) Environment Variables (All Necessary Keys)

Create `.env.local`:

```env
# ─── Core DB/Auth ─────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/modshaven
JWT_SECRET=replace_with_32plus_char_secret
JWT_ISSUER=modshaven.com
JWT_AUDIENCE=modshaven-users
JWT_EXPIRES_IN=7d
AUTH_COOKIE_NAME=token
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Optional: if admin area includes add-mod image uploads/edit workflows ───
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_BUCKET_NAME=your_r2_bucket
R2_PUBLIC_URL=https://cdn.yourdomain.com

# ─── Optional: if admin handles direct downloadable file uploads ──────────────
UPLOAD_R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
UPLOAD_R2_ACCESS_KEY_ID=your_upload_key
UPLOAD_R2_SECRET_ACCESS_KEY=your_upload_secret
UPLOAD_R2_BUCKET_NAME=your_upload_bucket
UPLOAD_R2_PUBLIC_URL=https://downloads.yourdomain.com

# ─── Optional: if file upload flow includes VirusTotal info ───────────────────
VIRUSTOTAL_API_KEY=your_virustotal_api_key
```

### Key Matrix

| Key | Required | Used By |
|---|---|---|
| `MONGODB_URI` | Yes | All admin APIs (mods/blogs/users) |
| `JWT_SECRET` | Yes | Verify admin auth token |
| `JWT_ISSUER` | Yes | Token claim validation |
| `JWT_AUDIENCE` | Yes | Token claim validation |
| `JWT_EXPIRES_IN` | Yes | Token lifetime config |
| `AUTH_COOKIE_NAME` | Yes | Admin auth cookie read |
| `NODE_ENV` | Yes | Secure cookie behavior |
| `NEXT_PUBLIC_APP_URL` | Yes | URL redirects / absolute URL operations |
| `R2_*` | Optional | Add/edit mod image upload workflows |
| `UPLOAD_R2_*` | Optional | Upload downloadable mod files |
| `VIRUSTOTAL_API_KEY` | Optional | File scan metadata |

---

## 4) Next.js Folder Structure

```text
app/
  (admin)/
    admin/
      page.tsx                          # dashboard page
      AdminDashboardClient.tsx          # client logic + tables + modals
  api/
    admin/
      stats/route.ts
      top-downloads/route.ts
      mod/[id]/route.ts                 # GET, PUT, DELETE
      mod/[id]/ads/route.ts             # PATCH
      user/route.ts                     # POST create
      user/[id]/route.ts                # GET, PUT, DELETE
      user/[id]/role-history/route.ts   # GET
      user/[id]/upload-history/route.ts # GET
    blog/
      [id]/route.ts                     # optional admin delete/edit API unification
lib/
  db.ts
  auth.ts
  adminGuard.ts
  validators/
    adminMod.ts
    adminUser.ts
models/
  Mod.ts
  User.ts
  Blog.ts
middleware.ts
```

---

## 5) Admin Access Control

Current behavior is admin-only for the dashboard and APIs. Keep that same policy.

```ts
// lib/adminGuard.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

type Role = "USER" | "MODERATOR" | "ADMIN";

type SessionUser = {
  _id: string;
  email: string;
  role: Role;
  profileImageURL?: string;
};

export async function requireAdmin(): Promise<SessionUser> {
  const cookieName = process.env.AUTH_COOKIE_NAME ?? "token";
  const token = (await cookies()).get(cookieName)?.value;

  if (!token) throw new Error("UNAUTHORIZED");

  const { payload } = await jwtVerify(token, secret, {
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  });

  const user = payload as unknown as SessionUser;

  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
```

Use in all `/api/admin/*` handlers and in `app/(admin)/admin/page.tsx`.

---

## 6) Dashboard Page (Server + Client Split)

### Server page

```tsx
// app/(admin)/admin/page.tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminGuard";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "UNAUTHORIZED") redirect("/login");
    redirect("/403");
  }

  return <AdminDashboardClient />;
}
```

### Client dashboard responsibilities (parity with existing JS)

- load stats on mount
- apply filter query params
- mod edit modal
- delete confirm modal
- ads mode radio updates with request locking
- user create/edit/delete + role/upload history modal data fetch
- blog edit/delete actions

---

## 7) API Recreation Map

| Current Express Endpoint | Next.js App Router Equivalent |
|---|---|
| `GET /admin` | `app/(admin)/admin/page.tsx` |
| `GET /admin/api/stats` | `app/api/admin/stats/route.ts` |
| `GET /admin/api/top-downloads` | `app/api/admin/top-downloads/route.ts` |
| `GET /admin/api/mod/:id` | `app/api/admin/mod/[id]/route.ts` (GET) |
| `PUT /admin/api/mod/:id` | `app/api/admin/mod/[id]/route.ts` (PUT) |
| `DELETE /admin/api/mod/:id` | `app/api/admin/mod/[id]/route.ts` (DELETE) |
| `PATCH /admin/api/mod/:id/ads` | `app/api/admin/mod/[id]/ads/route.ts` |
| `GET /admin/api/user/:id` | `app/api/admin/user/[id]/route.ts` (GET) |
| `POST /admin/api/user` | `app/api/admin/user/route.ts` (POST) |
| `PUT /admin/api/user/:id` | `app/api/admin/user/[id]/route.ts` (PUT) |
| `DELETE /admin/api/user/:id` | `app/api/admin/user/[id]/route.ts` (DELETE) |
| `GET /admin/api/user/:id/role-history` | `app/api/admin/user/[id]/role-history/route.ts` |
| `GET /admin/api/user/:id/upload-history` | `app/api/admin/user/[id]/upload-history/route.ts` |

---

## 8) Example API Implementations

### 8.1 Stats

```ts
// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import Mod from "@/models/Mod";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [totalMods, beamngMods, assettoCorsaMods, featuredMods, downloadStats] = await Promise.all([
      Mod.countDocuments(),
      Mod.countDocuments({ game: "BeamNG.drive" }),
      Mod.countDocuments({ game: "Assetto Corsa" }),
      Mod.countDocuments({ featured: true }),
      Mod.aggregate([{ $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }]),
    ]);

    return NextResponse.json({
      totalMods,
      beamngMods,
      assettoCorsaMods,
      featuredMods,
      totalDownloads: downloadStats?.[0]?.totalDownloads ?? 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
```

### 8.2 Top Downloads

```ts
// app/api/admin/top-downloads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import Mod from "@/models/Mod";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 8);

    const data = await Mod.aggregate([
      { $match: { downloads: { $exists: true, $ne: null } } },
      { $project: { name: 1, downloads: { $ifNull: ["$downloads", 0] } } },
      { $sort: { downloads: -1 } },
      { $limit: limit },
    ]);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch top downloads" }, { status: 500 });
  }
}
```

### 8.3 Mod GET/PUT/DELETE

```ts
// app/api/admin/mod/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import Mod from "@/models/Mod";

const updateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  game: z.enum(["BeamNG.drive", "Assetto Corsa"]),
  brand: z.string().optional(),
  mod_type: z.string().optional(),
  downloads_size: z.string().min(1),
  Virustotal_link: z.string().optional().default(""),
  download_link: z.string().url(),
  AD_link: z.string().optional(),
  mod_image: z.string().url(),
  images: z.union([z.array(z.string().url()), z.string()]).optional(),
  featured: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const mod = await Mod.findById(id).lean();
    if (!mod) return NextResponse.json({ error: "Mod not found" }, { status: 404 });

    return NextResponse.json(mod);
  } catch {
    return NextResponse.json({ error: "Failed to fetch mod" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const raw = await req.json();
    const parsed = updateSchema.parse(raw);

    const payload: Record<string, unknown> = { ...parsed, updatedBy: admin._id };

    if (typeof payload.images === "string") {
      payload.images = (payload.images as string)
        .split(/[\n,]/)
        .map((v) => v.trim())
        .filter(Boolean);
    }

    const mod = await Mod.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!mod) return NextResponse.json({ error: "Mod not found" }, { status: 404 });

    return NextResponse.json({ success: true, mod });
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Duplicate value for unique field" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update mod" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const deleted = await Mod.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Mod not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Mod deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete mod" }, { status: 500 });
  }
}
```

### 8.4 Ads Mode PATCH

```ts
// app/api/admin/mod/[id]/ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import Mod from "@/models/Mod";

const adsSchema = z.object({ ads_mode: z.union([z.literal(0), z.literal(1), z.literal(2)]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const { ads_mode } = adsSchema.parse(await req.json());

    const mod = await Mod.findByIdAndUpdate(id, { ads_mode }, { new: true, runValidators: true });
    if (!mod) return NextResponse.json({ error: "Mod not found" }, { status: 404 });

    const res = NextResponse.json({ success: true, ads_mode: mod.ads_mode });

    // Preserve current behavior: clear per-mod ad flow cookies so new setting applies immediately
    res.cookies.delete(`d1_${id}`);
    res.cookies.delete(`d2_${id}`);
    res.cookies.delete(`ads_v_${id}`);
    res.cookies.delete(`bypass_${id}`);

    return res;
  } catch {
    return NextResponse.json({ error: "Failed to update ads setting" }, { status: 500 });
  }
}
```

### 8.5 User CRUD + Role History

Implement these routes similarly with:
- ObjectId validation
- role enum validation (`USER`, `MODERATOR`, `ADMIN`)
- duplicate key handling (`code === 11000`)
- password updates using model pre-save hash hook
- role change append into `roleHistory`

Recommended route files:
- `app/api/admin/user/route.ts` (POST)
- `app/api/admin/user/[id]/route.ts` (GET, PUT, DELETE)
- `app/api/admin/user/[id]/role-history/route.ts` (GET)
- `app/api/admin/user/[id]/upload-history/route.ts` (GET)

---

## 9) Dashboard Data Query (Equivalent to `GET /admin`)

In Next.js, replace server-side EJS rendering with a dedicated API endpoint or server action for dashboard bootstrap:

- `GET /api/admin/dashboard?page=&limit=&search=&game=&sortBy=&sortOrder=`

Return payload:
- `mods[]`
- `blogs[]`
- `users[]`
- `pagination`
- `filters`

This keeps exact parity with your EJS dashboard data contract.

---

## 10) Client UI Feature Parity Checklist

Implement these in `AdminDashboardClient.tsx`:

- Sidebar expand/collapse + mobile drawer behavior
- Filters and query-state sync:
  - search
  - game filter
  - sortBy
  - sortOrder
  - page
- Stats cards + top-downloads chart
- Mod table actions:
  - edit modal (PUT)
  - delete modal (DELETE)
  - view link
- Ads mode radios with optimistic lock per-mod request
- Blog row actions:
  - edit redirect
  - delete action
- User table actions:
  - create user modal
  - edit user modal
  - delete user confirm
  - role history modal
  - upload history modal
- Toast notifications for success/error

---

## 11) Security/Validation Parity

Keep the same protections:

- Admin-only route guard (server + API)
- ObjectId validation for `:id`
- Input sanitization (`trim`, null-byte removal)
- Field allow-list for updates (prevent mass assignment)
- Sensitive field exclusion in user reads (`-password -salt`)
- Duplicate-key handling for unique fields
- Role audit trail on role changes (`roleHistory`)

---

## 12) Recommended Middleware Matcher

Protect admin areas with middleware as first-line gate:

- `/admin/:path*`
- `/api/admin/:path*`

Rules:
- no token -> 401 (API) or redirect `/login` (page)
- token but not `ADMIN` -> 403

---

## 13) Blog Management Note (Important)

Current blog image upload is disk-based (`public/uploads/blogs`). In many Next.js deployments (Vercel/serverless), local disk writes are ephemeral and not reliable long-term.

For production-safe parity:
- Move blog images to R2/S3/Blob storage
- Store resulting public URLs in `Blog.images`

If self-hosting on a persistent server, local disk is still viable.

---

## 14) Testing Matrix

- Admin page access:
  - unauthenticated -> redirect login
  - USER/MODERATOR -> 403
  - ADMIN -> success
- Filters/pagination return deterministic results
- Mod update:
  - required fields enforced
  - duplicate unique fields return 400
- Ads mode update clears ad cookies
- User role change writes `roleHistory` with `changedBy`
- User password update triggers hash hook
- User upload-history stats reflect uploaded/updated mods
- Blog delete from admin table updates UI and backend state

---

## 15) Implementation Order

1. Build auth/admin guard (`lib/adminGuard.ts`)
2. Add admin API routes (stats, mod CRUD, ads mode, user CRUD/history)
3. Add dashboard bootstrap endpoint
4. Build `app/(admin)/admin/page.tsx` + client dashboard
5. Wire mutations + toast feedback
6. Add middleware protection and final RBAC checks
7. Add tests for critical admin actions

---

## 16) Quick Start Checklist

- [ ] Add required env keys
- [ ] Add `lib/adminGuard.ts`
- [ ] Add `/api/admin/*` route handlers
- [ ] Add dashboard client page with tables + modals
- [ ] Port ads mode controls and cookie clear behavior
- [ ] Port user role history + upload history modals
- [ ] Wire blog edit/delete actions from dashboard
- [ ] Add middleware protection for admin pages/APIs
- [ ] Validate with ADMIN and non-ADMIN accounts

---

If you want next, I can scaffold these admin routes/pages directly in a new `next-app/` folder and wire the API contracts to match your existing admin.js behavior exactly.
