import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('[MOCK STRIPE] Webhook received');
  return NextResponse.json({ status: "webhook received", mock: true });
}
