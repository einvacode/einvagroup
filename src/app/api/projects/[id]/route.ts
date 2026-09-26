import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        quotations: true,
        invoices: true,
        schedules: true,
        progressUpdates: true,
        expenses: true,
      },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    // Parse dates if present
    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const project = await prisma.project.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.$transaction(async (tx) => {
      const invoices = await tx.invoice.findMany({ where: { projectId: id }, select: { id: true } });
      const invoiceIds = invoices.map((i) => i.id);
      if (invoiceIds.length > 0) {
        await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        await tx.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        await tx.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
      }

      const quotations = await tx.quotation.findMany({ where: { projectId: id }, select: { id: true } });
      const quotationIds = quotations.map((q) => q.id);
      if (quotationIds.length > 0) {
        await tx.quotationItem.deleteMany({ where: { quotationId: { in: quotationIds } } });
        await tx.quotation.deleteMany({ where: { id: { in: quotationIds } } });
      }

      await tx.schedule.deleteMany({ where: { projectId: id } });
      await tx.progressUpdate.deleteMany({ where: { projectId: id } });
      await tx.expense.deleteMany({ where: { projectId: id } });

      await tx.project.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE project error", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
