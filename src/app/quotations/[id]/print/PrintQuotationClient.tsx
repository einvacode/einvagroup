'use client';

import { useEffect } from 'react';
import { formatRupiah } from '@/lib/utils';

export default function PrintQuotationClient({ quotation, company }: { quotation: any; company: any }) {
  useEffect(() => {
    // Automatically trigger print when the page loads
    window.print();
  }, []);

  const taxAmount = quotation.tax > 0 ? ((quotation.subtotal - (quotation.discount || 0)) * quotation.tax / 100) : 0;
  
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { margin: 0; size: auto; }
        body { 
          margin: 0; 
          padding: 0; 
          background: white; 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact; 
        }
        .print-container {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          color: #000;
          padding: 15mm 20mm;
          line-height: 1.5;
          max-width: 210mm; /* A4 width approx */
          margin: 0 auto;
        }
        /* Hide UI elements injected by browsers or extensions if any */
        @media screen {
           body { background: #f1f5f9; }
           .print-container {
               background: white;
               margin-top: 20px;
               margin-bottom: 20px;
               box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
           }
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt; }
        th, td { border: 1px solid #000; padding: 6px; }
        th { background-color: #f3f4f6; text-align: center; }
      `}} />

      <div className="print-container">
        {/* Header: Company Logo & Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            {company?.logo && (
              <img src={company.logo} alt="Logo" style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} />
            )}
            <div style={{ fontSize: '10pt', fontWeight: 'bold', letterSpacing: '2px', color: '#64748b' }}>SURAT PENAWARAN</div>
            <h1 style={{ margin: '5px 0', fontSize: '24px' }}>PENAWARAN</h1>
            <div style={{ fontSize: '10pt' }}>Nomor: {quotation.number}</div>
            <div style={{ fontSize: '10pt' }}>Tanggal: {new Date(quotation.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <div style={{ fontSize: '10pt' }}>Berlaku Hingga: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</div>
          </div>
          <div className="text-right">
            <h2 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{company?.name || 'PERUSAHAAN ANDA'}</h2>
            <div style={{ fontSize: '10pt' }}>{company?.address || ''}</div>
            <div style={{ fontSize: '10pt' }}>{company?.city || ''}</div>
            {company?.phone && <div style={{ fontSize: '10pt' }}>Telp: {company.phone}</div>}
            {company?.email && <div style={{ fontSize: '10pt' }}>Email: {company.email}</div>}
          </div>
        </div>

        {/* Recipient */}
        <div style={{ marginBottom: '20px' }}>
          <div className="font-bold">Perihal: {extractedSubject}</div>
          <div style={{ marginTop: '15px' }}>Kepada Yth.</div>
          <div className="font-bold">{quotation.client?.name || 'Klien Tidak Diketahui'}</div>
          <div>{quotation.client?.company || ''}</div>
          <div>{quotation.client?.address || ''}</div>
        </div>

        {/* Letter Body */}
        <div style={{ marginBottom: '20px' }}>
          <div>Dengan hormat,</div>
          <div style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>{letterBody}</div>
        </div>

        {/* Items Table */}
        <div className="font-bold">Rincian Penawaran</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>No</th>
              <th style={{ width: '40%', textAlign: 'left' }}>Uraian Pekerjaan</th>
              <th style={{ width: '10%' }}>Qty</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Harga Satuan</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.map((item: any, idx: number) => {
              const qty = Number(item.qty ?? item.quantity ?? 0);
              const price = Number(item.unitPrice ?? 0);
              const total = Number(item.total ?? (qty * price));
              return (
                <tr key={item.id}>
                  <td className="text-center">{idx + 1}</td>
                  <td>
                    <div className="font-bold">{item.name}</div>
                    {item.description && <div style={{ fontSize: '9pt', color: '#4b5563', marginTop: '4px' }}>{item.description}</div>}
                  </td>
                  <td className="text-center">{qty} {item.unit}</td>
                  <td className="text-right">{formatRupiah(price)}</td>
                  <td className="text-right font-bold">{formatRupiah(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Subtotal</span>
              <span>{formatRupiah(quotation.subtotal)}</span>
            </div>
            {quotation.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#dc2626' }}>
                <span>Diskon</span>
                <span>-{formatRupiah(quotation.discount)}</span>
              </div>
            )}
            {quotation.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>PPN ({quotation.tax}%)</span>
                <span>{formatRupiah(taxAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '12pt' }}>
              <span>Total</span>
              <span>{formatRupiah(quotation.total)}</span>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
          <p>Demikian surat penawaran ini kami sampaikan. Kami sangat menghargai kesempatan untuk bekerja sama dan siap menjawab segala pertanyaan serta melakukan penyesuaian jika diperlukan.</p>
          <p style={{ marginTop: '10px' }}>Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.</p>
        </div>

        {/* Signature */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
          <div className="text-center" style={{ width: '250px' }}>
            <div style={{ marginBottom: '80px' }}>Hormat kami,</div>
            <div className="font-bold">{company?.name || 'Perusahaan'}</div>
            <div style={{ color: '#4b5563', fontSize: '10pt' }}>{company?.directorName || 'Direktur Utama'}</div>
            <div style={{ color: '#4b5563', fontSize: '10pt' }}>{company?.bankHolder || ''}</div>
          </div>
        </div>
      </div>
    </>
  );
}
