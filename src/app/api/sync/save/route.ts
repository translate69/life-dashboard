import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sync_code, content } = body as { sync_code: string; content: unknown };

    if (!sync_code || !content) {
      return NextResponse.json(
        { error: 'Missing sync_code or content' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('dashboard_sync')
      .upsert(
        {
          sync_code,
          content: content as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'sync_code' }
      )
      .select('updated_at')
      .single();

    if (error) throw new Error(`Upsert failed: ${error.message}`);

    return NextResponse.json({
      success: true,
      updated_at: data?.updated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
