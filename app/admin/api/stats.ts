// Route: /admin/api/stats (GET)
// Returns dashboard statistics (admin only)

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Placeholder for stats logic
  return NextResponse.json({
    totalMods: 245,
    beamngMods: 180,
    assettoCorsaMods: 65,
    featuredMods: 23,
    totalDownloads: 15847,
  });
}
