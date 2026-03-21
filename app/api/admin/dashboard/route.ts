import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/DB";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

export const runtime = "nodejs";

function sanitize(value: string | null) {
  return (value ?? "").trim().replace(/\0/g, "");
}

function parseSort(sortBy: string, sortOrder: string): Record<string, 1 | -1> {
  const direction: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  if (sortBy === "downloads") return { downloads: direction };
  if (sortBy === "name") return { name: direction };
  if (sortBy === "date_added") return { date_added: direction };

  return { date_added: -1 };
}

function serializeMod(doc: any) {
  return {
    ...doc,
    _id: String(doc._id),
    uploadedBy: doc.uploadedBy ? String(doc.uploadedBy) : null,
    updatedBy: doc.updatedBy ? String(doc.updatedBy) : null,
    date_added: doc.date_added ? new Date(doc.date_added).toISOString() : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
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

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    await connectToDatabase();

    const ModModel = (mongoose.models.Mod as mongoose.Model<any>) || mongoose.model("Mod");

    const pageParam = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "12");
    const page = Number.isFinite(pageParam) ? Math.max(pageParam, 1) : 1;
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 50)) : 12;

    const search = sanitize(req.nextUrl.searchParams.get("search"));
    const game = sanitize(req.nextUrl.searchParams.get("game"));
    const sortBy = sanitize(req.nextUrl.searchParams.get("sortBy")) || "date_added";
    const sortOrder = sanitize(req.nextUrl.searchParams.get("sortOrder")) || "desc";

    const query: Record<string, any> = {};

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ name: searchRegex }, { description: searchRegex }, { author: searchRegex }];
    }

    if (game && game !== "all") {
      query.game = game;
    }

    const projection = {
      name: 1,
      author: 1,
      game: 1,
      mod_type: 1,
      brand: 1,
      downloads: 1,
      downloads_size: 1,
      featured: 1,
      ads_mode: 1,
      date_added: 1,
      slug: 1,
      mod_image: 1,
    };

    const skip = (page - 1) * limit;

    const [modsRaw, modsTotal, usersRaw, usersTotal] = await Promise.all([
      ModModel.find(query, projection).sort(parseSort(sortBy, sortOrder)).skip(skip).limit(limit).lean(),
      ModModel.countDocuments(query),
      User.find({}, "fullName email role profileImageURL createdAt updatedAt roleHistory")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      User.countDocuments(),
    ]);

    const mods = modsRaw.map(serializeMod);
    const users = usersRaw.map(serializeUser);

    return NextResponse.json({
      mods,
      blogs: [],
      users,
      pagination: {
        page,
        limit,
        total: modsTotal,
        totalPages: Math.ceil(modsTotal / limit),
      },
      userPagination: {
        total: usersTotal,
      },
      filters: { search, game, sortBy, sortOrder },
    });
  } catch (error: unknown) {
    if (error instanceof Response) {
      return NextResponse.json(
        { error: error.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: error.status }
      );
    }

    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
