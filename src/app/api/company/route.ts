import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const stringOrNull = z.string().nullable().optional();

const companyProfileSchema = z.object({
  name: z.string().min(1).default("Einva Group"),
  tagline: stringOrNull,
  address: stringOrNull,
  city: stringOrNull,
  phone: stringOrNull,
  email: stringOrNull,
  website: stringOrNull,
  npwp: stringOrNull,
  bankName: stringOrNull,
  bankAccount: stringOrNull,
  bankHolder: stringOrNull,
  directorName: stringOrNull,
  notes: stringOrNull,
  logo: stringOrNull,
  aboutText: stringOrNull,
  servicesJson: stringOrNull,
  portfolioJson: stringOrNull,
  strengthsJson: stringOrNull,
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

    try {
      const { revalidatePath } = require("next/cache");
      revalidatePath("/", "layout");
    } catch (err) {
      console.warn("Failed to revalidate cache", err);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("POST company profile error", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

