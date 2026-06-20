import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    let correctPassword = process.env.ADMIN_LOGIN_PASSWORD;

    // Attempt to query password from database
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_login_password')
        .single();
      
      if (!error && data?.value) {
        correctPassword = data.value;
      }
    } catch (dbErr) {
      console.warn('Failed to fetch admin_login_password from Supabase, using local fallback:', dbErr);
    }

    if (!correctPassword) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });
      // Set cookie for 1 day
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ error: 'Geçersiz şifre.' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}

