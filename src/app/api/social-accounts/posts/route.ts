import { NextResponse } from 'next/server';

export async function GET(_req: Request) {
  return NextResponse.json(
    { error: 'Social accounts feature has been removed (410).' },
    { status: 410 }
  );
}
