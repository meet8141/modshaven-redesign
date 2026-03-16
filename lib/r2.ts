import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

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

function getImageLimits() {
  const maxModImageSizeMb = Number(process.env.MAX_MOD_IMAGE_SIZE_MB ?? "10");
  const maxGalleryImages = Number(process.env.MAX_GALLERY_IMAGES ?? "12");
  return {
    maxModImageBytes: maxModImageSizeMb * 1024 * 1024,
    maxGalleryImages,
  };
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

function ensureR2Config() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !r2BucketName || !r2PublicUrl) {
    throw new Error("R2 environment variables are not fully configured");
  }
}

export function validateImageFile(file: File, isPrimary: boolean) {
  const { maxModImageBytes } = getImageLimits();
  if (!file.type.startsWith("image/")) {
    throw new Error(isPrimary ? "Primary image must be an image file" : "Gallery items must be image files");
  }

  if (file.size > maxModImageBytes) {
    throw new Error(`Image exceeds ${Math.floor(maxModImageBytes / (1024 * 1024))}MB limit`);
  }
}

export function validateGalleryCount(count: number) {
  const { maxGalleryImages } = getImageLimits();
  if (count > maxGalleryImages) {
    throw new Error(`Maximum ${maxGalleryImages} gallery images are allowed`);
  }
}

export async function uploadImageToR2(file: File, folder = "mods"): Promise<string> {
  ensureR2Config();
  validateImageFile(file, folder === "mods");

  const timestamp = Date.now();
  const originalName = sanitizeFileName(file.name || "image");
  const keyBase = `${folder}/${timestamp}-${originalName}`;
  const key = keyBase.replace(/\.[^.]+$/, ".webp");

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(buffer)
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: optimized,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000",
    })
  );

  return `${r2PublicUrl}/${key}`;
}

export async function uploadManyImagesToR2(files: File[], folder = "mods"): Promise<string[]> {
  validateGalleryCount(files.length);
  return Promise.all(files.map((file) => uploadImageToR2(file, folder)));
}
