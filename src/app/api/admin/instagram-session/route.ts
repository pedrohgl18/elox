import { NextResponse } from 'next/server';

// Deprecated: Instagram session storage is no longer used. Kept as stub to avoid 404s.
export async function GET() {
  return NextResponse.json({ error: 'Gone: Instagram session disabled. Use Apify integration only.' }, { status: 410 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Gone: Instagram session disabled. Use Apify integration only.' }, { status: 410 });
}
