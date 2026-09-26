import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const quotationItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  qty: z.coerce.number().default(1),
  quantity: z.coerce.number().optional(),
  unit: z.string().default("Unit"),
  unitPrice: z.coerce.number().default(0),
});

const quotationSchema = z.object({
  projectId: z.string(),
  clientId: z.string(),
  subject: z.string().optional(),
  items: z.array(quotationItemSchema),
  discount: z.coerce.number().default(0),
  tax: z.coerce.number().default(0),
  notes: z.string().optional(),
  validUntil: z.string().datetime().optional(),
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

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        project: true,
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("GET Quotations Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const json = await request.json();
    const body = quotationSchema.parse(json);

    const normalizedItems = body.items.map(item => {
      const qty = Number(item.qty ?? item.quantity ?? 1);
      const unitPrice = Number(item.unitPrice ?? 0);
      return {
        ...item,
        qty,
        unitPrice,
        total: qty * unitPrice,
      };
    });

    // Auto-generate number: SPH-YYYY-NNN
    const year = new Date().getFullYear();
    const count = await prisma.quotation.count({
      where: {
        number: {
          startsWith: `SPH-${year}-`,
        }
      }
    });
    const number = `SPH-${year}-${String(count + 1).padStart(3, '0')}`;

    const subtotal = normalizedItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const totalAfterDiscount = subtotal - body.discount;
    const taxAmount = (totalAfterDiscount * body.tax) / 100;
    const total = totalAfterDiscount + taxAmount;

    const quotation = await prisma.quotation.create({
      data: {
        number,
        projectId: body.projectId,
        clientId: body.clientId,
        subtotal,
        tax: body.tax,
        total,
        notes: (body.notes || "").trim(),
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        status: "DRAFT",
        items: {
          create: normalizedItems.map(item => ({
            name: item.name,
            description: item.description,
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
          }))
        }
      },
      include: { items: true, project: true, client: true }
    });

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("POST Quotation Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
