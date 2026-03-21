import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const adsSchema = z.object({
  ads_mode: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const { ads_mode } = adsSchema.parse(await req.json());

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");
    const updated = await ModModel.findByIdAndUpdate(id, { ads_mode }, { new: true, runValidators: true }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, ads_mode: updated.ads_mode });

    response.cookies.delete(`d1_${id}`);
    response.cookies.delete(`d2_${id}`);
    response.cookies.delete(`ads_v_${id}`);
    response.cookies.delete(`bypass_${id}`);

    return response;
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update ads setting" }, { status: 500 });
  }
}
