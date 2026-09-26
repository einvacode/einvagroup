import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PrintInvoiceClient from "./PrintInvoiceClient";

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const [invoice, company] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        project: true,
        client: true,
        payments: { orderBy: { date: "asc" } },
      },
    }),
    prisma.companyProfile.findFirst(),
  ]);

  if (!invoice) redirect("/invoices");

  return <PrintInvoiceClient invoice={invoice} company={company} />;
}
