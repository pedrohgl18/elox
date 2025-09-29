import { NextResponse } from 'next/server';

export async function GET(_req: Request, _ctx: { params: { platform: string } }) {
  return NextResponse.json(
    { error: 'Social OAuth has been removed (410).' },
    { status: 410 }
  );
}
