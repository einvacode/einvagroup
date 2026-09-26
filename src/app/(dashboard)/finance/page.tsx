'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, CreditCard, Loader2, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/utils'

type FinanceSummary = {
  totalRevenue: number
  totalOutstanding: number
  totalExpenses: number
  netProfit: number
  monthlyData: any[]
  revenueByType: any[]
  invoiceStatus: any[]
  projectFinances: any[]
}

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#4b5563']

export default function FinanceDashboardPage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/finance/summary')
      if (res.ok) {
        const data = await res.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Failed to fetch finance summary', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !summary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 p-6 text-white shadow-xl shadow-emerald-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Finance</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard Keuangan</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur-sm">
            <TrendingUp className="h-4 w-4" />
            Kinerja naik 14.8%
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Pendapatan', value: formatRupiah(summary.totalRevenue), tone: 'emerald', icon: ArrowUpRight },
          { label: 'Piutang (Belum Dibayar)', value: formatRupiah(summary.totalOutstanding), tone: 'amber', icon: CreditCard },
          { label: 'Total Pengeluaran', value: formatRupiah(summary.totalExpenses), tone: 'rose', icon: TrendingUp },
          { label: 'Laba Bersih', value: formatRupiah(summary.netProfit), tone: 'blue', icon: ArrowUpRight },
        ].map(({ label, value, tone, icon: Icon }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  tone === 'amber' ? 'bg-amber-50 text-amber-600' :
                  tone === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pendapatan vs Pengeluaran Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `Rp ${value / 1000000}M`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Pendapatan" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pendapatan per Tipe Proyek</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary.revenueByType} cx="50%" cy="50%" outerRadius={78} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {summary.revenueByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Status Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary.invoiceStatus} cx="50%" cy="50%" innerRadius={56} outerRadius={78} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                      {summary.invoiceStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatRupiah(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Keuangan per Proyek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nama Proyek</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Nilai Kontrak</th>
                  <th className="px-4 py-3">Dibayar</th>
                  <th className="px-4 py-3">Sisa</th>
                  <th className="px-4 py-3">Pengeluaran</th>
                  <th className="px-4 py-3">Laba</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.projectFinances.map((project: any) => (
                  <tr key={project.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{project.name}</td>
                    <td className="px-4 py-3 text-slate-700">{project.type}</td>
                    <td className="px-4 py-3 text-slate-700">{formatRupiah(project.contractValue)}</td>
                    <td className="px-4 py-3 text-emerald-600">{formatRupiah(project.paid)}</td>
                    <td className="px-4 py-3 text-amber-600">{formatRupiah(project.remaining)}</td>
                    <td className="px-4 py-3 text-rose-600">{formatRupiah(project.expense)}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{formatRupiah(project.profit)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
