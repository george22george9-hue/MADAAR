// ====================================================================
// HADAR SaaS Platform — Server-Side Attendance Processing API
// Developed by MADAAR Technologies
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qr_token, session_id, mode = 'check_in', recorded_by } = body;

    if (!qr_token || !session_id) {
      return NextResponse.json(
        { success: false, error: 'qr_token and session_id are required' },
        { status: 400 }
      );
    }

    // In production with live Supabase:
    // Call stored procedure: process_qr_attendance(qr_token, session_id, recorded_by, mode)
    // Here we validate and return success:
    return NextResponse.json({
      success: true,
      mode,
      message_ar: mode === 'check_in' ? 'تمام، اتحضر بنجاح' : 'تم تسجيل الانصراف بنجاح',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
