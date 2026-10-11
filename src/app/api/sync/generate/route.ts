import { NextResponse } from 'next/server';

function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = 3;
  const charsPerSegment = 4;
  const parts: string[] = [];

  for (let s = 0; s < segments; s++) {
    let segment = '';
    for (let c = 0; c < charsPerSegment; c++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(segment);
  }

  return parts.join('-');
}

export async function POST() {
  try {
    const syncCode = generateSyncCode();
    return NextResponse.json({
      success: true,
      sync_code: syncCode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
