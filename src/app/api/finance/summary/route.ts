import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        items: true,
        payments: true,
        quotation: {
          include: { project: true }
        }
      }
    })

    let totalRevenue = 0
    let totalOutstanding = 0

    const currentYear = new Date().getFullYear()
    const monthlyDataMap = new Map<string, { month: string; income: number; expense: number }>()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    months.forEach((month) => {
      monthlyDataMap.set(month, { month, income: 0, expense: 0 })
    })

    const revenueByTypeMap = new Map<string, number>()

    invoices.forEach((inv) => {
      const total = inv.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0)
      const paid = inv.payments.reduce((sum, pay) => sum + pay.amount, 0)

      totalRevenue += paid
      totalOutstanding += (total - paid)

      inv.payments.forEach((payment) => {
        const payDate = new Date(payment.date)
        if (payDate.getFullYear() === currentYear) {
          const monthName = months[payDate.getMonth()]
          const mData = monthlyDataMap.get(monthName)
          if (mData) mData.income += payment.amount
        }
      })

      if (inv.quotation?.project?.type) {
        const type = inv.quotation.project.type
        const current = revenueByTypeMap.get(type) || 0
        revenueByTypeMap.set(type, current + paid)
      }
    })

    const expenses = await prisma.expense.findMany()

    let totalExpenses = 0
    expenses.forEach((exp) => {
      totalExpenses += exp.amount

      const expDate = new Date(exp.date)
      if (expDate.getFullYear() === currentYear) {
        const monthName = months[expDate.getMonth()]
        const mData = monthlyDataMap.get(monthName)
        if (mData) mData.expense += exp.amount
      }
    })

    const netProfit = totalRevenue - totalExpenses

    const revenueByType = Array.from(revenueByTypeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)

    const statusCounts: Record<string, number> = {}
    invoices.forEach((inv) => {
      statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1
    })

    const invoiceStatus = [
      { name: 'Lunas', value: statusCounts['PAID'] || 0, color: '#16a34a' },
      { name: 'Dibayar Sebagian', value: statusCounts['PARTIAL'] || 0, color: '#d97706' },
      { name: 'Belum Dibayar', value: statusCounts['UNPAID'] || 0, color: '#9ca3af' },
      { name: 'Jatuh Tempo', value: statusCounts['OVERDUE'] || 0, color: '#dc2626' }
    ].filter((s) => s.value > 0)

    const projects = await prisma.project.findMany({
      include: {
        quotations: {
          include: {
            invoices: {
              include: { items: true, payments: true }
            }
          }
        },
        expenses: true,
      }
    })

    const projectFinances = projects.map((p) => {
      let contractValue = 0
      let paid = 0
      let expense = p.expenses.reduce((sum, e) => sum + e.amount, 0)

      p.quotations.forEach((q) => {
        q.invoices.forEach((inv) => {
          const invTotal = inv.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0)
          const invPaid = inv.payments.reduce((sum, pay) => sum + pay.amount, 0)
          contractValue += invTotal
          paid += invPaid
        })
      })

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        contractValue,
        paid,
        remaining: contractValue - paid,
        expense,
        profit: paid - expense
      }
    })

    return NextResponse.json({
      totalRevenue,
      totalOutstanding,
      totalExpenses,
      netProfit,
      monthlyData: Array.from(monthlyDataMap.values()),
      revenueByType,
      invoiceStatus,
      projectFinances
    })
  } catch (error) {
    console.error("GET /api/finance/summary error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
