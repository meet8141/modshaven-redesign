import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

export const runtime = "nodejs";

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional().default("USER"),
});

function sanitize(value: string) {
  return value.trim().replace(/\0/g, "");
}

function serializeUser(doc: any) {
  return {
    _id: String(doc._id),
    fullName: doc.fullName,
    email: doc.email,
    role: doc.role,
    profileImageURL: doc.profileImageURL,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

export async function GET() {
  try {
    await requireRole("ADMIN", "MODERATOR");
    await connectToDatabase();

    const users = await User.find({}, "fullName email role profileImageURL createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users: users.map(serializeUser) });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole("ADMIN", "MODERATOR");
    await connectToDatabase();

    const parsed = createUserSchema.parse(await req.json());

    if (actor.role === "MODERATOR" && parsed.role !== "USER") {
      return NextResponse.json(
        { error: "Moderators can only create USER accounts" },
        { status: 403 }
      );
    }

    const createdRole = actor.role === "MODERATOR" ? "USER" : parsed.role;

    const created = await User.create({
      fullName: sanitize(parsed.fullName),
      email: sanitize(parsed.email).toLowerCase(),
      password: parsed.password,
      role: createdRole,
      roleHistory: [
        {
          oldRole: undefined,
          newRole: createdRole,
          changedBy: actor._id,
          changedAt: new Date(),
          reason: actor.role === "MODERATOR" ? "Created by moderator" : "Created by admin",
        },
      ],
    });

    return NextResponse.json({ success: true, user: serializeUser(created) }, { status: 201 });
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

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
