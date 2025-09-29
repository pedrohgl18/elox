import { NextResponse } from 'next/server';

export async function PATCH(_req: Request, _ctx: { params: { id: string } }) {
  return NextResponse.json(
    { error: 'Social accounts admin API has been removed (410).' },
    { status: 410 }
  );
}
