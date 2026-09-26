import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Proyek Aktif & Selesai
    const [activeProjectsCount, completedProjectsCount, allProjects] = await Promise.all([
      prisma.project.count({
        where: {
          status: { in: ["PLANNING", "IN_PROGRESS", "ON_HOLD"] },
        },
      }),
      prisma.project.count({
        where: { status: "COMPLETED" },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { name: true } },
        },
      }),
    ]);

    // 2. Keuangan & Invoice
    const [payments, invoices] = await Promise.all([
      prisma.payment.findMany({
        select: { amount: true, date: true },
      }),
      prisma.invoice.findMany({
        select: {
          total: true,
          paidAmount: true,
          status: true,
        },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const unpaidInvoices = invoices.filter((i) => i.status !== "PAID");
    const totalUnpaidAmount = unpaidInvoices.reduce(
      (sum, i) => sum + Math.max(0, (i.total || 0) - (i.paidAmount || 0)),
      0
    );
    const unpaidInvoicesCount = unpaidInvoices.length;

    // 3. Distribusi Proyek Berdasarkan Tipe
    const projectTypes = await prisma.project.groupBy({
      by: ["type"],
      _count: { id: true },
    });

    const typeCountMap: Record<string, number> = {
      CCTV: 0,
      JARINGAN: 0,
      LISTRIK: 0,
      LAINNYA: 0,
    };

    projectTypes.forEach((pt) => {
      const key = pt.type ? pt.type.toUpperCase() : "LAINNYA";
      if (key in typeCountMap) {
        typeCountMap[key] += pt._count.id;
      } else {
        typeCountMap.LAINNYA += pt._count.id;
      }
    });

    const totalTyped = Object.values(typeCountMap).reduce((a, b) => a + b, 0);
    const projectDistribution = [
      { name: "CCTV", value: totalTyped > 0 ? Math.round((typeCountMap.CCTV / totalTyped) * 100) : 0, count: typeCountMap.CCTV },
      { name: "Jaringan", value: totalTyped > 0 ? Math.round((typeCountMap.JARINGAN / totalTyped) * 100) : 0, count: typeCountMap.JARINGAN },
      { name: "Listrik", value: totalTyped > 0 ? Math.round((typeCountMap.LISTRIK / totalTyped) * 100) : 0, count: typeCountMap.LISTRIK },
      { name: "Lainnya", value: totalTyped > 0 ? Math.round((typeCountMap.LAINNYA / totalTyped) * 100) : 0, count: typeCountMap.LAINNYA },
    ];

    // 4. Pendapatan Bulanan (6 Bulan Terakhir)
    const monthsNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const now = new Date();
    const monthlyRevenue: { name: string; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const mYear = d.getFullYear();
      const mName = monthsNames[mIdx];

      const sumForMonth = payments
        .filter((p) => {
          const pDate = new Date(p.date);
          return pDate.getMonth() === mIdx && pDate.getFullYear() === mYear;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      monthlyRevenue.push({ name: mName, total: sumForMonth });
    }

    // 5. Proyek Terbaru
    const recentProjects = allProjects.map((p) => ({
      id: p.id,
      name: p.name,
      client: p.client?.name || "Klien Umum",
      type: p.type,
      progress: p.progress || 0,
      status:
        p.status === "COMPLETED"
          ? "Selesai"
          : p.status === "IN_PROGRESS"
          ? "Berjalan"
          : p.status === "PLANNING"
          ? "Rencana"
          : p.status === "ON_HOLD"
          ? "Ditahan"
          : "Batal",
      date: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(p.createdAt)
      ),
    }));

    // 6. Aktivitas Terkini (gabungan payment terbaru dan progress terbaru)
    const [latestPayments, latestProgress] = await Promise.all([
      prisma.payment.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          invoice: {
            select: { number: true },
          },
        },
      }),
      prisma.progressUpdate.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          project: { select: { name: true } },
        },
      }),
    ]);

    const activities: { icon: string; title: string; desc: string; time: string; tone: string }[] = [];

    latestPayments.forEach((pay) => {
      activities.push({
        icon: "💰",
        title: "Pembayaran Diterima",
        desc: `Pembayaran ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(pay.amount)} untuk Invoice ${pay.invoice?.number || ""}.`,
        time: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(pay.date)),
        tone: "emerald",
      });
    });

    latestProgress.forEach((prg) => {
      activities.push({
        icon: "📈",
        title: "Update Progress Proyek",
        desc: `Proyek ${prg.project?.name || ""} diperbarui ke ${prg.percentage}%.`,
        time: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(prg.createdAt)),
        tone: "blue",
      });
    });

    return NextResponse.json({
      activeProjectsCount,
      completedProjectsCount,
      totalRevenue,
      totalUnpaidAmount,
      unpaidInvoicesCount,
      projectDistribution,
      monthlyRevenue,
      recentProjects,
      activities: activities.slice(0, 5),
    });
  } catch (error: any) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
