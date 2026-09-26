import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        project: true,
        client: true,
        payments: true,
      },
    });

    if (!invoice) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(invoice);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { invoiceId: id } });
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE invoice error", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
