import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");
    const rawLimit = Number(req.nextUrl.searchParams.get("limit") ?? 8);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 30)) : 8;

    const data = await ModModel.aggregate([
      { $match: { downloads: { $exists: true, $ne: null } } },
      { $project: { name: 1, downloads: { $ifNull: ["$downloads", 0] } } },
      { $sort: { downloads: -1 } },
      { $limit: limit },
    ]);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch top downloads" }, { status: 500 });
  }
}
