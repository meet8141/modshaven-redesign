import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");
    const userObjectId = new mongoose.Types.ObjectId(id);

    const [uploaded, updated, totals] = await Promise.all([
      ModModel.find(
        { uploadedBy: userObjectId },
        { name: 1, slug: 1, game: 1, downloads: 1, date_added: 1, createdAt: 1 }
      )
        .sort({ createdAt: -1 })
        .lean(),
      ModModel.find(
        { updatedBy: userObjectId },
        { name: 1, slug: 1, game: 1, downloads: 1, updatedAt: 1 }
      )
        .sort({ updatedAt: -1 })
        .lean(),
      ModModel.aggregate([
        {
          $facet: {
            uploadedCount: [{ $match: { uploadedBy: userObjectId } }, { $count: "count" }],
            updatedCount: [{ $match: { updatedBy: userObjectId } }, { $count: "count" }],
            totalDownloadsFromUploads: [
              { $match: { uploadedBy: userObjectId } },
              { $group: { _id: null, total: { $sum: "$downloads" } } },
            ],
          },
        },
      ]),
    ]);

    const uploadedMods = uploaded.map((item: any) => ({
      _id: String(item._id),
      name: item.name,
      slug: item.slug ?? null,
      game: item.game ?? null,
      downloads: item.downloads ?? 0,
      date_added: item.date_added ? new Date(item.date_added).toISOString() : null,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    }));

    const updatedMods = updated.map((item: any) => ({
      _id: String(item._id),
      name: item.name,
      slug: item.slug ?? null,
      game: item.game ?? null,
      downloads: item.downloads ?? 0,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));

    const summary = totals?.[0] ?? {};

    return NextResponse.json({
      uploadedMods,
      updatedMods,
      stats: {
        uploadedCount: summary.uploadedCount?.[0]?.count ?? 0,
        updatedCount: summary.updatedCount?.[0]?.count ?? 0,
        totalDownloadsFromUploads: summary.totalDownloadsFromUploads?.[0]?.total ?? 0,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch upload history" }, { status: 500 });
  }
}
