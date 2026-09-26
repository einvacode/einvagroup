"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [paymentNote, setPaymentNote] = useState("");

  const fetchInvoice = () => {
    fetch(`/api/invoices/${id}`)
      .then(res => res.json())
      .then(data => setInvoice(data));
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setCompanyProfile(data))
      .catch(() => setCompanyProfile(null));
  }, []);

  useEffect(() => {
    if (!paymentDate) {
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [paymentDate]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoiceId: id,
        amount: Number(paymentAmount),
        date: new Date(paymentDate).toISOString(),
        method: paymentMethod,
        note: paymentNote || undefined,
      })
    });

    if (res.ok) {
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentNote("");
      fetchInvoice();
    } else {
      alert("Gagal merekam pembayaran");
    }
  };

  if (!invoice) return <div className="p-6">Memuat detail invoice...</div>;

  const progressPercentage = Math.min(100, Math.round((invoice.paidAmount / invoice.total) * 100)) || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detail Invoice</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200">Cetak PDF</button>
          {invoice.status !== 'PAID' && (
            <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Catat Pembayaran</button>
          )}
        </div>
      </div>

      <div className="bg-white border rounded shadow p-8 mb-6">
        <div className="flex justify-between border-b pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-500 mt-2">Nomor: {invoice.number}</p>
            <p className="text-gray-500">Tanggal: {new Date(invoice.createdAt).toLocaleDateString('id-ID')}</p>
            <p className="text-gray-500 font-medium text-red-500">Jatuh Tempo: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold">{companyProfile?.name || 'ProjeKerja'}</h3>
            <p className="text-gray-600 text-sm">{companyProfile?.address || 'Jl. Contoh Perusahaan No. 123'}</p>
            <p className="text-gray-600 text-sm">{companyProfile?.city || 'Jakarta, Indonesia'}</p>
            {companyProfile?.email && <p className="text-gray-600 text-sm">{companyProfile.email}</p>}
            {companyProfile?.phone && <p className="text-gray-600 text-sm">{companyProfile.phone}</p>}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-gray-700 mb-2">Tagihan Kepada:</h4>
          <p className="font-bold">{invoice.client?.name || 'Klien Tidak Diketahui'}</p>
          <p className="text-gray-600">{invoice.client?.company || ''}</p>
          <p className="text-gray-600">{invoice.client?.address || ''}</p>
        </div>

        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2">No</th>
              <th className="py-2">Deskripsi</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Harga</th>
              <th className="py-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: any, idx: number) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">{idx + 1}</td>
                <td className="py-3">
                  <p className="font-medium">{item.name}</p>
                  {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                </td>
                <td className="py-3 text-center">{item.quantity} {item.unit}</td>
                <td className="py-3 text-right">{formatRupiah(item.unitPrice)}</td>
                <td className="py-3 text-right">{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span> <span>{formatRupiah(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Diskon:</span> <span>-{formatRupiah(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>PPN ({invoice.tax}%):</span>
                <span>{formatRupiah((invoice.subtotal - invoice.discount) * invoice.tax / 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-800">
              <span>Grand Total:</span> <span>{formatRupiah(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium pt-2">
              <span>Uang Muka / Dibayar:</span> <span>{formatRupiah(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-red-600 text-xl pt-2 border-t border-gray-300">
              <span>Sisa Tagihan:</span> <span>{formatRupiah(invoice.total - invoice.paidAmount)}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2">Progress Pembayaran ({progressPercentage}%)</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {(invoice.notes || companyProfile?.notes) && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-700 mb-2">Informasi Pembayaran / Catatan:</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes || companyProfile?.notes}</p>
          </div>
        )}
      </div>

      {invoice.status !== "PAID" && (
        <div className="bg-white border rounded shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Catat Pembayaran Pelanggan</h3>
              <p className="text-sm text-gray-500">Masukkan jumlah yang sudah diterima dari klien</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              Sisa tagihan: {formatRupiah(Math.max(0, invoice.total - invoice.paidAmount))}
            </span>
          </div>

          <form onSubmit={handleRecordPayment} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Bayar (Rp)</label>
              <input
                type="number"
                required
                min={1}
                max={Math.max(0, invoice.total - invoice.paidAmount)}
                value={paymentAmount || ""}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Transfer">Transfer Bank</option>
                <option value="Cash">Tunai</option>
                <option value="Cek">Cek / BG</option>
                <option value="E-Wallet">E-Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <input
                type="text"
                value={paymentNote}
                onChange={e => setPaymentNote(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Contoh: DP tahap 1"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Simpan Pembayaran
              </button>
            </div>
          </form>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Catat Pembayaran</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block mb-1">Jumlah (Rp)</label>
                <input type="number" required className="w-full border p-2 rounded" value={paymentAmount || ""} onChange={e => setPaymentAmount(Number(e.target.value))} max={Math.max(0, invoice.total - invoice.paidAmount)} />
              </div>
              <div>
                <label className="block mb-1">Tanggal</label>
                <input type="date" required className="w-full border p-2 rounded" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              </div>
              <div>
                <label className="block mb-1">Metode</label>
                <select className="w-full border p-2 rounded" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="Cash">Tunai</option>
                  <option value="Cek">Cek</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Catatan</label>
                <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className="w-full border p-2 rounded" placeholder="Contoh: DP tahap 1" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Batal</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
