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
        @page { 
          margin: 15mm; /* Allow browser to handle physical margins safely */
          size: A4 portrait; 
        }
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
          line-height: 1.4;
          width: 100%;
          max-width: 190mm; /* A4 width minus margins */
          margin: 0 auto;
        }
        /* Hide UI elements injected by browsers or extensions if any */
        @media screen {
           body { background: #f1f5f9; padding: 20px 0; }
           .print-container {
               background: white;
               padding: 15mm;
               box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
           }
        }
        
        /* Dot matrix separator classes */
        .sep-double { border-top: 3px double #000; margin: 8px 0; }
        .sep-single { border-top: 1px dashed #000; margin: 8px 0; }
        .sep-solid { border-top: 1px solid #000; margin: 8px 0; }
      `}} />

      <div className="print-container">
        <div className="sep-double"></div>

        {/* Company logo + name */}
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          {company?.logo && (
            <img
              src={company.logo}
              alt="Logo"
              style={{ height: '48px', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }}
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

        <div className="sep-double"></div>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13pt', letterSpacing: '4px', margin: '8px 0' }}>
          INVOICE
        </div>
        <div className="sep-single"></div>

        {/* Invoice meta */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', margin: '8px 0' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '10px' }}>
                <div>Nomor  : <strong>{invoice.number}</strong></div>
                <div>Tanggal: {new Date(invoice.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                <div>Jth Tmp: <strong style={{ color: '#000' }}>{new Date(invoice.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></div>
                <div>Status : <strong>[{statusLabel[invoice.status] || invoice.status}]</strong></div>
              </td>
              <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '10px' }}>
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
          <div style={{ fontSize: '10pt', marginTop: '4px', marginBottom: '8px' }}>
            Proyek  : {invoice.project.name}
          </div>
        )}

        <div className="sep-double"></div>

        {/* Items header */}
        <div style={{ display: 'flex', fontSize: '10pt', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '4px' }}>
          <span style={{ width: '5%' }}>No</span>
          <span style={{ width: '35%' }}>Deskripsi</span>
          <span style={{ width: '10%', textAlign: 'center' }}>Qty</span>
          <span style={{ width: '10%', textAlign: 'center' }}>Sat</span>
          <span style={{ width: '20%', textAlign: 'right' }}>Harga Sat.</span>
          <span style={{ width: '20%', textAlign: 'right' }}>Jumlah</span>
        </div>

        {/* Items rows */}
        {invoice.items?.map((item: any, idx: number) => (
          <div key={item.id} style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', fontSize: '10pt', paddingTop: '2px' }}>
              <span style={{ width: '5%' }}>{idx + 1}.</span>
              <span style={{ width: '35%', wordBreak: 'break-word' }}>{item.name}</span>
              <span style={{ width: '10%', textAlign: 'center' }}>{item.qty ?? item.quantity}</span>
              <span style={{ width: '10%', textAlign: 'center' }}>{item.unit}</span>
              <span style={{ width: '20%', textAlign: 'right' }}>{formatRupiah(item.unitPrice)}</span>
              <span style={{ width: '20%', textAlign: 'right' }}>{formatRupiah((item.qty ?? item.quantity) * item.unitPrice)}</span>
            </div>
            {item.description && (
              <div style={{ fontSize: '9pt', paddingLeft: '5%', color: '#333' }}>  ~ {item.description}</div>
            )}
          </div>
        ))}

        <div className="sep-single"></div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '10pt' }}>
          <div style={{ width: '50%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span><span>: {formatRupiah(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Diskon</span><span>: -{formatRupiah(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PPN ({invoice.tax}%)</span><span>: {formatRupiah(taxAmount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="sep-double"></div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '50%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12pt', fontWeight: 'bold' }}>
              <span>GRAND TOTAL</span><span>: {formatRupiah(invoice.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', marginTop: '4px' }}>
              <span>Sudah Dibayar</span><span>: {formatRupiah(invoice.paidAmount || 0)}</span>
            </div>
          </div>
        </div>

        <div className="sep-single"></div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '50%', display: 'flex', justifyContent: 'space-between', fontSize: '12pt', fontWeight: 'bold' }}>
            <span>SISA TAGIHAN</span><span>: {formatRupiah(sisaTagihan)}</span>
          </div>
        </div>

        <div className="sep-double"></div>

        {/* Payment info / notes */}
        {info && (
          <div style={{ fontSize: '9pt', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
            <strong>Informasi Pembayaran:</strong>{'\n'}
            {info}
          </div>
        )}

        {/* Payment history */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div style={{ fontSize: '9pt', marginBottom: '12px' }}>
            <div className="sep-single"></div>
            <strong>RIWAYAT PEMBAYARAN:</strong>
            {invoice.payments.map((p: any, i: number) => (
              <div key={p.id} style={{ display: 'flex', marginTop: '2px' }}>
                <span style={{ width: '5%' }}>{i + 1}.</span>
                <span style={{ width: '25%' }}>{new Date(p.date).toLocaleDateString('id-ID')}</span>
                <span style={{ width: '20%' }}>{p.method}</span>
                <span style={{ width: '25%', textAlign: 'right' }}>{formatRupiah(p.amount)}</span>
                <span style={{ width: '25%', paddingLeft: '8px', color: '#333' }}>{p.note || ''}</span>
              </div>
            ))}
          </div>
        )}

        {/* Signature */}
        <div className="sep-single"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', marginTop: '16px' }}>
          <div style={{ textAlign: 'center', width: '40%' }}>
            <div>Hormat Kami,</div>
            <div style={{ marginTop: '50px' }}>___________________</div>
            <div>{company?.name || 'Perusahaan'}</div>
          </div>
          <div style={{ textAlign: 'center', width: '40%' }}>
            <div>Penerima,</div>
            <div style={{ marginTop: '50px' }}>___________________</div>
            <div>{invoice.client?.name || 'Klien'}</div>
          </div>
        </div>

        <div className="sep-double" style={{ marginTop: '16px' }}></div>
        <div style={{ textAlign: 'center', fontSize: '8pt', color: '#666' }}>
          Dicetak: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {' | '}Terima kasih atas kepercayaan Anda.
        </div>
      </div>
    </>
  );
}
