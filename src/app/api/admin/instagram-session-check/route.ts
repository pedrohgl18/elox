import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Gone: Session check disabled. Use Apify integration only.' }, { status: 410 });
}
