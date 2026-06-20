import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_LOGIN_PASSWORD;

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
