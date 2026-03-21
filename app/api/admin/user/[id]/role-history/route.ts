import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }

    const user = await User.findById(id)
      .select("roleHistory")
      .populate("roleHistory.changedBy", "fullName email role")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const roleHistory = Array.isArray((user as any).roleHistory)
      ? (user as any).roleHistory.map((entry: any) => ({
          oldRole: entry.oldRole ?? null,
          newRole: entry.newRole,
          changedAt: entry.changedAt ? new Date(entry.changedAt).toISOString() : null,
          reason: entry.reason ?? "",
          changedBy:
            entry.changedBy && typeof entry.changedBy === "object"
              ? {
                  _id: String(entry.changedBy._id),
                  fullName: entry.changedBy.fullName,
                  email: entry.changedBy.email,
                  role: entry.changedBy.role,
                }
              : null,
        }))
      : [];

    return NextResponse.json({ roleHistory });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch role history" }, { status: 500 });
  }
}
