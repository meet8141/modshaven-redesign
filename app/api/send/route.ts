import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/DB";
import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ── R2 client (images bucket) ──
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

async function uploadToR2(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `mod-requests/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );
  return `${process.env.R2_PUBLIC_URL}${key}`;
}

async function sendDiscordWebhook(
  data: {
    discordUsername: string;
    modType: string;
    modName: string;
    authorName: string;
    downloadLink: string;
    imageUrls: string[];
  }
) {
  const webhook = process.env.DISCORD_MOD_REQUEST_WEBHOOK;
  if (!webhook) return;

  const gameEmoji = data.modType === "BeamNG.drive" ? "🚗" : "🏎️";
  const hasImages = data.imageUrls.length > 0;
  const now = Math.floor(Date.now() / 1000);

  // ── Main embed — styled to match the ModsHaven dark-orange theme ──
  const mainEmbed: Record<string, any> = {
    author: {
      name: "▸  MODSHAVEN  ·  MOD REQUEST",
      icon_url: "https://modshaven.com/icon/logo_1.png",
      url: "https://modshaven.com",
    },
    title: `${gameEmoji}  ${data.modName}`,
    url: data.downloadLink,
    description: [
      "```",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `  ${data.modName}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "```",
    ].join("\n"),
    color: 0xff6600,
    fields: [
      // Row 1
      {
        name: "🎮  GAME",
        value: `> ${gameEmoji} **${data.modType}**`,
        inline: true,
      },
      {
        name: "✍️  MOD AUTHOR",
        value: data.authorName
          ? `> 👤 **${data.authorName}**`
          : "> _Not provided_",
        inline: true,
      },
      {
        name: "📨  REQUESTED BY",
        value: `> 💬 **${data.discordUsername}**`,
        inline: true,
      },
      // Divider row
      {
        name: "\u200b",
        value: "▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔",
        inline: false,
      },
      // Row 2
      {
        name: "🔗  DOWNLOAD LINK",
        value: `> 📥 [**Open download page**](${data.downloadLink})`,
        inline: false,
      },
      {
        name: "🖼️  SCREENSHOTS",
        value: hasImages
          ? `> 🟠 **${data.imageUrls.length}** image${data.imageUrls.length > 1 ? "s" : ""} uploaded`
          : "> ⬜ No screenshots provided",
        inline: true,
      },
      {
        name: "🕐  SUBMITTED",
        value: `> <t:${now}:F>`,
        inline: true,
      },
    ],
    thumbnail: {
      url: "https://image.modshaven.com/icon/logo_1.png",
    },
    ...(hasImages && { image: { url: data.imageUrls[0] } }),
    footer: {
      text: "modshaven.com  ·  Mod Request System  ·  Review pending",
      icon_url: "https://image.modshaven.com/icon/logo_1.png",
    },
    timestamp: new Date().toISOString(),
  };

  const embeds: Record<string, any>[] = [mainEmbed];

  // Extra screenshots — borderless accent embeds that feel like a gallery strip
  for (const url of data.imageUrls.slice(1)) {
    embeds.push({ color: 0x1a1a1a, image: { url } });
  }

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "ModsHaven",
      avatar_url: "https://image.modshaven.com/icon/logo_1.png",
      content: [
        "### 🟠  New Mod Request",
        "> Someone just submitted a mod through **[modshaven.com](https://modshaven.com/send)** — review it below.",
      ].join("\n"),
      embeds,
    }),
  });
}

// ── Mongoose schema ──
const modRequestSchema = new mongoose.Schema(
  {
    discordUsername: { type: String, required: true },
    modType: { type: String, required: true },
    modName: { type: String, required: true },
    authorName: { type: String },
    downloadLink: { type: String, required: true },
    images: [{ type: String }], // R2 public URLs
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ModRequest =
  mongoose.models.ModRequest || mongoose.model("ModRequest", modRequestSchema);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const discordUsername = (formData.get("discordUsername") as string | null)?.trim() ?? "";
    const modType = (formData.get("modType") as string | null) ?? "";
    const modName = (formData.get("modName") as string | null)?.trim() ?? "";
    const authorName = (formData.get("authorName") as string | null)?.trim() ?? "";
    const downloadLink = (formData.get("downloadLink") as string | null)?.trim() ?? "";
    const imageFiles = formData.getAll("images") as File[];

    if (!discordUsername || !modType || !modName || !downloadLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate download URL
    try {
      const url = new URL(downloadLink);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      return NextResponse.json({ error: "Invalid download URL" }, { status: 400 });
    }

    // Validate mod type
    if (!["BeamNG.drive", "Assetto Corsa"].includes(modType)) {
      return NextResponse.json({ error: "Invalid mod type" }, { status: 400 });
    }

    // Validate images
    const validImages = imageFiles.filter(
      (f) => f instanceof File && ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE
    );
    if (validImages.length > 5) {
      return NextResponse.json({ error: "Too many images (max 5)" }, { status: 400 });
    }

    // Upload images to R2
    const imageUrls = await Promise.all(validImages.map(uploadToR2));

    // Save to MongoDB
    await connectToDatabase();
    await ModRequest.create({
      discordUsername: discordUsername.slice(0, 100),
      modType,
      modName: modName.slice(0, 200),
      authorName: authorName.slice(0, 200) || undefined,
      downloadLink,
      images: imageUrls,
    });

    // Notify Discord
    await sendDiscordWebhook({
      discordUsername,
      modType,
      modName,
      authorName,
      downloadLink,
      imageUrls,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[/api/send] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
