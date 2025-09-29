import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Instagram OAuth has been removed (410).' },
    { status: 410 }
  );
}
