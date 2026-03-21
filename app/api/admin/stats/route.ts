import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");

    const [totalMods, beamngMods, assettoCorsaMods, featuredMods, downloadStats] = await Promise.all([
      ModModel.countDocuments(),
      ModModel.countDocuments({ game: "BeamNG.drive" }),
      ModModel.countDocuments({ game: "Assetto Corsa" }),
      ModModel.countDocuments({ featured: true }),
      ModModel.aggregate([{ $group: { _id: null, totalDownloads: { $sum: "$downloads" } } }]),
    ]);

    return NextResponse.json({
      totalMods,
      beamngMods,
      assettoCorsaMods,
      featuredMods,
      totalDownloads: downloadStats?.[0]?.totalDownloads ?? 0,
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
