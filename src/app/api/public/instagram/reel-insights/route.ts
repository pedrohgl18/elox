// removido: endpoint legado de insights públicos do Instagram
export const dynamic = 'force-static';
export async function GET() { return new Response('Gone', { status: 410 }); }
export async function POST() { return new Response('Gone', { status: 410 }); }
