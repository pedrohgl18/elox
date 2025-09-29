import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Social accounts admin API has been removed (410).' },
    { status: 410 }
  );
}
