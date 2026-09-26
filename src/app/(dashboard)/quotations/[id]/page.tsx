"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function QuotationDetailPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/quotations/${id}`)
      .then(res => res.json())
      .then(data => setQuotation(data));
  }, [id]);

  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setCompanyProfile(data))
      .catch(() => setCompanyProfile(null));
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!quotation) return <div className="p-6">Memuat detail penawaran...</div>;

  const notesText = typeof quotation.notes === 'string' ? quotation.notes : '';
  const extractedSubject = notesText.match(/Perihal:\s*(.*)/i)?.[1]?.trim() || quotation.project?.name || 'Pekerjaan';
  const sanitizedBody = notesText
    .replace(/^Perihal:\s*.*$/im, '')
    .replace(/^Dengan\s+hormat,?\s*/i, '')
    .replace(/\bDemikian\s+surat\s+penawaran\s+ini\s+kami\s+sampaikan\.?\s*/i, '')
    .replace(/\bAtas\s+perhatian\s+dan\s+kerja\s+sama\s+yang\s+baik,?\s*kami\s+ucapkan\s+terima\s+kasih\.?\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*\n+|\n+\s*$/g, '')
    .trim();
  const letterBody = sanitizedBody || `Bersama ini kami sampaikan penawaran untuk pekerjaan ${quotation.project?.name || 'proyek'} dengan rincian sebagaimana terlampir. Kami berharap dapat melanjutkan kerja sama dan siap membantu sesuai kebutuhan Anda.`;

  return (
    <div className="p-6 max-w-4xl mx-auto print:p-0 print:max-w-none">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Detail Penawaran</h1>
        <div className="space-x-2">
          <button type="button" onClick={handlePrint} className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200">Cetak PDF</button>
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Buat Invoice</button>
        </div>
      </div>

      <div className="bg-white border rounded shadow p-8 text-sm text-gray-700 print:border-0 print:shadow-none print:rounded-none print:p-0" style={{ minHeight: '1123px' }}>
        <div className="flex justify-between border-b border-gray-200 pb-6 mb-6 print:pb-4 print:mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Surat Penawaran</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 print:text-2xl">PENAWARAN</h2>
            <p className="text-gray-600 mt-3">Nomor: {quotation.number}</p>
            <p className="text-gray-600">Tanggal: {new Date(quotation.createdAt).toLocaleDateString('id-ID')}</p>
            <p className="text-gray-600">Berlaku Hingga: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('id-ID') : '-'}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-gray-900 text-lg">{companyProfile?.name || 'PROJEKERJA'}</h3>
            <p className="text-gray-600 text-sm">{companyProfile?.address || 'Jl. Contoh Perusahaan No. 123'}</p>
            <p className="text-gray-600 text-sm">{companyProfile?.city || 'Jakarta, Indonesia'}</p>
            {companyProfile?.email && <p className="text-gray-600 text-sm">{companyProfile.email}</p>}
            {companyProfile?.phone && <p className="text-gray-600 text-sm">{companyProfile.phone}</p>}
          </div>
        </div>

        <div className="mb-8 leading-7 print:mb-6">
          <p className="font-semibold text-gray-800">Perihal: {extractedSubject}</p>
          <p className="mt-4">Kepada Yth.</p>
          <p className="font-bold text-gray-900">{quotation.client?.name || 'Klien Tidak Diketahui'}</p>
          <p className="text-gray-600">{quotation.client?.company || ''}</p>
          <p className="text-gray-600">{quotation.client?.address || ''}</p>
        </div>

        <div className="mb-8 leading-7 text-gray-700 print:mb-6">
          <p>Dengan hormat,</p>
          <p className="mt-3 whitespace-pre-wrap">{letterBody}</p>
        </div>

        <div className="mb-8 print:mb-6">
          <p className="font-bold text-gray-900 mb-3">Rincian Penawaran</p>
          <table className="w-full text-left border-collapse border border-gray-300 text-[12px]">
            <thead>
              <tr className="bg-slate-100 border-b border-gray-300">
                <th className="py-3 px-3 text-left font-semibold">No</th>
                <th className="py-3 px-3 text-left font-semibold">Uraian</th>
                <th className="py-3 px-3 text-center font-semibold">Qty</th>
                <th className="py-3 px-3 text-right font-semibold">Harga</th>
                <th className="py-3 px-3 text-right font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="border-b border-gray-300 align-top">
                  <td className="py-3 px-3">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.description && <p className="text-[11px] text-gray-500 mt-1">{item.description}</p>}
                  </td>
                  <td className="py-3 px-3 text-center">{Number(item.qty ?? item.quantity ?? 0)} {item.unit}</td>
                  <td className="py-3 px-3 text-right">{formatRupiah(Number(item.unitPrice ?? 0))}</td>
                  <td className="py-3 px-3 text-right">{formatRupiah(Number(item.total ?? (Number(item.qty ?? item.quantity ?? 0) * Number(item.unitPrice ?? 0))) )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8 print:mb-6">
          <div className="w-72 space-y-2 text-[12px]">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span> <span>{formatRupiah(quotation.subtotal)}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon</span> <span>-{formatRupiah(quotation.discount)}</span>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>PPN ({quotation.tax}%)</span>
                <span>{formatRupiah((quotation.subtotal - quotation.discount) * quotation.tax / 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-400 text-gray-900">
              <span>Total</span> <span>{formatRupiah(quotation.total)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-gray-700 leading-7 print:pt-5">
          <p>Demikian surat penawaran ini kami sampaikan. Kami sangat menghargai kesempatan untuk bekerja sama dan siap menjawab segala pertanyaan serta melakukan penyesuaian jika diperlukan.</p>
          <p className="mt-4">Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.</p>
        </div>

        <div className="mt-12 flex justify-end print:mt-8">
          <div className="text-right">
            <p>Hormat kami,</p>
            <div className="mt-16">
              <p className="font-bold text-gray-900">{companyProfile?.name || 'PROJEKERJA'}</p>
              <p className="text-gray-600 text-sm">{companyProfile?.directorName || 'Direktur Utama'}</p>
              <p className="text-gray-600 text-sm">{companyProfile?.bankHolder || 'PT. ProjeKerja Indonesia'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
