import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profileImageURL: user.profileImageURL,
      },
    },
    { status: 200 }
  );
}
