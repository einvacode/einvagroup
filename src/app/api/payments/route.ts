import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const paymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  method: z.string(),
  note: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");

    const where = invoiceId ? { invoiceId } : {};

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const json = await request.json();
    const body = paymentSchema.parse(json);

    // Run in transaction
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: body.invoiceId }
      });

      if (!invoice) throw new Error("Invoice not found");

      const payment = await tx.payment.create({
        data: {
          invoiceId: body.invoiceId,
          amount: body.amount,
          date: new Date(body.date),
          method: body.method,
          note: body.note,
        }
      });

      const newPaidAmount = invoice.paidAmount + body.amount;
      let newStatus = invoice.status;

      if (newPaidAmount >= invoice.total) {
        newStatus = "PAID";
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIAL";
      }

      await tx.invoice.update({
        where: { id: body.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus
        }
      });

      return payment;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST Payment Error", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
