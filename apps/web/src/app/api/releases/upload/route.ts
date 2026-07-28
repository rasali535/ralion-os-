import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/releases/upload — Admin endpoint to create & publish a new release
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify admin authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { version, platform, architecture, releaseType, fileName, fileUrl, fileSize, checksum, releaseNotes, isLatest } = body;

    if (!version || !platform || !fileName || !fileUrl) {
      return NextResponse.json({ error: 'Missing required release fields' }, { status: 400 });
    }

    // If marked as latest, unmark existing latest releases for this platform
    if (isLatest) {
      await supabase
        .from('releases')
        .update({ is_latest: false })
        .eq('platform', platform);
    }

    // Insert new release record
    const { data: release, error } = await supabase
      .from('releases')
      .insert({
        product_name: 'Ralion',
        version,
        platform,
        architecture: architecture || 'x64',
        release_type: releaseType || 'community',
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize || 0,
        checksum,
        release_notes: releaseNotes,
        is_latest: isLatest ?? true,
        status: 'published',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, release });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
