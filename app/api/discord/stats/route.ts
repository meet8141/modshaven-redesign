import { NextRequest, NextResponse } from 'next/server';

const GUILD_ID = process.env.DISCORD_GUILD_ID || process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || "YOUR_GUILD_ID";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN || "YOUR_BOT_TOKEN";

export async function GET(req: NextRequest) {
  if (!GUILD_ID || !BOT_TOKEN || GUILD_ID === "YOUR_GUILD_ID" || BOT_TOKEN === "YOUR_BOT_TOKEN") {
    return NextResponse.json({ memberCount: 0, onlineCount: 0, error: 'Missing Discord credentials' }, { status: 500 });
  }

  try {
    // Fetch member and online count (approximate)
    const guildRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });
    const guildData = await guildRes.json();
    const memberCount = guildData.approximate_member_count || guildData.member_count || 0;
    // Try to get online count from API if available
    const onlineCount = guildData.approximate_presence_count || 0;
    return NextResponse.json({ memberCount, onlineCount });
  } catch (error) {
    return NextResponse.json({ memberCount: 0, onlineCount: 0, error: error.message }, { status: 500 });
  }
}
