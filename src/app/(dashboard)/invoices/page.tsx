"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { Trash2, Eye, RefreshCw } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await fetch("/api/invoices");
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filteredInvoices = filter === "Semua"
    ? invoices
    : invoices.filter(inv => inv.status === filter.toUpperCase());

  const statusOptions = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE"];
  const statusBadgeClass: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    SENT: "bg-blue-100 text-blue-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    PAID: "bg-emerald-100 text-emerald-700",
    OVERDUE: "bg-red-100 text-red-700",
  };
  const statusLabel: Record<string, string> = {
    DRAFT: "Draft", SENT: "Terkirim", PARTIAL: "Sebagian", PAID: "Lunas", OVERDUE: "Jatuh Tempo",
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Hapus Invoice ${number}? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } else {
      alert("Gagal menghapus invoice. Mungkin ada pembayaran yang terkait.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: updated.status } : inv));
    } else {
      alert("Gagal mengubah status invoice.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-xl shadow-orange-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-orange-100">Billing</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Invoice</h1>
          </div>
          <Link href="/invoices/new" className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 shadow">
            + Buat Invoice
          </Link>
        </div>
      </div>

      <div className="card-surface rounded-2xl p-4 shadow-sm">
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Semua">Semua</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Terkirim</option>
          <option value="Partial">Dibayar Sebagian</option>
          <option value="Paid">Lunas</option>
          <option value="Overdue">Jatuh Tempo</option>
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
                <th className="px-6 py-4 text-right">Dibayar</th>
                <th className="px-6 py-4 text-right">Sisa</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Jatuh Tempo</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-500">Memuat data...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-500">Tidak ada data invoice.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-semibold text-slate-900">{inv.number}</td>
                    <td className="px-6 py-4 text-slate-700">{inv.project?.name || '-'}</td>
                    <td className="px-6 py-4 text-slate-700">{inv.client?.name || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatRupiah(inv.total)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600">{formatRupiah(inv.paidAmount || 0)}</td>
                    <td className="px-6 py-4 text-right text-rose-600">{formatRupiah(inv.total - (inv.paidAmount || 0))}</td>
                    <td className="px-6 py-4">
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                        className={`rounded-full px-2 py-1 text-xs font-semibold border-0 outline-none cursor-pointer ${statusBadgeClass[inv.status] || 'bg-slate-100 text-slate-700'}`}
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{statusLabel[s] || s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{new Date(inv.dueDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/invoices/${inv.id}`}>
                          <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            <Eye className="h-3.5 w-3.5" /> Detail
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(inv.id, inv.number)}
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
