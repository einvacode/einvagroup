import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya Administrator yang memiliki wewenang untuk mereset data." },
        { status: 403 }
      );
    }

    // Hapus seluruh data operasional sampel secara bertahap dalam transaksi
    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({});
      await tx.invoiceItem.deleteMany({});
      await tx.invoice.deleteMany({});
      await tx.quotationItem.deleteMany({});
      await tx.quotation.deleteMany({});
      await tx.schedule.deleteMany({});
      await tx.progressUpdate.deleteMany({});
      await tx.expense.deleteMany({});
      await tx.project.deleteMany({});
      await tx.client.deleteMany({});
    });

    return NextResponse.json({
      success: true,
      message: "Seluruh data sampel (Klien, Proyek, Penawaran, Invoice, Keuangan) berhasil dibersihkan!",
    });
  } catch (error: any) {
    console.error("POST /api/system/reset-demo error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data sampel" },
      { status: 500 }
    );
  }
}
