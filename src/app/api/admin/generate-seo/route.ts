import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // --- Auth Guard (C-4): Only authenticated admins can call this endpoint ---
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json(
      { error: 'Bu işlem için yetkiniz yok.' },
      { status: 401 }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in environment variables.' },
        { status: 500 }
      );
    }

    const { title, description } = await request.json();
    if (!title) {
      return NextResponse.json(
        { error: 'Product title is required.' },
        { status: 400 }
      );
    }

    const prompt = `
      Sen bir SEO uzmanısın. Zuzu Pet Co. adlı e-ticaret markamız için verilen ürün bilgilerine göre SEO uyumlu Meta Başlık (Title), Meta Açıklama (Description) ve Meta Anahtar Kelimeler (Keywords) üret.
      
      Kurallar:
      1. Meta Başlık (metaTitle): Ürün başlığını ve markayı içermeli. Arama motorları için cazip olmalı. Maksimum 60 karakter olmalı. (Örn: "N&D Kuzu Etli Yetişkin Kedi Maması | Zuzu Pet Co.")
      2. Meta Açıklama (metaDescription): Ürünün ana özelliklerini ve faydalarını özetlemeli, tıklama oranını artıracak bir dille yazılmalı. Maksimum 160 karakter olmalı.
      3. Meta Anahtar Kelimeler (metaKeywords): Ürünle ilgili, arama hacmi yüksek, virgülle ayrılmış 4-8 adet anahtar kelime veya kelime grubu olmalı.
      
      Ürün Bilgileri:
      - Ürün Başlığı: ${title}
      - Ürün Açıklaması: ${description || 'Açıklama belirtilmemiş.'}
    `;

    const ai = new GoogleGenAI({ apiKey });

    // We will attempt to use gemini-2.5-flash as the standard modern model.
    // If it fails, we fall back to gemini-2.0-flash or gemini-1.5-flash.
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: any = null;
    let resultJson: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                metaTitle: { type: 'STRING' },
                metaDescription: { type: 'STRING' },
                metaKeywords: { type: 'STRING' }
              },
              required: ['metaTitle', 'metaDescription', 'metaKeywords']
            }
          }
        });

        const textResponse = response.text;
        if (textResponse) {
          resultJson = JSON.parse(textResponse);
          console.log(`Successfully generated SEO metadata using model: ${modelName}`);
          break; // Successfully generated and parsed
        }
      } catch (err) {
        console.warn(`Failed to generate SEO with model ${modelName}:`, err);
        lastError = err;
      }
    }

    if (!resultJson) {
      throw lastError || new Error('Could not generate SEO using any model.');
    }

    return NextResponse.json({
      metaTitle: resultJson.metaTitle,
      metaDescription: resultJson.metaDescription,
      metaKeywords: resultJson.metaKeywords
    });

  } catch (error: any) {
    console.error('Error generating SEO with Gemini:', error);
    return NextResponse.json(
      { error: error?.message || 'SEO data generation failed.' },
      { status: 500 }
    );
  }
}
