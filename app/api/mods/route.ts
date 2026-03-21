import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { z } from "zod";
import { connectToDatabase } from "@/lib/DB";
import { requireAdminOrModerator } from "@/lib/auth";
import { uploadImageToR2, uploadManyImagesToR2, validateImageFile } from "@/lib/r2";
import mongoose from "mongoose";

export const runtime = "nodejs";

const modSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(20),
  author: z.string().min(1).max(80),
  game: z.enum(["BeamNG.drive", "Assetto Corsa"]),
  Download_size: z.string().min(1),
  Download_link: z.url(),
  Downloads: z.coerce.number().optional().default(0),
  brand: z.string().optional().default("Other"),
  mod_type: z.string().optional().default("Vehicle"),
  Virustotal_link: z.union([z.literal(""), z.url()]).optional().default(""),
  AD_link: z.url().optional().default("https://sawutser.top/4/9283523"),
});

function sanitizeString(value: string) {
  return value.trim().replace(/\0/g, "");
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function buildUniqueSlug(ModModel: mongoose.Model<any>, baseName: string): Promise<string> {
  const base = slugify(baseName, { lower: true, strict: true, trim: true }) || "mod";
  let candidate = base;
  let counter = 1;

  while (await ModModel.exists({ slug: candidate })) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminOrModerator();
    await connectToDatabase();

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");

    const formData = await req.formData();

    const parsed = modSchema.parse({
      name: sanitizeString(String(formData.get("name") ?? "")),
      description: sanitizeString(String(formData.get("description") ?? "")),
      author: sanitizeString(String(formData.get("author") ?? "")),
      game: formData.get("game"),
      Download_size: sanitizeString(String(formData.get("Download_size") ?? "")),
      Download_link: sanitizeString(String(formData.get("Download_link") ?? "")),
      Downloads: formData.get("Downloads") ?? 0,
      brand: sanitizeString(String(formData.get("brand") ?? "Other")),
      mod_type: sanitizeString(String(formData.get("mod_type") ?? "Vehicle")),
      Virustotal_link: sanitizeString(String(formData.get("Virustotal_link") ?? "")),
      AD_link: sanitizeString(String(formData.get("AD_link") ?? "https://sawutser.top/4/9283523")),
    });

    const primaryImageUrlInput = sanitizeString(String(formData.get("mod_image_url") ?? ""));
    const primaryImage = formData.get("mod_image");

    let modImageUrl = primaryImageUrlInput;

    if (modImageUrl) {
      if (!isValidHttpUrl(modImageUrl)) {
        return NextResponse.json({ error: "Primary image URL is invalid" }, { status: 400 });
      }
    } else {
      if (!(primaryImage instanceof File) || primaryImage.size <= 0) {
        return NextResponse.json({ error: "Primary mod image is required" }, { status: 400 });
      }

      validateImageFile(primaryImage, true);
      modImageUrl = await uploadImageToR2(primaryImage, "mods");
    }

    const galleryFiles = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);

    galleryFiles.forEach((file) => validateImageFile(file, false));

    const galleryUrls = galleryFiles.length > 0 ? await uploadManyImagesToR2(galleryFiles, "mods") : [];
    const urlImages = formData
      .getAll("images_urls[]")
      .map((value) => sanitizeString(String(value)))
      .filter(Boolean)
      .filter((value) => isValidHttpUrl(value));

    // Keep primary image as first gallery item, then append chosen gallery/url images.
    const uniqueImages = Array.from(new Set([modImageUrl, ...galleryUrls, ...urlImages]));

    if (await ModModel.exists({ name: parsed.name })) {
      return NextResponse.json({ error: "Mod with this name already exists" }, { status: 409 });
    }

    if (await ModModel.exists({ download_link: parsed.Download_link })) {
      return NextResponse.json({ error: "Download link is already in use" }, { status: 409 });
    }

    const slug = await buildUniqueSlug(ModModel, parsed.name);

    const created = await ModModel.create({
      name: parsed.name,
      slug,
      description: parsed.description,
      author: parsed.author,
      game: parsed.game,
      brand: parsed.brand,
      mod_type: parsed.mod_type,
      featured: false,
      ads_mode: 1,
      downloads_size: parsed.Download_size,
      AD_link: parsed.AD_link,
      download_link: parsed.Download_link,
      Virustotal_link: parsed.Virustotal_link,
      mod_image: modImageUrl,
      images: uniqueImages,
      downloads: parsed.Downloads,
      date_added: new Date(),
      uploadedBy: new mongoose.Types.ObjectId(user._id),
      updatedBy: new mongoose.Types.ObjectId(user._id),
    });

    return NextResponse.json(
      { success: true, id: String(created._id), slug: created.slug },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Failed to create mod";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
