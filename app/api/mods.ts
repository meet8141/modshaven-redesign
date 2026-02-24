// API route: /api/mods
// Handles: GET all mods, GET single mod by ID

import { NextRequest, NextResponse } from 'next/server';

// Dummy data for structure (replace with DB logic)
const mods = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'BMW M5 E60',
    description: 'High performance sedan',
    author: 'ModAuthor',
    game: 'BeamNG.drive',
    downloads_size: '25.3 MB',
    download_link: 'https://example.com/download',
    mod_image: '/uploads/12345-bmw.jpg',
    images: ['/uploads/12345-bmw2.jpg'],
    downloads: 150,
    featured: true,
    date_added: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
];

export async function GET(req: NextRequest) {
  // /api/mods or /api/mods?id=xxx
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const mod = mods.find((m) => m._id === id);
    if (!mod) {
      return NextResponse.json({ error: 'Mod not found' }, { status: 404 });
    }
    return NextResponse.json(mod);
  }
  return NextResponse.json(mods);
}
