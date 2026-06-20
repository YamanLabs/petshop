import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    let correctPassword = process.env.ADMIN_ACTION_PASSWORD;

    // Attempt to query password from database
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_action_password')
        .single();
      
      if (!error && data?.value) {
        correctPassword = data.value;
      }
    } catch (dbErr) {
      console.warn('Failed to fetch admin_action_password from Supabase, using local fallback:', dbErr);
    }

    if (!correctPassword) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem şifresi.' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}

