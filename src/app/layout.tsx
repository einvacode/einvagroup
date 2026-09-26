import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { prisma } from "@/lib/db";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  let logo = "";
  let name = "PT EINVA INTI DATA";

  try {
    const company = await prisma.companyProfile.findFirst({
      select: { name: true, logo: true },
    });
    if (company?.name) name = company.name;
    if (company?.logo && company.logo.length > 1) logo = company.logo;
  } catch {
    // DB not ready during build — that's fine, use defaults
  }

  return {
    title: `${name} - Solusi IT, Jaringan & Keamanan`,
    description: `Platform resmi ${name} untuk profil perusahaan, portofolio pekerjaan instalasi teknologi, serta manajemen operasional internal.`,
    icons: logo ? { icon: logo, apple: logo } : undefined,
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
