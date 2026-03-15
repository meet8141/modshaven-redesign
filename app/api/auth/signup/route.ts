import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/DB";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  let body: { fullName?: unknown; email?: unknown; password?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { fullName, email, password } = body;

  if (
    !fullName ||
    !email ||
    !password ||
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    await User.create({
      fullName: fullName.trim().replace(/\0/g, ""),
      email: email.trim().toLowerCase().replace(/\0/g, ""),
      password,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
