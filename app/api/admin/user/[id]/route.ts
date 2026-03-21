import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

export const runtime = "nodejs";

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
  password: z.string().min(6).optional(),
  roleChangeReason: z.string().max(250).optional(),
});

function sanitize(value: string) {
  return value.trim().replace(/\0/g, "");
}

function serializeUser(doc: any) {
  return {
    ...doc,
    _id: String(doc._id),
    roleHistory: Array.isArray(doc.roleHistory)
      ? doc.roleHistory.map((entry: any) => ({
          ...entry,
          changedBy: entry?.changedBy ? String(entry.changedBy) : null,
          changedAt: entry?.changedAt ? new Date(entry.changedAt).toISOString() : null,
        }))
      : [],
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

    const user = await User.findById(id)
      .select("-password -salt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
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

    const parsed = updateUserSchema.parse(await req.json());

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (parsed.fullName) user.fullName = sanitize(parsed.fullName);
    if (parsed.email) user.email = sanitize(parsed.email).toLowerCase();

    if (parsed.password) {
      user.password = parsed.password;
    }

    if (parsed.role && parsed.role !== user.role) {
      const oldRole = user.role;
      user.role = parsed.role;
      user.roleHistory = user.roleHistory || [];
      user.roleHistory.push({
        oldRole,
        newRole: parsed.role,
        changedBy: new mongoose.Types.ObjectId(admin._id),
        changedAt: new Date(),
        reason: sanitize(parsed.roleChangeReason ?? "Changed by admin"),
      });
    }

    await user.save();

    const updated = await User.findById(id).select("-password -salt").lean();

    return NextResponse.json({ success: true, user: serializeUser(updated) });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json({ error: "Duplicate email or full name" }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
