import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    let correctPassword = process.env.ADMIN_LOGIN_PASSWORD;
    let dbErrorDetail: string | null = null;
    let dbSuccess = false;

    // Attempt to query password from database
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_login_password')
        .single();
      
      if (error) {
        dbErrorDetail = error.message;
      } else if (data?.value) {
        correctPassword = data.value;
        dbSuccess = true;
      } else {
        dbErrorDetail = 'admin_login_password anahtarı için değer bulunamadı.';
      }
    } catch (dbErr: any) {
      dbErrorDetail = dbErr?.message || String(dbErr);
    }

    if (!correctPassword) {
      console.error('Doğrulama hatası detayları:', {
        dbError: dbErrorDetail,
        dbSuccess,
        envVarExists: !!process.env.ADMIN_LOGIN_PASSWORD,
      });

      return NextResponse.json({ 
        error: 'Server configuration error.',
        details: {
          dbError: dbErrorDetail,
          dbSuccess,
          envVarExists: !!process.env.ADMIN_LOGIN_PASSWORD,
          tip: 'Eğer .env.local dosyasına yeni şifreler eklediyseniz, değişikliklerin geçerli olması için yerel geliştirme sunucusunu (npm run dev) yeniden başlatmanız gerekebilir.'
        }
      }, { status: 500 });
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


