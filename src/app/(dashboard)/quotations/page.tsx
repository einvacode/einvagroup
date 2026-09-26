"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    fetch("/api/quotations")
      .then((res) => res.json())
      .then((data) => {
        setQuotations(data);
        setLoading(false);
      });
  }, []);

  const filteredQuotations = filter === "Semua" 
    ? quotations 
    : quotations.filter(q => q.status === filter.toUpperCase());

  const getStatusBadge = (status: string) => {
    const styles: any = {
      DRAFT: "bg-gray-100 text-gray-800",
      SENT: "bg-blue-100 text-blue-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Surat Penawaran</h1>
        <Link href="/quotations/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          Buat Penawaran
        </Link>
      </div>

      <div className="mb-4">
        <select 
          className="border p-2 rounded" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Semua">Semua</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Terkirim</option>
          <option value="Accepted">Diterima</option>
          <option value="Rejected">Ditolak</option>
        </select>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4">Nomor</th>
              <th className="p-4">Proyek</th>
              <th className="p-4">Klien</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center">Memuat data...</td></tr>
            ) : filteredQuotations.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center">Tidak ada data penawaran.</td></tr>
            ) : (
              filteredQuotations.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{q.number}</td>
                  <td className="p-4">{q.project?.name || '-'}</td>
                  <td className="p-4">{q.client?.name || '-'}</td>
                  <td className="p-4">{formatRupiah(q.total)}</td>
                  <td className="p-4">{getStatusBadge(q.status)}</td>
                  <td className="p-4">{new Date(q.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    <Link href={`/quotations/${q.id}`} className="text-blue-600 hover:underline">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
