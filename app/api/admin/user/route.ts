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

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN");
    await connectToDatabase();

    const parsed = createUserSchema.parse(await req.json());

    const created = await User.create({
      fullName: sanitize(parsed.fullName),
      email: sanitize(parsed.email).toLowerCase(),
      password: parsed.password,
      role: parsed.role,
      roleHistory: [
        {
          oldRole: undefined,
          newRole: parsed.role,
          changedBy: admin._id,
          changedAt: new Date(),
          reason: "Created by admin",
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: String(created._id),
          fullName: created.fullName,
          email: created.email,
          role: created.role,
          password: created.password,
          profileImageURL: created.profileImageURL,
        },
      },
      { status: 201 }
    );
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
