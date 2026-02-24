// Route: /user/logout (GET)
// Handles logout logic

import { NextResponse } from 'next/server';

export async function GET() {
  // Clear cookie (placeholder)
  return NextResponse.json({ success: true, message: 'Logged out' });
}
