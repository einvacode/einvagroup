import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { prisma } from "@/lib/db";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  let company = null;
  try {
    company = await prisma.companyProfile.findFirst();
  } catch (e) {
    // ignore db error during build
  }

  const name = company?.name || "PT EINVA INTI DATA";
  const logoUrl = company?.logo || "/icon"; // fallback to our generated icon.tsx if no logo in DB

  return {
    title: `${name} - Solusi IT, Jaringan & Keamanan`,
    description: `Platform resmi ${name} untuk profil perusahaan, portofolio pekerjaan instalasi teknologi, serta manajemen operasional internal.`,
    icons: {
      icon: logoUrl,
      apple: logoUrl,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
