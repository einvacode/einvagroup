'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bell,
  CalendarDays,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Proyek', href: '/projects', icon: FolderKanban },
  { name: 'Klien', href: '/clients', icon: Users },
  { name: 'Pengguna', href: '/users', icon: Users },
  { name: 'Penawaran', href: '/quotations', icon: FileText },
  { name: 'Invoice', href: '/invoices', icon: ReceiptText },
  { name: 'Jadwal', href: '/schedules', icon: CalendarDays },
  { name: 'Keuangan', href: '/finance', icon: Wallet },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/company');
        if (!res.ok) return;
        const data = await res.json();
        setCompanyProfile(data);
      } catch (error) {
        console.error('Failed to fetch company profile', error);
      }
    };

    fetchProfile();
  }, []);

  const currentPageName = navigation.find((item) => pathname?.startsWith(item.href))?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-slate-950 text-slate-100 shadow-2xl transition-transform duration-200 ease-in-out lg:static lg:flex-shrink-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-800 shadow-lg shadow-blue-500/20">
              {companyProfile?.logo ? (
                <img src={companyProfile.logo} alt="Logo perusahaan" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold text-white">
                  {companyProfile?.name?.[0]?.toUpperCase() || 'E'}
                </div>
              )}
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">{companyProfile?.name || 'Einva Group'}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Ops team</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-900/80 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 font-semibold text-white">
              {session?.user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{session?.user?.name || 'Admin'}</p>
              <p className="truncate text-xs text-slate-400">{session?.user?.email || 'admin@projekerja.id'}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{currentPageName}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 sm:flex">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari..."
                  className="w-52 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
