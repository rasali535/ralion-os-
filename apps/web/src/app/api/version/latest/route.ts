import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/version/latest — Returns the latest app version & download URLs
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: releases } = await supabase
      .from('download_releases')
      .select('*')
      .eq('is_latest', true)
      .order('released_at', { ascending: false });

    if (!releases || releases.length === 0) {
      // Fallback version info
      return NextResponse.json({
        version: '1.0.0',
        releaseDate: '2026-07-28',
        releaseNotes: 'Initial release of Ralion Desktop — Empowered to Prosper',
        downloads: {
          windows: { url: null, size: null, checksum: null },
          macos: { url: null, size: null, checksum: null },
          linux: { url: null, size: null, checksum: null },
        },
      });
    }

    // Build response grouped by platform
    const byPlatform: Record<string, any> = {};
    for (const r of releases) {
      byPlatform[r.platform] = {
        url: r.download_url,
        size: r.file_size_mb ? `${r.file_size_mb} MB` : null,
        checksum: r.checksum,
        version: r.version,
      };
    }

    return NextResponse.json({
      version: releases[0]?.version || '1.0.0',
      releaseDate: releases[0]?.released_at,
      releaseNotes: releases[0]?.release_notes,
      downloads: {
        windows: byPlatform['windows'] || null,
        macos: byPlatform['macos'] || null,
        linux: byPlatform['linux'] || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
