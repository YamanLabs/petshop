import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_ACTION_PASSWORD;

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
