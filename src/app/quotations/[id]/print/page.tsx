import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PrintQuotationClient from "./PrintQuotationClient";

export default async function PrintQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const [quotation, company] = await Promise.all([
    prisma.quotation.findUnique({
      where: { id },
      include: {
        items: true,
        project: true,
        client: true,
      },
    }),
    prisma.companyProfile.findFirst(),
  ]);

  if (!quotation) redirect("/quotations");

  return <PrintQuotationClient quotation={quotation} company={company} />;
}
