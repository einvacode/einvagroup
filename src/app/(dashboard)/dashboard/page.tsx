'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FolderKanban,
  Plus,
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

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#64748b'];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data dashboard');
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeProjects = stats?.activeProjectsCount ?? 0;
  const completedProjects = stats?.completedProjectsCount ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalUnpaid = stats?.totalUnpaidAmount ?? 0;
  const unpaidCount = stats?.unpaidInvoicesCount ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? [];
  const projectDistribution = stats?.projectDistribution ?? [];
  const recentProjects = stats?.recentProjects ?? [];
  const activities = stats?.activities ?? [];

  return (
    <div className="space-y-6">
      {/* Banner Ringkasan */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-200">Overview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Ringkasan Operasional</h1>
            <p className="text-xs text-slate-400 mt-1">Data operasional, keuangan, dan proyek aktif Einva Group secara realtime.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 min-w-32">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Proyek aktif</div>
              <div className="mt-2 text-2xl font-bold">
                {loading ? '...' : activeProjects}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 min-w-32">
              <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">Proyek Selesai</div>
              <div className="mt-2 text-2xl font-bold text-emerald-200">
                {loading ? '...' : completedProjects}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 4 Kartu Metrik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Total Proyek Aktif',
            value: loading ? '...' : `${activeProjects}`,
            sub: activeProjects > 0 ? `${activeProjects} sedang dikerjakan` : 'Belum ada proyek berjalan',
            tone: 'blue',
            icon: FolderKanban,
          },
          {
            title: 'Total Pendapatan Masuk',
            value: loading ? '...' : formatRupiah(totalRevenue),
            sub: totalRevenue > 0 ? 'Dari pembayaran invoice klien' : 'Belum ada pemasukan tercatat',
            tone: 'emerald',
            icon: CircleDollarSign,
          },
          {
            title: 'Invoice Belum Dibayar',
            value: loading ? '...' : formatRupiah(totalUnpaid),
            sub: unpaidCount > 0 ? `${unpaidCount} invoice tertunda` : 'Semua invoice lunas',
            tone: 'amber',
            icon: BriefcaseBusiness,
          },
          {
            title: 'Proyek Telah Selesai',
            value: loading ? '...' : `${completedProjects}`,
            sub: completedProjects > 0 ? 'Pengerjaan selesai 100%' : 'Belum ada proyek selesai',
            tone: 'violet',
            icon: BadgeCheck,
          },
        ].map(({ title, value, sub, tone, icon: Icon }) => (
          <div key={title} className="card-surface rounded-2xl p-5 shadow-xs border border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  tone === 'blue'
                    ? 'bg-blue-50 text-blue-600'
                    : tone === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600'
                    : tone === 'amber'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-violet-50 text-violet-600'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Grafik */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Grafik Pendapatan */}
        <div className="card-surface rounded-2xl p-6 shadow-xs border border-slate-200 bg-white">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Pendapatan Bulanan</h3>
              <p className="text-xs text-slate-500">Arus kas pemasukan per bulan</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <TrendingUp className="h-3.5 w-3.5" />
              Realtime
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => (value >= 1000000 ? `Rp ${value / 1000000}Jt` : `Rp ${value}`)}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 12px 24px rgba(15,23,42,0.08)' }}
                  formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Pendapatan']}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribusi Proyek */}
        <div className="card-surface rounded-2xl p-6 shadow-xs border border-slate-200 bg-white">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Distribusi Bidang Proyek</h3>
              <p className="text-xs text-slate-500">Berdasarkan spesialisasi layanan</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <BarChart3 className="h-3.5 w-3.5" />
              Tipe Layanan
            </div>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {projectDistribution.every((p: any) => p.count === 0) ? (
              <div className="text-center p-6 text-slate-400">
                <FolderKanban className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum Ada Proyek</p>
                <p className="text-xs text-slate-400 mt-1">Diagram akan muncul saat Anda menambahkan proyek baru.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectDistribution} cx="50%" cy="50%" innerRadius={56} outerRadius={86} paddingAngle={5} dataKey="value">
                    {projectDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any, item: any) => [`${item.payload.count || 0} Proyek (${value}%)`, name]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid Tabel Proyek & Aktivitas */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        {/* Proyek Terbaru */}
        <div className="card-surface overflow-hidden rounded-2xl shadow-xs border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Proyek Terbaru</h3>
              <p className="text-xs text-slate-500">Daftar pengerjaan proyek mutakhir</p>
            </div>
            <Link href="/projects" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
              Lihat semua &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentProjects.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FolderKanban className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Belum Ada Data Proyek</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Database Anda saat ini bersih. Anda dapat membuat proyek kerja baru untuk klien Anda sekarang.
                </p>
                <Link
                  href="/projects/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Proyek Baru
                </Link>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Proyek</th>
                    <th className="px-6 py-3.5">Klien</th>
                    <th className="px-6 py-3.5">Progress</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {recentProjects.map((project: any) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <Link href={`/projects/${project.id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition">
                          {project.name}
                        </Link>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {project.type} • {project.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{project.client}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                project.progress === 100 ? 'bg-emerald-500' : project.progress > 0 ? 'bg-blue-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            project.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : project.status === 'Berjalan'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Aktivitas Terkini */}
        <div className="card-surface rounded-2xl p-6 shadow-xs border border-slate-200 bg-white">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terkini</h3>
              <p className="text-xs text-slate-500">Riwayat transaksi & pekerjaan</p>
            </div>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CircleDollarSign className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum Ada Aktivitas</p>
                <p className="text-xs text-slate-400 mt-1">Aktivitas pembayaran dan progress proyek akan muncul di sini secara otomatis.</p>
              </div>
            ) : (
              activities.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      item.tone === 'emerald'
                        ? 'bg-emerald-100 text-emerald-600'
                        : item.tone === 'blue'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-violet-100 text-violet-600'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">{item.title}</div>
                    <div className="mt-0.5 text-xs text-slate-600">{item.desc}</div>
                    <div className="mt-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
