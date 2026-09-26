'use client';

import { useEffect, useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, CreditCard } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Transfer');
  const [paymentNote, setPaymentNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInvoice = () => {
    fetch(`/api/invoices/${id}`)
      .then(res => res.json())
      .then(data => setInvoice(data));
  };

  useEffect(() => { fetchInvoice(); }, [id]);
  useEffect(() => {
    fetch('/api/company')
      .then(res => res.ok ? res.json() : null)
      .then(data => setCompanyProfile(data))
      .catch(() => setCompanyProfile(null));
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: id,
        amount: Number(paymentAmount),
        date: new Date(paymentDate).toISOString(),
        method: paymentMethod,
        note: paymentNote || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentNote('');
      fetchInvoice();
    } else {
      alert('Gagal merekam pembayaran');
    }
  };

  if (!invoice) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500" />
    </div>
  );

  const progressPercentage = Math.min(100, Math.round((invoice.paidAmount / invoice.total) * 100)) || 0;
  const sisaTagihan = Math.max(0, invoice.total - invoice.paidAmount);
  const taxAmount = invoice.tax > 0 ? ((invoice.subtotal - (invoice.discount || 0)) * invoice.tax / 100) : 0;

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    SENT: 'bg-blue-100 text-blue-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };
  const statusLabel: Record<string, string> = {
    DRAFT: 'Draft', SENT: 'Terkirim', PARTIAL: 'Dibayar Sebagian', PAID: 'LUNAS', OVERDUE: 'Jatuh Tempo',
  };

  return (
    <>
      {/* ===================== SCREEN UI ===================== */}
      <div className="no-print max-w-4xl mx-auto space-y-6 p-4">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[invoice.status] || 'bg-slate-100 text-slate-700'}`}>
              {statusLabel[invoice.status] || invoice.status}
            </span>
            <button
              onClick={() => window.open(`/invoices/${id}/print`, '_blank')}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium"
            >
              <Printer className="h-4 w-4" /> Cetak / PDF
            </button>
            {invoice.status !== 'PAID' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium"
              >
                <CreditCard className="h-4 w-4" /> Catat Pembayaran
              </button>
            )}
          </div>
        </div>

        {/* Invoice preview card (screen only - modern style) */}
        <div className="bg-white border rounded-2xl shadow-sm p-8">
          {/* Top header */}
          <div className="flex justify-between border-b-2 border-slate-800 pb-6 mb-6">
            <div>
              {companyProfile?.logo && (
                <img src={companyProfile.logo} alt="Logo" className="h-14 mb-3 object-contain" />
              )}
              <h1 className="text-4xl font-black tracking-tight text-slate-900">INVOICE</h1>
              <p className="text-slate-500 mt-1 text-sm">No: <span className="font-bold text-slate-800">{invoice.number}</span></p>
              <p className="text-slate-500 text-sm">Tgl: {new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-red-600 text-sm font-medium">Jatuh Tempo: {new Date(invoice.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900 text-lg">{companyProfile?.name || 'Perusahaan Anda'}</p>
              {companyProfile?.address && <p className="text-slate-500 text-sm mt-1 max-w-[200px] ml-auto">{companyProfile.address}</p>}
              {companyProfile?.phone && <p className="text-slate-500 text-sm">{companyProfile.phone}</p>}
              {companyProfile?.email && <p className="text-slate-500 text-sm">{companyProfile.email}</p>}
            </div>
          </div>

          {/* Bill to */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Tagihan Kepada</p>
            <p className="font-bold text-slate-900">{invoice.client?.name || '-'}</p>
            {invoice.client?.company && <p className="text-slate-500 text-sm">{invoice.client.company}</p>}
            {invoice.client?.address && <p className="text-slate-500 text-sm">{invoice.client.address}</p>}
            {invoice.client?.phone && <p className="text-slate-500 text-sm">{invoice.client.phone}</p>}
          </div>

          {/* Items table */}
          <table className="w-full text-sm mb-6 border-collapse">
            <thead>
              <tr className="border-y-2 border-slate-800 text-slate-700 text-xs uppercase tracking-wider">
                <th className="py-2 text-left w-6">No</th>
                <th className="py-2 text-left">Deskripsi Pekerjaan</th>
                <th className="py-2 text-center w-16">Qty</th>
                <th className="py-2 text-center w-16">Sat</th>
                <th className="py-2 text-right w-32">Harga Satuan</th>
                <th className="py-2 text-right w-32">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-2.5 text-slate-500">{idx + 1}</td>
                  <td className="py-2.5">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.description && <p className="text-slate-400 text-xs">{item.description}</p>}
                  </td>
                  <td className="py-2.5 text-center text-slate-700">{item.qty ?? item.quantity}</td>
                  <td className="py-2.5 text-center text-slate-500">{item.unit}</td>
                  <td className="py-2.5 text-right text-slate-700">{formatRupiah(item.unitPrice)}</td>
                  <td className="py-2.5 text-right font-medium text-slate-900">{formatRupiah((item.qty ?? item.quantity) * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span>{formatRupiah(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Diskon</span><span>-{formatRupiah(invoice.discount)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>PPN ({invoice.tax}%)</span><span>{formatRupiah(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t-2 border-slate-800 text-slate-900">
                <span>GRAND TOTAL</span><span>{formatRupiah(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium pt-1 text-xs">
                <span>Sudah Dibayar</span><span>{formatRupiah(invoice.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-black text-base pt-1 border-t border-slate-200">
                <span>SISA TAGIHAN</span><span>{formatRupiah(sisaTagihan)}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress Pembayaran</span><span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          {/* Notes & Bank Info */}
          {(() => {
            const bankInfo = companyProfile?.bankName
              ? `Rekening Pembayaran:\n${companyProfile.bankName} - ${companyProfile.bankAccount}\na.n. ${companyProfile.bankHolder}`
              : null;
            
            const cleanInvoiceNotes = invoice.notes 
              ? invoice.notes.replace(/Pembayaran dapat ditransfer ke Rekening BCA 123456789 a\/n ProjeKerja Inc\.?\n?/gi, '').trim() 
              : '';
              
            const parts = [];
            if (cleanInvoiceNotes) parts.push(cleanInvoiceNotes);
            if (bankInfo) parts.push(bankInfo);
            else if (companyProfile?.notes) parts.push(companyProfile.notes);
            
            const info = parts.join('\n\n');
            if (!info) return null;
            
            return (
              <div className="border-t pt-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Informasi Pembayaran:</p>
                <p className="whitespace-pre-wrap">{info}</p>
              </div>
            );
          })()}

          {/* Payment history */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="border-t mt-4 pt-4">
              <p className="font-semibold text-slate-800 mb-2 text-sm">Riwayat Pembayaran:</p>
              <table className="w-full text-xs text-slate-600">
                <thead><tr className="border-b text-slate-400">
                  <th className="py-1 text-left">Tanggal</th>
                  <th className="py-1 text-left">Metode</th>
                  <th className="py-1 text-right">Jumlah</th>
                  <th className="py-1 text-left pl-4">Catatan</th>
                </tr></thead>
                <tbody>
                  {invoice.payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-slate-50">
                      <td className="py-1">{new Date(p.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-1">{p.method}</td>
                      <td className="py-1 text-right text-emerald-600 font-medium">{formatRupiah(p.amount)}</td>
                      <td className="py-1 pl-4 text-slate-400">{p.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>



      {/* ===================== PAYMENT MODAL ===================== */}
      {showPaymentModal && (
        <div className="no-print fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-1">Catat Pembayaran</h2>
            <p className="text-sm text-slate-500 mb-4">
              Sisa tagihan: <span className="font-bold text-red-600">{formatRupiah(sisaTagihan)}</span>
            </p>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Bayar (Rp)</label>
                <input
                  type="number" required min={1} max={sisaTagihan}
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={String(sisaTagihan)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pembayaran</label>
                <input
                  type="date" required value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Transfer">Transfer Bank</option>
                  <option value="Cash">Tunai</option>
                  <option value="Cek">Cek / BG</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan</label>
                <input
                  type="text" value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: DP Tahap 1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border rounded-lg py-2 text-sm hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60">
                  {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
