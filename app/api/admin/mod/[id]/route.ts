import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase, invalidateModCaches } from "@/lib/DB";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const updateModSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  game: z.enum(["BeamNG.drive", "Assetto Corsa"]),
  brand: z.string().optional().default(""),
  mod_type: z.string().optional().default(""),
  downloads_size: z.string().min(1),
  Virustotal_link: z.union([z.literal(""), z.string().url()]).optional().default(""),
  download_link: z.string().url(),
  AD_link: z.string().url().optional(),
  mod_image: z.string().url(),
  images: z.union([z.array(z.string().url()), z.string()]).optional(),
  featured: z.boolean().optional(),
});

function sanitize(value: string) {
  return value.trim().replace(/\0/g, "");
}

function serializeMod(doc: any) {
  return {
    ...doc,
    _id: String(doc._id),
    uploadedBy: doc.uploadedBy ? String(doc.uploadedBy) : null,
    updatedBy: doc.updatedBy ? String(doc.updatedBy) : null,
    date_added: doc.date_added ? new Date(doc.date_added).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");
    const mod = await ModModel.findById(id).lean();

    if (!mod) {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    return NextResponse.json({ mod: serializeMod(mod) });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch mod" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole("ADMIN");
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateModSchema.parse(body);

    const payload: Record<string, unknown> = {
      ...parsed,
      name: sanitize(parsed.name),
      description: sanitize(parsed.description),
      author: sanitize(parsed.author),
      brand: sanitize(parsed.brand ?? ""),
      mod_type: sanitize(parsed.mod_type ?? ""),
      downloads_size: sanitize(parsed.downloads_size),
      updatedBy: new mongoose.Types.ObjectId(admin._id),
    };

    if (typeof payload.images === "string") {
      payload.images = (payload.images as string)
        .split(/[\n,]/)
        .map((v) => v.trim())
        .filter(Boolean);
    }

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");
    const previous = await ModModel.findById(id).select({ _id: 1, slug: 1, name: 1 }).lean();
    if (!previous) {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    const updated = await ModModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    await invalidateModCaches({ id, slug: previous.slug, name: previous.name });
    await invalidateModCaches({ id, slug: updated.slug, name: updated.name });

    return NextResponse.json({ success: true, mod: serializeMod(updated) });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json({ error: "Duplicate value for unique field" }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update mod" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");
    const existing = await ModModel.findById(id).select({ _id: 1, slug: 1, name: 1 }).lean();
    if (!existing) {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    await ModModel.findByIdAndDelete(id);

    await invalidateModCaches({ id, slug: existing.slug, name: existing.name });

    return NextResponse.json({ success: true, message: "Mod deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to delete mod" }, { status: 500 });
  }
}
