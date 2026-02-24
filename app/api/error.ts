// Global error handler (for demonstration)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
