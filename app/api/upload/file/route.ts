import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { requireAdminOrModerator } from "@/lib/auth";

export const runtime = "nodejs";

const uploadClient = new S3Client({
  region: "auto",
  endpoint: process.env.UPLOAD_R2_ENDPOINT || process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.UPLOAD_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.UPLOAD_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const uploadBucket = process.env.UPLOAD_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || "";
const uploadPublic = (process.env.UPLOAD_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

function ensureUploadConfig() {
  if (!uploadBucket || !uploadPublic || !process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error("Upload R2 environment variables are not fully configured");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminOrModerator();
    ensureUploadConfig();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const maxUploadMb = Number(process.env.MAX_UPLOAD_FILE_MB ?? "650");
    const maxBytes = maxUploadMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, message: `File exceeds ${maxUploadMb}MB limit` },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `mods-files/${Date.now()}-${safeName}`;

    const virusTotalEnabled = Boolean(process.env.VIRUSTOTAL_API_KEY);
    let hash: string | undefined;
    let uploadBody: File | Buffer = file;

    // Hashing requires full file bytes; only do this extra work when VT links are enabled.
    if (virusTotalEnabled) {
      const buffer = Buffer.from(await file.arrayBuffer());
      hash = crypto.createHash("sha256").update(buffer).digest("hex");
      uploadBody = buffer;
    }

    await uploadClient.send(
      new PutObjectCommand({
        Bucket: uploadBucket,
        Key: key,
        Body: uploadBody,
        ContentType: file.type || "application/octet-stream",
        CacheControl: "public, max-age=31536000",
      })
    );

    const virusTotalScan = virusTotalEnabled
      ? {
          scanned: true,
          hash,
          permalink: `https://www.virustotal.com/gui/file/${hash}`,
        }
      : {
          scanned: false,
          message: "VirusTotal API key not configured",
        };

    return NextResponse.json({
      success: true,
      url: `${uploadPublic}/${key}`,
      filename: file.name,
      size: file.size,
      type: file.type,
      virusTotalScan,
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
