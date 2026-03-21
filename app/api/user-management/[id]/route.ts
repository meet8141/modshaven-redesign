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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole("ADMIN", "MODERATOR");
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

    if (actor.role === "MODERATOR") {
      if (user.role !== "USER") {
        return NextResponse.json({ error: "Moderators can only edit USER accounts" }, { status: 403 });
      }

      if (parsed.role && parsed.role !== "USER") {
        return NextResponse.json({ error: "Moderators cannot change roles" }, { status: 403 });
      }
    }

    if (parsed.fullName) user.fullName = sanitize(parsed.fullName);
    if (parsed.email) user.email = sanitize(parsed.email).toLowerCase();
    if (parsed.password) user.password = parsed.password;

    if (parsed.role && parsed.role !== user.role) {
      const oldRole = user.role;
      user.role = parsed.role;
      user.roleHistory = user.roleHistory || [];
      user.roleHistory.push({
        oldRole,
        newRole: parsed.role,
        changedBy: new mongoose.Types.ObjectId(actor._id),
        changedAt: new Date(),
        reason: sanitize(parsed.roleChangeReason ?? "Changed by admin"),
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
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
