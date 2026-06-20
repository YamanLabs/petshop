import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    let correctPassword = process.env.ADMIN_ACTION_PASSWORD;
    let dbErrorDetail: string | null = null;
    let dbSuccess = false;

    // Attempt to query password from database
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_action_password')
        .single();
      
      if (error) {
        dbErrorDetail = error.message;
      } else if (data?.value) {
        correctPassword = data.value;
        dbSuccess = true;
      } else {
        dbErrorDetail = 'admin_action_password anahtarı için değer bulunamadı.';
      }
    } catch (dbErr: any) {
      dbErrorDetail = dbErr?.message || String(dbErr);
    }

    if (!correctPassword) {
      console.error('İşlem doğrulama hatası detayları:', {
        dbError: dbErrorDetail,
        dbSuccess,
        envVarExists: !!process.env.ADMIN_ACTION_PASSWORD,
      });

      return NextResponse.json({ 
        error: 'Server configuration error.',
        details: {
          dbError: dbErrorDetail,
          dbSuccess,
          envVarExists: !!process.env.ADMIN_ACTION_PASSWORD,
          tip: 'Eğer .env.local dosyasına yeni şifreler eklediyseniz, değişikliklerin geçerli olması için yerel geliştirme sunucusunu (npm run dev) yeniden başlatmanız gerekebilir.'
        }
      }, { status: 500 });
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem şifresi.' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}


