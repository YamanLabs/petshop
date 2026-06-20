import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';
import { checkRateLimit, getClientIp } from '@/app/lib/rateLimiter';

export async function POST(request: Request) {
  // --- Rate Limiting (C-3) ---
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Çok fazla başarısız işlem denemesi. Lütfen ${rateLimit.retryAfterSeconds} saniye sonra tekrar deneyin.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds ?? 900),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const { password } = await request.json();

    // Basic input validation
    if (!password || typeof password !== 'string' || password.length > 128) {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    let correctPassword = process.env.ADMIN_ACTION_PASSWORD;

    // Attempt to query password from database as override
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_action_password')
        .single();

      if (!error && data?.value) {
        correctPassword = data.value;
      }
    } catch {
      // Silently fall back to env var — do NOT expose DB error details to client (H-2)
    }

    if (!correctPassword) {
      // Log detailed info server-side only, never send to client (H-2)
      console.error('[verify-action] İşlem şifresi yapılandırması bulunamadı. ADMIN_ACTION_PASSWORD env değişkenini kontrol edin.');
      return NextResponse.json(
        { error: 'Sunucu yapılandırma hatası. Lütfen sistem yöneticisiyle iletişime geçin.' },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem şifresi.' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }
}
