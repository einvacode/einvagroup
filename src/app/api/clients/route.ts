import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama klien wajib diisi"),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id: _id, ...data } = clientSchema.parse(body);

    const client = await prisma.client.create({
      data,
    });

    return NextResponse.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = clientSchema.parse(body);

    if (!data.id) {
      return NextResponse.json({ error: "Client id is required" }, { status: 400 });
    }

    const { id, ...updateData } = data;
    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Client id is required" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const projects = await tx.project.findMany({ where: { clientId: id }, select: { id: true } });
      for (const p of projects) {
        const invoices = await tx.invoice.findMany({ where: { projectId: p.id }, select: { id: true } });
        const invoiceIds = invoices.map((i) => i.id);
        if (invoiceIds.length > 0) {
          await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
          await tx.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
          await tx.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
        }

        const quotations = await tx.quotation.findMany({ where: { projectId: p.id }, select: { id: true } });
        const quotationIds = quotations.map((q) => q.id);
        if (quotationIds.length > 0) {
          await tx.quotationItem.deleteMany({ where: { quotationId: { in: quotationIds } } });
          await tx.quotation.deleteMany({ where: { id: { in: quotationIds } } });
        }

        await tx.schedule.deleteMany({ where: { projectId: p.id } });
        await tx.progressUpdate.deleteMany({ where: { projectId: p.id } });
        await tx.expense.deleteMany({ where: { projectId: p.id } });
        await tx.project.delete({ where: { id: p.id } });
      }

      // Hapus invoice atau quotation langsung yang terkait client jika ada
      const directInvoices = await tx.invoice.findMany({ where: { clientId: id }, select: { id: true } });
      const directInvIds = directInvoices.map((i) => i.id);
      if (directInvIds.length > 0) {
        await tx.payment.deleteMany({ where: { invoiceId: { in: directInvIds } } });
        await tx.invoiceItem.deleteMany({ where: { invoiceId: { in: directInvIds } } });
        await tx.invoice.deleteMany({ where: { id: { in: directInvIds } } });
      }

      const directQuotations = await tx.quotation.findMany({ where: { clientId: id }, select: { id: true } });
      const directQIds = directQuotations.map((q) => q.id);
      if (directQIds.length > 0) {
        await tx.quotationItem.deleteMany({ where: { quotationId: { in: directQIds } } });
        await tx.quotation.deleteMany({ where: { id: { in: directQIds } } });
      }

      await tx.client.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE client error", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
