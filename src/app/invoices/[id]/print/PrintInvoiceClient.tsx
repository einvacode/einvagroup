'use client';

import { useEffect } from 'react';
import { formatRupiah } from '@/lib/utils';

export default function PrintInvoiceClient({ invoice, company }: { invoice: any; company: any }) {
  useEffect(() => {
    // Automatically trigger print when the page loads
    window.print();
  }, []);

  const taxAmount = invoice.tax > 0 ? ((invoice.subtotal - (invoice.discount || 0)) * invoice.tax / 100) : 0;
  const sisaTagihan = Math.max(0, invoice.total - invoice.paidAmount);

  const statusLabel: Record<string, string> = {
    DRAFT: 'Draft', SENT: 'Terkirim', PARTIAL: 'Dibayar Sebagian', PAID: 'LUNAS', OVERDUE: 'Jatuh Tempo',
  };

  const sep = (char: string, len: number) => char.repeat(len);

  // Combine bank info
  const bankInfo = company?.bankName
    ? `Rekening Pembayaran:\n${company.bankName} - ${company.bankAccount}\na.n. ${company.bankHolder}`
    : null;
    
  const cleanInvoiceNotes = invoice.notes 
    ? invoice.notes.replace(/Pembayaran dapat ditransfer ke Rekening BCA 123456789 a\/n ProjeKerja Inc\.?\n?/gi, '').trim() 
    : '';
    
  const parts = [];
  if (cleanInvoiceNotes) parts.push(cleanInvoiceNotes);
  if (bankInfo) parts.push(bankInfo);
  else if (company?.notes) parts.push(company.notes);
  
  const info = parts.join('\n\n');

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
          font-family: 'Courier New', Courier, monospace;
          font-size: 11pt;
          color: #000;
          padding: 10mm 12mm;
          line-height: 1.4;
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
      `}} />

      <div className="print-container">
        {/* Header separator */}
        <pre style={{ margin: 0, fontFamily: 'inherit' }}>{sep('=', 70)}</pre>

        {/* Company logo + name */}
        <div style={{ textAlign: 'center', margin: '4px 0' }}>
          {company?.logo && (
            <img
              src={company.logo}
              alt="Logo"
              style={{ height: '48px', objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
            />
          )}
          <div style={{ fontWeight: 'bold', fontSize: '14pt', letterSpacing: '2px' }}>
            {company?.name?.toUpperCase() || 'PERUSAHAAN ANDA'}
          </div>
          {company?.address && <div style={{ fontSize: '10pt' }}>{company.address}</div>}
          {(company?.phone || company?.email) && (
            <div style={{ fontSize: '10pt' }}>
              {company?.phone && `Telp: ${company.phone}`}
              {company?.phone && company?.email && '  |  '}
              {company?.email && `Email: ${company.email}`}
            </div>
          )}
        </div>

        <pre style={{ margin: '4px 0', fontFamily: 'inherit' }}>{sep('=', 70)}</pre>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13pt', letterSpacing: '4px', margin: '4px 0' }}>
          INVOICE
        </div>
        <pre style={{ margin: '4px 0', fontFamily: 'inherit' }}>{sep('-', 70)}</pre>

        {/* Invoice meta */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <div>Nomor  : <strong>{invoice.number}</strong></div>
                <div>Tanggal: {new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                <div>Jth Tmp: <strong style={{ color: '#000' }}>{new Date(invoice.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></div>
                <div>Status : <strong>[{statusLabel[invoice.status] || invoice.status}]</strong></div>
              </td>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <div><strong>TAGIHAN KEPADA:</strong></div>
                <div>{invoice.client?.name || '-'}</div>
                {invoice.client?.company && <div>{invoice.client.company}</div>}
                {invoice.client?.address && <div style={{ fontSize: '9pt' }}>{invoice.client.address}</div>}
                {invoice.client?.phone && <div>Telp: {invoice.client.phone}</div>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Proyek */}
        {invoice.project?.name && (
          <div style={{ fontSize: '10pt', marginTop: '4px' }}>
            Proyek  : {invoice.project.name}
          </div>
        )}

        <pre style={{ margin: '6px 0', fontFamily: 'inherit' }}>{sep('=', 70)}</pre>

        {/* Items header */}
        <div style={{ display: 'flex', fontSize: '10pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '2px' }}>
          <span style={{ width: '4%' }}>No</span>
          <span style={{ width: '36%' }}>Deskripsi</span>
          <span style={{ width: '8%', textAlign: 'center' }}>Qty</span>
          <span style={{ width: '8%', textAlign: 'center' }}>Sat</span>
          <span style={{ width: '22%', textAlign: 'right' }}>Harga Sat.</span>
          <span style={{ width: '22%', textAlign: 'right' }}>Jumlah</span>
        </div>

        {/* Items rows */}
        {invoice.items?.map((item: any, idx: number) => (
          <div key={item.id}>
            <div style={{ display: 'flex', fontSize: '10pt', paddingTop: '2px' }}>
              <span style={{ width: '4%' }}>{idx + 1}.</span>
              <span style={{ width: '36%' }}>{item.name}</span>
              <span style={{ width: '8%', textAlign: 'center' }}>{item.qty ?? item.quantity}</span>
              <span style={{ width: '8%', textAlign: 'center' }}>{item.unit}</span>
              <span style={{ width: '22%', textAlign: 'right' }}>{formatRupiah(item.unitPrice)}</span>
              <span style={{ width: '22%', textAlign: 'right' }}>{formatRupiah((item.qty ?? item.quantity) * item.unitPrice)}</span>
            </div>
            {item.description && (
              <div style={{ fontSize: '9pt', paddingLeft: '4%', color: '#333' }}>  ~ {item.description}</div>
            )}
          </div>
        ))}

        <pre style={{ margin: '6px 0', fontFamily: 'inherit' }}>{sep('-', 70)}</pre>

        {/* Totals */}
        <div style={{ textAlign: 'right', fontSize: '10pt' }}>
          <div>Subtotal            : {formatRupiah(invoice.subtotal)}</div>
          {invoice.discount > 0 && <div>Diskon              : -{formatRupiah(invoice.discount)}</div>}
          {invoice.tax > 0 && <div>PPN ({invoice.tax}%)          : {formatRupiah(taxAmount)}</div>}
        </div>

        <pre style={{ margin: '2px 0', fontFamily: 'inherit' }}>{sep('=', 70)}</pre>

        <div style={{ textAlign: 'right', fontSize: '12pt', fontWeight: 'bold' }}>
          GRAND TOTAL         : {formatRupiah(invoice.total)}
        </div>
        <div style={{ textAlign: 'right', fontSize: '10pt' }}>
          Sudah Dibayar       : {formatRupiah(invoice.paidAmount || 0)}
        </div>

        <pre style={{ margin: '2px 0', fontFamily: 'inherit' }}>{sep('-', 70)}</pre>

        <div style={{ textAlign: 'right', fontSize: '12pt', fontWeight: 'bold' }}>
          SISA TAGIHAN        : {formatRupiah(sisaTagihan)}
        </div>

        <pre style={{ margin: '6px 0', fontFamily: 'inherit' }}>{sep('=', 70)}</pre>

        {/* Payment info / notes */}
        {info && (
          <div style={{ fontSize: '9pt', marginBottom: '6px', whiteSpace: 'pre-wrap' }}>
            <strong>Informasi Pembayaran:</strong>{'\n'}
            {info}
          </div>
        )}

        {/* Payment history */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div style={{ fontSize: '9pt', marginBottom: '6px' }}>
            <pre style={{ margin: '2px 0', fontFamily: 'inherit' }}>{sep('-', 70)}</pre>
            <strong>RIWAYAT PEMBAYARAN:</strong>
            {invoice.payments.map((p: any, i: number) => (
              <div key={p.id} style={{ display: 'flex', marginTop: '2px' }}>
                <span style={{ width: '4%' }}>{i + 1}.</span>
                <span style={{ width: '28%' }}>{new Date(p.date).toLocaleDateString('id-ID')}</span>
                <span style={{ width: '20%' }}>{p.method}</span>
                <span style={{ width: '28%', textAlign: 'right' }}>{formatRupiah(p.amount)}</span>
                <span style={{ width: '20%', paddingLeft: '8px', color: '#333' }}>{p.note || ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Signature */}
        <pre style={{ margin: '4px 0', fontFamily: 'inherit' }}>{sep('-', 70)}</pre>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', marginTop: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <div>Hormat Kami,</div>
            <div style={{ marginTop: '40px' }}>___________________</div>
            <div>{company?.name || 'Perusahaan'}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div>Penerima,</div>
            <div style={{ marginTop: '40px' }}>___________________</div>
            <div>{invoice.client?.name || 'Klien'}</div>
          </div>
        </div>

        <pre style={{ margin: '8px 0 4px', fontFamily: 'inherit' }}>{sep('=', 70)}</pre>
        <div style={{ textAlign: 'center', fontSize: '8pt' }}>
          Dicetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {' | '}Terima kasih atas kepercayaan Anda.
        </div>
      </div>
    </>
  );
}
