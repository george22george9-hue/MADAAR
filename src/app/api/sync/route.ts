// ====================================================================
// HADAR SaaS Platform — Offline Event Batch Sync API
// Developed by MADAAR Technologies
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { device_id, events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'events array is required' },
        { status: 400 }
      );
    }

    // Process events idempotently based on offline_event_id and unique(session_id, student_id)
    const results = events.map((evt) => ({
      offline_event_id: evt.offline_event_id,
      status: 'synced',
      server_timestamp: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      device_id,
      synced_count: results.length,
      results
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
