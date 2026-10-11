import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  const syncCode = request.nextUrl.searchParams.get('sync_code');

  if (!syncCode) {
    return NextResponse.json({ error: 'Missing sync_code parameter' }, { status: 400 });
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('dashboard_sync')
      .select('content, updated_at')
      .eq('sync_code', syncCode)
      .maybeSingle();

    if (error) throw new Error(`Query failed: ${error.message}`);

    if (!data) {
      return NextResponse.json({ error: 'Sync code not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: data.content,
      updated_at: data.updated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
