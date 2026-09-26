import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const invoiceSchema = z.object({
  projectId: z.string(),
  clientId: z.string(),
  quotationId: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    qty: z.coerce.number(),
    unit: z.string(),
    unitPrice: z.coerce.number(),
  })),
  discount: z.coerce.number().default(0),
  tax: z.coerce.number().default(0),
  notes: z.string().optional(),
  initialPayment: z.coerce.number().default(0),
  dueDate: z.string().datetime(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        project: true,
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const json = await request.json();
    const body = invoiceSchema.parse(json);

    // Auto-generate number: INV-YYYY-NNN
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        number: {
          startsWith: `INV-${year}-`,
        }
      }
    });
    const number = `INV-${year}-${String(count + 1).padStart(3, '0')}`;

    const subtotal = body.items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const totalAfterDiscount = subtotal - body.discount;
    const taxAmount = (totalAfterDiscount * body.tax) / 100;
    const total = totalAfterDiscount + taxAmount;
    const initialPayment = Math.min(Math.max(body.initialPayment || 0, 0), total);
    const initialStatus = initialPayment >= total ? "PAID" : initialPayment > 0 ? "PARTIAL" : "DRAFT";

    const invoice = await prisma.invoice.create({
      data: {
        number,
        projectId: body.projectId,
        clientId: body.clientId,
        quotationId: body.quotationId,
        subtotal,
        tax: body.tax,
        total,
        paidAmount: initialPayment,
        notes: body.notes || (initialPayment > 0 ? `Uang muka awal: Rp${initialPayment.toLocaleString("id-ID")}` : ""),
        dueDate: new Date(body.dueDate),
        status: initialStatus,
        items: {
          create: body.items.map(item => ({
            name: item.name,
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.qty * item.unitPrice,
          }))
        }
      },
      include: { items: true, project: true, client: true }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("POST Invoice Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
