'use client';

import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FolderKanban,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const monthlyRevenue = [
  { name: 'Jan', total: 15000000 },
  { name: 'Feb', total: 22000000 },
  { name: 'Mar', total: 18000000 },
  { name: 'Apr', total: 35000000 },
  { name: 'Mei', total: 28000000 },
  { name: 'Jun', total: 42000000 },
];

const projectDistribution = [
  { name: 'CCTV', value: 35 },
  { name: 'Jaringan', value: 25 },
  { name: 'Listrik', value: 20 },
  { name: 'Lainnya', value: 20 },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#64748b'];

const recentProjects = [
  { id: 'PRJ-001', name: 'Instalasi CCTV Mall Central', client: 'PT. Maju Bersama', type: 'CCTV', progress: 75, status: 'Berjalan', date: '15 Sep 2026' },
  { id: 'PRJ-002', name: 'Setup Jaringan Kantor Cabang', client: 'Bank Nasional', type: 'Jaringan', progress: 100, status: 'Selesai', date: '10 Sep 2026' },
  { id: 'PRJ-003', name: 'Perbaikan Panel Listrik', client: 'Bpk. Hendra', type: 'Listrik', progress: 20, status: 'Berjalan', date: '14 Sep 2026' },
  { id: 'PRJ-004', name: 'Maintenance AC Server', client: 'PT. Teknologi Baru', type: 'Lainnya', progress: 0, status: 'Menunggu', date: '16 Sep 2026' },
  { id: 'PRJ-005', name: 'Upgrade Server', client: 'CV. Sejahtera', type: 'Jaringan', progress: 50, status: 'Berjalan', date: '12 Sep 2026' },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-200">Overview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Ringkasan Operasional</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Proyek aktif</div>
              <div className="mt-2 text-2xl font-bold">12</div>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">Target bulan</div>
              <div className="mt-2 text-2xl font-bold text-emerald-200">92%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Total Proyek Aktif', value: '12', sub: '+2 dari bulan lalu', tone: 'blue', icon: FolderKanban },
          { title: 'Total Pendapatan', value: formatRupiah(160000000), sub: '+15% dari bulan lalu', tone: 'emerald', icon: CircleDollarSign },
          { title: 'Invoice Belum Dibayar', value: formatRupiah(35000000), sub: '4 invoice tertunda', tone: 'amber', icon: BriefcaseBusiness },
          { title: 'Proyek Selesai', value: '48', sub: 'Sepanjang tahun ini', tone: 'violet', icon: BadgeCheck },
        ].map(({ title, value, sub, tone, icon: Icon }) => (
          <div key={title} className="card-surface rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                tone === 'blue' ? 'bg-blue-50 text-blue-600' :
                tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Pendapatan Bulanan</h3>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              <TrendingUp className="h-3.5 w-3.5" />
              +18.2%
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `Rp ${value / 1000000}M`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 12px 24px rgba(15,23,42,0.08)' }}
                  formatter={(value: number) => [formatRupiah(value), 'Pendapatan']}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Distribusi Proyek</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <BarChart3 className="h-3.5 w-3.5" />
              Berdasarkan tipe
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectDistribution} cx="50%" cy="50%" innerRadius={56} outerRadius={86} paddingAngle={5} dataKey="value">
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, 'Persentase']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="card-surface overflow-hidden rounded-2xl shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Proyek Terbaru</h3>
              <p className="text-sm text-slate-500">Aktivitas paling mutakhir</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Lihat semua</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Proyek</th>
                  <th className="px-6 py-4">Klien</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{project.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{project.type} • {project.date}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{project.client}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : project.progress > 0 ? 'bg-blue-500' : 'bg-slate-400'}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        project.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                        project.status === 'Berjalan' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terkini</h3>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-5">
            {[
              { icon: '💰', title: 'Pembayaran Diterima', desc: 'Invoice INV-2026-003 telah dibayar lunas.', time: 'Hari ini, 10:30 WIB', tone: 'emerald' },
              { icon: '📈', title: 'Update Progress', desc: 'Proyek CCTV Mall Central diupdate ke 75%.', time: 'Kemarin, 15:45 WIB', tone: 'blue' },
              { icon: '📝', title: 'Penawaran Dikirim', desc: 'SPH untuk PT. Jaya Utama telah dikirim ke klien.', time: '2 hari lalu', tone: 'violet' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  item.tone === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                  item.tone === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                }`}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.desc}</div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-slate-400">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
