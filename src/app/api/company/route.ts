import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const companyProfileSchema = z.object({
  name: z.string().min(1).default("ProjeKerja"),
  tagline: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  npwp: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  bankAccount: z.string().optional().or(z.literal("")),
  bankHolder: z.string().optional().or(z.literal("")),
  directorName: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  aboutText: z.string().optional().or(z.literal("")),
  servicesJson: z.string().optional().or(z.literal("")),
  portfolioJson: z.string().optional().or(z.literal("")),
  strengthsJson: z.string().optional().or(z.literal("")),
});

const defaultCompanyProfile = {
  name: "Einva Group",
  tagline: "Installed Right, Serviced Better",
  address: "Gempol Rt 10 Sambirejo, Sambirejo, Sragen",
  city: "Jawa Tengah",
  phone: "082346268845",
  email: "info@einvaintidata.com",
  website: "https://einvaintidata.com",
  npwp: "00.000.000.0-000.000",
  bankName: "Bank Rakyat Indonesia",
  bankAccount: "000000000000000",
  bankHolder: "PT EINVA INTI DATA",
  directorName: "Ahmad Fauzi",
  notes: "Pembayaran dapat ditransfer sesuai rekening bank yang tertera.",
  logo: ""
};

async function ensureCompanyProfile() {
  const existing = await prisma.companyProfile.findFirst();

  if (existing) return existing;

  return prisma.companyProfile.create({
    data: defaultCompanyProfile,
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const profile = await ensureCompanyProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET company profile error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const parsed = companyProfileSchema.parse(body);

    const profile = await ensureCompanyProfile();
    const updated = await prisma.companyProfile.update({
      where: { id: profile.id },
      data: {
        ...parsed,
        email: parsed.email || null,
        website: parsed.website || null,
        tagline: parsed.tagline || null,
        address: parsed.address || null,
        city: parsed.city || null,
        phone: parsed.phone || null,
        npwp: parsed.npwp || null,
        bankName: parsed.bankName || null,
        bankAccount: parsed.bankAccount || null,
        bankHolder: parsed.bankHolder || null,
        directorName: parsed.directorName || null,
        notes: parsed.notes || null,
        logo: parsed.logo || null,
        aboutText: parsed.aboutText || null,
        servicesJson: parsed.servicesJson || null,
        portfolioJson: parsed.portfolioJson || null,
        strengthsJson: parsed.strengthsJson || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("POST company profile error", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
