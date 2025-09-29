import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Gone: Instagram cookie disabled. Use Apify integration only.' }, { status: 410 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Gone: Instagram cookie disabled. Use Apify integration only.' }, { status: 410 });
}
