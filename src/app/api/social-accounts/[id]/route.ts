import { NextResponse } from 'next/server';

const gone = () =>
  NextResponse.json(
    { error: 'Social accounts feature has been removed (410).' },
    { status: 410 }
  );

export async function PATCH(_req: Request, _ctx: { params: { id: string } }) {
  return gone();
}

export async function DELETE(_req: Request, _ctx: { params: { id: string } }) {
  return gone();
}
