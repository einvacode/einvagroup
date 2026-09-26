"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { Trash2, Eye, RefreshCw } from "lucide-react";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");

  const fetchQuotations = async () => {
    setLoading(true);
    const res = await fetch("/api/quotations");
    const data = await res.json();
    setQuotations(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotations(); }, []);

  const filteredQuotations = filter === "Semua"
    ? quotations
    : quotations.filter(q => q.status === filter.toUpperCase());

  const statusOptions = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"];
  const statusBadgeClass: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    SENT: "bg-blue-100 text-blue-700",
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  const statusLabel: Record<string, string> = {
    DRAFT: "Draft", SENT: "Terkirim", ACCEPTED: "Diterima", REJECTED: "Ditolak",
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Hapus Penawaran ${number}? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setQuotations(prev => prev.filter(q => q.id !== id));
    } else {
      alert("Gagal menghapus penawaran.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: updated.status } : q));
    } else {
      alert("Gagal mengubah status penawaran.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 p-6 text-white shadow-xl shadow-emerald-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Sales</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Surat Penawaran</h1>
          </div>
          <Link href="/quotations/new" className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 shadow">
            + Buat Penawaran
          </Link>
        </div>
      </div>

      <div className="card-surface rounded-2xl p-4 shadow-sm">
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Semua">Semua Status</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Terkirim</option>
          <option value="Accepted">Diterima</option>
          <option value="Rejected">Ditolak</option>
        </select>
      </div>

      <div className="card-surface overflow-hidden rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Nomor</th>
                <th className="px-6 py-4">Proyek</th>
                <th className="px-6 py-4">Klien</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Memuat data...</td></tr>
              ) : filteredQuotations.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Tidak ada data penawaran.</td></tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-semibold text-slate-900">{q.number}</td>
                    <td className="px-6 py-4 text-slate-700">{q.project?.name || '-'}</td>
                    <td className="px-6 py-4 text-slate-700">{q.client?.name || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatRupiah(q.total)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value)}
                        className={`rounded-full px-2 py-1 text-xs font-semibold border-0 outline-none cursor-pointer ${statusBadgeClass[q.status] || 'bg-slate-100 text-slate-700'}`}
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{statusLabel[s] || s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{new Date(q.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/quotations/${q.id}`}>
                          <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            <Eye className="h-3.5 w-3.5" /> Detail
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(q.id, q.number)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
