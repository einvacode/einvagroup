import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default async function Icon() {
  let name = 'E';
  
  try {
    const company = await prisma.companyProfile.findFirst({ select: { name: true, logo: true } });
    
    if (company?.name) {
      name = company.name.charAt(0).toUpperCase();
    }

    if (company?.logo) {
      // Clean up the path (e.g. '/uploads/file.png' -> 'public/uploads/file.png')
      const relativePath = company.logo.startsWith('/') ? company.logo.substring(1) : company.logo;
      const filePath = join(process.cwd(), 'public', relativePath);
      
      // If the file actually exists on disk, we can try to return it directly.
      // But since ImageResponse expects React elements, we will just fallback
      // to the initial if we can't serve it easily here.
      // Wait, we can't easily return a raw buffer from an `icon.tsx` file using ImageResponse.
      // Actually, we CAN return a raw Response from `icon.tsx`!
      if (existsSync(filePath)) {
        const fileBuffer = readFileSync(filePath);
        return new Response(fileBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }
  } catch (error) {
    // Ignore DB/FS errors
  }

  // Fallback to letter
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#4f46e5',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
          fontWeight: 900,
          fontFamily: 'sans-serif'
        }}
      >
        {name}
      </div>
    ),
    { ...size }
  );
}
