import { NextResponse } from 'next/server';

const gone = () =>
  NextResponse.json(
    { error: 'Social accounts feature has been removed (410).' },
    { status: 410 }
  );

export async function GET() {
  return gone();
}

export async function POST(_req: Request) {
  return gone();
}
