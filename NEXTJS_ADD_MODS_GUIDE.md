# Modshaven Add Mods System — Next.js Recreation Guide

This guide recreates your current **Add Mod** flow in **Next.js 14+ (App Router)** with parity to the existing Express app:

- Admin/Moderator-only Add Mod page
- Primary image upload + optional gallery images
- Dual download source modes:
  - Manual download URL + manual VirusTotal URL
  - Direct file upload to R2 + optional VirusTotal scan
- Slug generation, unique fields, and DB structure

This is designed to be dropped into a new Next.js codebase and preserve behavior.

---

## 1) What You Currently Have (Behavioral Contract)

From the existing implementation:

- Access control: only authenticated `ADMIN` or `MODERATOR` can add mods.
- Route pair:
  - `GET /mods/Add-Mod` renders form
  - `POST /mods/Add-Mod` accepts multipart form
- Required file input:
  - `mod_image` (primary image) required
- Optional additional images:
  - `images[]` up to 12
- Two ways to provide download data:
  - Link mode: `Download_link`, `Virustotal_link`
  - File mode: upload file to `/upload/file` first, then hidden fields carry generated `Download_link` and `Virustotal_link`
- DB write creates:
  - `name`, `slug`, `description`, `author`, `game`, `brand`, `mod_type`, `downloads_size`, `downloads`, `download_link`, `Virustotal_link`, `mod_image`, `images`, `uploadedBy`
- Image storage goes to Cloudflare R2 via S3-compatible API, image optimized with Sharp.

---

## 2) Required Dependencies

```bash
npm install mongoose @aws-sdk/client-s3 sharp zod slugify jose
# Optional for distributed rate limiting
npm install @upstash/ratelimit @upstash/redis
```

Notes:
- `sharp` is used for image optimization before R2 upload.
- `jose` is recommended for JWT verification in Next middleware (Edge-compatible).

---

## 3) Environment Variables (All Necessary Keys)

Create `.env.local`:

```env
# ───── Database ───────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/modshaven

# ───── Auth/JWT (for protected Add Mod page + APIs) ──────────────────────────
JWT_SECRET=replace_with_32plus_char_secret
JWT_ISSUER=modshaven.com
JWT_AUDIENCE=modshaven-users
JWT_EXPIRES_IN=7d
AUTH_COOKIE_NAME=token
NODE_ENV=development

# ───── App URL ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ───── Primary R2 Image Storage (used by Add Mod images) ─────────────────────
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://cdn.yourdomain.com

# ───── Optional Dedicated Upload R2 (used by /upload/file large mod files) ───
# Falls back to R2_* if omitted
UPLOAD_R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
UPLOAD_R2_ACCESS_KEY_ID=your_upload_access_key
UPLOAD_R2_SECRET_ACCESS_KEY=your_upload_secret_key
UPLOAD_R2_BUCKET_NAME=your_upload_bucket
UPLOAD_R2_PUBLIC_URL=https://downloads.yourdomain.com

# ───── Optional VirusTotal scan for uploaded files ────────────────────────────
VIRUSTOTAL_API_KEY=your_virustotal_api_key

# ───── Optional operational limits (recommended in Next recreation) ───────────
MAX_MOD_IMAGE_SIZE_MB=10
MAX_GALLERY_IMAGES=12
MAX_UPLOAD_FILE_MB=650
```

### Key Matrix

| Key | Required | Used For |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection |
| `JWT_SECRET` | Yes | Verify auth token |
| `JWT_ISSUER` | Yes | JWT issuer validation |
| `JWT_AUDIENCE` | Yes | JWT audience validation |
| `JWT_EXPIRES_IN` | Yes | Token expiration config |
| `AUTH_COOKIE_NAME` | Yes | Cookie name (`token`) |
| `NODE_ENV` | Yes | Secure-cookie behavior |
| `NEXT_PUBLIC_APP_URL` | Yes | Redirect/callback URL building |
| `R2_ENDPOINT` | Yes | S3 endpoint for image uploads |
| `R2_ACCESS_KEY_ID` | Yes | R2 credentials |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 credentials |
| `R2_BUCKET_NAME` | Yes | Bucket for images |
| `R2_PUBLIC_URL` | Yes | Public URL base for stored files |
| `UPLOAD_R2_*` | Optional | Separate bucket/keys for downloadable mod files |
| `VIRUSTOTAL_API_KEY` | Optional | File malware scan during direct upload mode |
| `MAX_MOD_IMAGE_SIZE_MB` | Optional | Primary/gallery image limit |
| `MAX_GALLERY_IMAGES` | Optional | Max additional images |
| `MAX_UPLOAD_FILE_MB` | Optional | Upload mode max file size |

---

## 4) Suggested Next.js Structure

```text
app/
  (admin)/
    mods/
      add/
        page.tsx
  api/
    mods/
      route.ts                   # POST create mod
    upload/
      file/
        route.ts                 # optional: upload download file + VT scan
    auth/
      me/
        route.ts
lib/
  db.ts
  auth.ts
  jwt.ts
  r2.ts
  imageUpload.ts
  uploadR2.ts
  virusTotal.ts
  validators/
    mod.ts
models/
  Mod.ts
middleware.ts
```

---

## 5) Mongoose Model (Parity)

Use this schema to match your existing fields and behavior.

```ts
// models/Mod.ts
import { Schema, model, models, type Model, type Document } from "mongoose";
import slugify from "slugify";

export interface IMod extends Document {
  name: string;
  slug: string;
  description: string;
  author: string;
  game: "BeamNG.drive" | "Assetto Corsa";
  brand: string;
  mod_type: string;
  tags: string[];
  featured: boolean;
  ads_mode: 0 | 1 | 2;
  downloads_size: string;
  AD_link: string;
  download_link: string;
  Virustotal_link: string;
  mod_image: string;
  images: string[];
  downloads: number;
  uploadedBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

const modSchema = new Schema<IMod>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    game: {
      type: String,
      required: true,
      default: "BeamNG.drive",
      enum: ["BeamNG.drive", "Assetto Corsa"],
      index: true,
    },
    brand: { type: String, default: "Other", index: true },
    mod_type: { type: String, default: "Vehicle", index: true },
    tags: { type: [String], default: [], index: true },
    featured: { type: Boolean, default: false },
    ads_mode: { type: Number, enum: [0, 1, 2], default: 1 },
    downloads_size: { type: String, required: true },
    AD_link: { type: String, default: "https://sawutser.top/4/9283523" },
    download_link: { type: String, required: true, unique: true },
    Virustotal_link: { type: String, default: "" },
    mod_image: { type: String, required: true, unique: true },
    images: { type: [String], default: [] },
    downloads: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

modSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
  next();
});

const Mod = (models.mods as Model<IMod>) || model<IMod>("mods", modSchema);
export default Mod;
```

---

## 6) R2 Service for Mod Images

```ts
// lib/r2.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.R2_BUCKET_NAME!;
const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");

export async function uploadImageToR2(buffer: Buffer, originalName: string, folder = "mods") {
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const keyBase = `${folder}/${timestamp}-${sanitizedName}`;
  const key = keyBase.replace(/\.[^.]+$/, ".webp");

  const optimized = await sharp(buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: optimized,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000",
    })
  );

  return `${publicUrl}/${key}`;
}

export async function uploadManyImages(files: Array<{ buffer: Buffer; originalname: string }>) {
  return Promise.all(files.map((f) => uploadImageToR2(f.buffer, f.originalname, "mods")));
}
```

---

## 7) Auth Guard for Admin/Moderator

Use your existing JWT claims (`role`) and guard routes.

```ts
// lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const cookieName = process.env.AUTH_COOKIE_NAME ?? "token";

type Role = "USER" | "MODERATOR" | "ADMIN";

type AuthPayload = {
  _id: string;
  email: string;
  role: Role;
  profileImageURL?: string;
};

export async function getUserFromCookie(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function requireAdminOrModerator() {
  const user = await getUserFromCookie();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") throw new Error("FORBIDDEN");
  return user;
}
```

---

## 8) API Route: Create Mod (Next.js)

### Behavior covered
- Validate fields
- Require primary image
- Upload image(s) to R2
- Merge URL-based images + uploaded images with dedupe
- Persist mod document
- Save `uploadedBy`

```ts
// app/api/mods/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Mod from "@/models/Mod";
import { requireAdminOrModerator } from "@/lib/auth";
import { uploadImageToR2, uploadManyImages } from "@/lib/r2";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  game: z.enum(["BeamNG.drive", "Assetto Corsa"]),
  Download_size: z.string().min(1),
  Download_link: z.string().url(),
  Downloads: z.coerce.number().optional().default(0),
  brand: z.string().optional().default("Other"),
  mod_type: z.string().optional().default("Vehicle"),
  Virustotal_link: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminOrModerator();
    await connectDB();

    const formData = await req.formData();

    const input = schema.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      author: formData.get("author"),
      game: formData.get("game"),
      Download_size: formData.get("Download_size"),
      Download_link: formData.get("Download_link"),
      Downloads: formData.get("Downloads") ?? 0,
      brand: formData.get("brand") ?? "Other",
      mod_type: formData.get("mod_type") ?? "Vehicle",
      Virustotal_link: formData.get("Virustotal_link") ?? "",
    });

    const modImage = formData.get("mod_image");
    if (!(modImage instanceof File)) {
      return NextResponse.json({ error: "Primary mod image is required" }, { status: 400 });
    }

    const modImageBuffer = Buffer.from(await modImage.arrayBuffer());
    const modImageUrl = await uploadImageToR2(modImageBuffer, modImage.name, "mods");

    const additionalImageFiles = formData
      .getAll("images")
      .filter((x): x is File => x instanceof File && x.size > 0);

    const uploadedGallery = await uploadManyImages(
      await Promise.all(
        additionalImageFiles.map(async (f) => ({
          originalname: f.name,
          buffer: Buffer.from(await f.arrayBuffer()),
        }))
      )
    );

    const urlImages = formData
      .getAll("images_urls[]")
      .map((v) => String(v).trim())
      .filter(Boolean);

    const images = Array.from(new Set([...urlImages, ...uploadedGallery]));

    const mod = await Mod.create({
      name: input.name,
      description: input.description,
      author: input.author,
      game: input.game,
      brand: input.brand,
      mod_type: input.mod_type,
      downloads_size: input.Download_size,
      downloads: input.Downloads,
      download_link: input.Download_link,
      Virustotal_link: input.Virustotal_link,
      mod_image: modImageUrl,
      images,
      uploadedBy: user._id,
    });

    return NextResponse.json({ success: true, id: mod._id, slug: mod.slug }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to create mod" }, { status: 500 });
  }
}
```

---

## 9) Optional API: Upload Download File (R2 + VirusTotal)

If you want full parity with your current “Upload File” mode, keep a dedicated endpoint:

- `POST /api/upload/file`
- Accepts file
- Uploads to `UPLOAD_R2_*` (or falls back to `R2_*`)
- Returns:
  - `url` (Download_link)
  - `virusTotalScan.permalink` (Virustotal_link)

```ts
// app/api/upload/file/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export const runtime = "nodejs";

const uploadClient = new S3Client({
  region: "auto",
  endpoint: process.env.UPLOAD_R2_ENDPOINT || process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.UPLOAD_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.UPLOAD_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const uploadBucket = process.env.UPLOAD_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME!;
const uploadPublic = (process.env.UPLOAD_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL!).replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${Date.now()}-${safe}`;

    await uploadClient.send(
      new PutObjectCommand({
        Bucket: uploadBucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        CacheControl: "public, max-age=31536000",
      })
    );

    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    let virusTotalScan: Record<string, unknown> = {
      scanned: false,
      message: "VirusTotal API key not configured",
    };

    if (process.env.VIRUSTOTAL_API_KEY) {
      virusTotalScan = {
        scanned: true,
        hash,
        permalink: `https://www.virustotal.com/gui/file/${hash}`,
      };
    }

    return NextResponse.json({
      success: true,
      url: `${uploadPublic}/${key}`,
      filename: file.name,
      size: file.size,
      type: file.type,
      virusTotalScan,
    });
  } catch {
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
```

---

## 10) Add Mod Page (Server + Client Pattern)

### Server page guard

```tsx
// app/(admin)/mods/add/page.tsx
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/auth";
import AddModForm from "./AddModForm";

export default async function AddModPage() {
  const user = await getUserFromCookie();

  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") redirect("/403");

  return <AddModForm />;
}
```

### Client form requirements

Your `AddModForm` should include these exact form fields for compatibility:

- `name`
- `author`
- `Downloads`
- `game`
- `Download_size`
- `brand`
- `mod_type`
- `Download_link`
- `Virustotal_link`
- `description`
- `mod_image` (required file)
- `images` (optional multiple files)
- `images_urls[]` (optional repeated URL entries)

And for dual-mode upload:
- Link mode uses visible `Download_link` and `Virustotal_link`
- File mode:
  - call `POST /api/upload/file`
  - write returned `url` and VT `permalink` into hidden fields
  - submit final `POST /api/mods` with those values

---

## 11) Validation Rules (Recommended)

Apply these to keep behavior close but safer:

- `name`: required, min 3, max 120
- `author`: required, max 80
- `description`: required, min 20
- `Download_link`: required valid URL in final submission
- `Virustotal_link`: optional URL
- `mod_image`: required image MIME only
- `images`: max `MAX_GALLERY_IMAGES`, image MIME only
- file upload mode max: `MAX_UPLOAD_FILE_MB`

---

## 12) Middleware Matcher (Protect Add Flow)

If you protect via middleware too:

```ts
// middleware.ts (concept)
// protect /mods/add and /api/mods and /api/upload/file
```

Enforce:
- not logged in -> 401/redirect to login
- logged in but role not ADMIN/MODERATOR -> 403

---

## 13) End-to-End Request Flow

### Link mode
1. Admin/Moderator opens `/mods/add`
2. Fills metadata + primary image + optional gallery
3. Enters manual `Download_link` and `Virustotal_link`
4. Form posts multipart to `/api/mods`
5. Server uploads image(s) to R2 and writes mod in MongoDB

### File mode
1. User selects downloadable mod file
2. Client uploads that file to `/api/upload/file`
3. Endpoint returns hosted download URL + VT permalink
4. Hidden fields are set
5. Final submit to `/api/mods` stores those links

---

## 14) Common Pitfalls

- Using Edge runtime for image processing: `sharp` requires Node runtime.
  - Set `export const runtime = "nodejs"` on upload/create routes.
- Forgetting `R2_PUBLIC_URL` trailing slash normalization.
- Large upload timeout limits in serverless environments.
  - For big files, prefer multipart upload + dedicated upload worker.
- Duplicate unique keys (`name`, `slug`, `download_link`, `mod_image`) causing Mongo 11000 errors.

---

## 15) Migration Mapping (Express -> Next)

| Current Express | Next.js Equivalent |
|---|---|
| `routes/mods.js` `POST /Add-Mod` | `app/api/mods/route.ts` `POST` |
| `services/cloudflareR2Service.js` | `lib/r2.ts` |
| `routes/upload.js` `POST /file` | `app/api/upload/file/route.ts` |
| `middlewares/authentication.js` + `middlewares/admin.js` | `lib/auth.ts` + `middleware.ts` |
| `views/Add_mods.ejs` | `app/(admin)/mods/add/page.tsx` + client form |
| `models/mods.js` | `models/Mod.ts` |

---

## 16) Quick Implementation Checklist

- [ ] Add env keys from section 3
- [ ] Create `models/Mod.ts`
- [ ] Create `lib/r2.ts`
- [ ] Create auth helpers (`lib/auth.ts`)
- [ ] Create `app/api/upload/file/route.ts` (if file mode needed)
- [ ] Create `app/api/mods/route.ts`
- [ ] Build protected Add Mod page + client form
- [ ] Wire dual upload mode UI (link/file)
- [ ] Add server validation + size limits
- [ ] Test both modes and verify created mod in MongoDB

---

## 17) Optional Hardening Upgrades

- Replace in-memory throttling with Upstash rate limiting for upload endpoints.
- Add mime + magic-byte validation for uploaded files.
- Queue antivirus scan in background and store scan status.
- Add object cleanup rollback if DB write fails after upload.

---

If you want, next step can be a **full code scaffold directly in this repo** under a `next-app/` folder with all files generated (model, routes, middleware, and Add Mod UI).
