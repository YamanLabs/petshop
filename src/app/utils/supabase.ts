import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single Supabase client instance. If keys are missing, it initializes with empty values but doesn't crash on import.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export async function optimizeAndUploadImage(file: File, maxDimension: number = 1200): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions to fit within maxDimension (maintain aspect ratio)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original file or base64 if context couldn't be created
          resolve(event.target?.result as string);
          return;
        }

        // Draw image onto canvas (scaling it)
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to WebP blob
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              resolve(event.target?.result as string);
              return;
            }

            const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (hasSupabase) {
              try {
                // Generate a unique filename
                const fileExt = 'webp';
                const fileName = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload blob to Supabase Storage bucket 'zuzu-media'
                const { data, error } = await supabase.storage
                  .from('zuzu-media')
                  .upload(filePath, blob, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: false
                  });

                if (error) {
                  console.warn("Supabase storage upload failed, falling back to base64:", error.message);
                  // Return base64 as fallback
                  resolve(event.target?.result as string);
                  return;
                }

                // Get public URL
                const { data: publicUrlData } = supabase.storage
                  .from('zuzu-media')
                  .getPublicUrl(filePath);

                resolve(publicUrlData.publicUrl);
              } catch (err) {
                console.error("Error uploading to storage:", err);
                resolve(event.target?.result as string);
              }
            } else {
              // Return base64 if Supabase is not configured
              resolve(event.target?.result as string);
            }
          },
          'image/webp',
          0.8 // WebP compression quality
        );
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve('');
    };
  });
}
