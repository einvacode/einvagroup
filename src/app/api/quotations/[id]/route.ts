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

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        items: true,
        project: true,
        client: true,
      },
    });

    if (!quotation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(quotation);
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
    
    // Simplistic update for status and fields
    const quotation = await prisma.quotation.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        // Add more logic for items update if necessary
      },
    });

    return NextResponse.json(quotation);
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
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      await tx.quotation.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE quotation error", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
