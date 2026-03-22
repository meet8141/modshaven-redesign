import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

const GUILD_ID = process.env.DISCORD_GUILD_ID || process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || "YOUR_GUILD_ID";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN || "YOUR_BOT_TOKEN";

export const revalidate = 60;

const getDiscordStatsCached = unstable_cache(
  async () => {
    const guildRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });
    const guildData = await guildRes.json();
    const memberCount = guildData.approximate_member_count || guildData.member_count || 0;
    const onlineCount = guildData.approximate_presence_count || 0;

    return { memberCount, onlineCount };
  },
  ['discord-stats'],
  { revalidate: 60 }
);

export async function GET(_req: NextRequest) {
  if (!GUILD_ID || !BOT_TOKEN || GUILD_ID === "YOUR_GUILD_ID" || BOT_TOKEN === "YOUR_BOT_TOKEN") {
    return NextResponse.json({ memberCount: 0, onlineCount: 0, error: 'Missing Discord credentials' }, { status: 500 });
  }

  try {
    const { memberCount, onlineCount } = await getDiscordStatsCached();
    return NextResponse.json(
      { memberCount, onlineCount },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ memberCount: 0, onlineCount: 0, error: message }, { status: 500 });
  }
}
