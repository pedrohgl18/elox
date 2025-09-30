import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;
  const configured = !!key;
  return NextResponse.json({ configured });
}
