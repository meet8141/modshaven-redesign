// Route: /discord/stats (GET)
// Returns Discord server stats (public, cached)

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Placeholder for Discord stats logic
  return NextResponse.json({
    online: 150,
    total: 1250,
    invite: 'https://discord.gg/yourcode',
  });
}
