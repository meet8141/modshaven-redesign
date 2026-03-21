import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdminOrModerator } from "@/lib/auth";

export const runtime = "nodejs";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const r2BucketName = process.env.R2_BUCKET_NAME ?? "";
const r2PublicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

function ensureConfig() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !r2BucketName || !r2PublicUrl) {
    throw new Error("R2 environment variables are not fully configured");
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

function getImageSizeLimit() {
  const maxModImageSizeMb = Number(process.env.MAX_MOD_IMAGE_SIZE_MB ?? "10");
  return maxModImageSizeMb * 1024 * 1024;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminOrModerator();
    ensureConfig();

    const body = (await req.json()) as {
      fileName?: string;
      contentType?: string;
      fileSize?: number;
      folder?: string;
    };

    const fileName = String(body.fileName ?? "").trim();
    const contentType = String(body.contentType ?? "").trim();
    const fileSize = Number(body.fileSize ?? 0);
    const folder = String(body.folder ?? "mods").trim() || "mods";

    if (!fileName || !contentType || !Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json({ error: "Invalid upload metadata" }, { status: 400 });
    }

    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    const maxBytes = getImageSizeLimit();
    if (fileSize > maxBytes) {
      return NextResponse.json(
        { error: `Image exceeds ${Math.floor(maxBytes / (1024 * 1024))}MB limit` },
        { status: 400 }
      );
    }

    const safeName = sanitizeFileName(fileName || "image");
    const key = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

    return NextResponse.json({
      uploadUrl,
      publicUrl: `${r2PublicUrl}/${key}`,
      key,
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to create upload URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
