import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#1f2937' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 14 },
  companyName: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  section: { marginBottom: 18 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#d1d5db', marginBottom: 18 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, borderColor: '#d1d5db', backgroundColor: '#f3f4f6', padding: 6 },
  tableCol: { borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, borderColor: '#d1d5db', padding: 6 },
  totals: { marginTop: 10, alignItems: 'flex-end' },
  totalsRow: { flexDirection: 'row', width: '42%', justifyContent: 'space-between', paddingVertical: 2 },
  boldText: { fontWeight: 'bold' },
  footer: { marginTop: 36, alignItems: 'flex-end' },
});

export const QuotationDocument = ({ quotation, companyProfile }: { quotation: any; companyProfile?: any }) => {
  const profile = companyProfile || {};
  const subtotal = Number(quotation.subtotal || 0)
  const discount = Number(quotation.discount || 0)
  const tax = Number(quotation.tax || 0)
  const total = Number(quotation.total || 0)
  const rawLetterBody = typeof quotation.notes === 'string' ? quotation.notes : '';
  const letterText = rawLetterBody
    .replace(/^Perihal:\s*.*$/im, '')
    .replace(/^Dengan\s+hormat,?\s*/i, '')
    .replace(/\bDemikian\s+surat\s+penawaran\s+ini\s+kami\s+sampaikan\.?\s*/i, '')
    .replace(/\bAtas\s+perhatian\s+dan\s+kerja\s+sama\s+yang\s+baik,?\s*kami\s+ucapkan\s+terima\s+kasih\.?\s*/i, '')
    .trim();
  const letterBody = letterText || `Bersama ini kami sampaikan penawaran untuk pekerjaan ${quotation.project?.name || 'proyek'} sesuai detail yang terlampir. Kami berharap dapat melanjutkan kerja sama dan siap membantu sesuai kebutuhan Anda.`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>Surat Penawaran</Text>
            <Text style={styles.title}>PENAWARAN</Text>
            <Text>Nomor: {quotation.number}</Text>
            <Text>Tanggal: {new Date(quotation.createdAt).toLocaleDateString('id-ID')}</Text>
            <Text>Berlaku Hingga: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('id-ID') : '-'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.companyName}>{profile.name || 'EINVA GROUP'}</Text>
            <Text>{profile.address || 'Gempol Rt 10 Sambirejo, Sambirejo, Sragen'}</Text>
            <Text>{profile.city || 'Jawa Tengah, Indonesia'}</Text>
            <Text>{profile.email || 'info@einvaintidata.com'}</Text>
            {profile.phone && <Text>{profile.phone}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Perihal: {quotation.project?.name || 'Penawaran Pekerjaan'}</Text>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Kepada Yth:</Text>
          <Text>{quotation.client?.name}</Text>
          <Text>{quotation.client?.company}</Text>
          <Text>{quotation.client?.address}</Text>
        </View>

        <View style={{ marginBottom: 18 }}>
          <Text>Dengan hormat,</Text>
          <Text style={{ marginTop: 8 }}>{letterBody}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableColHeader, width: '10%' }}><Text>No</Text></View>
            <View style={{ ...styles.tableColHeader, width: '42%' }}><Text>Uraian</Text></View>
            <View style={{ ...styles.tableColHeader, width: '12%' }}><Text>Qty</Text></View>
            <View style={{ ...styles.tableColHeader, width: '18%' }}><Text>Harga</Text></View>
            <View style={{ ...styles.tableColHeader, width: '18%' }}><Text>Jumlah</Text></View>
          </View>
          {quotation.items?.map((item: any, idx: number) => {
            const qty = Number(item.qty ?? item.quantity ?? 0)
            const unitPrice = Number(item.unitPrice ?? 0)
            const itemTotal = Number(item.total ?? qty * unitPrice)

            return (
              <View style={styles.tableRow} key={idx}>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>{idx + 1}</Text></View>
                <View style={{ ...styles.tableCol, width: '42%' }}><Text>{item.name}</Text></View>
                <View style={{ ...styles.tableCol, width: '12%' }}><Text>{qty} {item.unit}</Text></View>
                <View style={{ ...styles.tableCol, width: '18%' }}><Text>Rp{unitPrice.toLocaleString('id-ID')}</Text></View>
                <View style={{ ...styles.tableCol, width: '18%' }}><Text>Rp{itemTotal.toLocaleString('id-ID')}</Text></View>
              </View>
            )
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}><Text>Subtotal:</Text><Text>Rp{subtotal.toLocaleString('id-ID')}</Text></View>
          {discount > 0 && <View style={styles.totalsRow}><Text>Diskon:</Text><Text>-Rp{discount.toLocaleString('id-ID')}</Text></View>}
          {tax > 0 && <View style={styles.totalsRow}><Text>PPN ({tax}%):</Text><Text>Rp{((subtotal - discount) * tax / 100).toLocaleString('id-ID')}</Text></View>}
          <View style={{ ...styles.totalsRow, marginTop: 5, borderTopWidth: 1, borderTopColor: '#374151', paddingTop: 6 }}><Text style={styles.boldText}>Total:</Text><Text style={styles.boldText}>Rp{total.toLocaleString('id-ID')}</Text></View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text>Demikian surat penawaran ini kami sampaikan.</Text>
          <Text style={{ marginTop: 8 }}>Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.</Text>
        </View>

        <View style={styles.footer}>
          <Text>Hormat kami,</Text>
          <Text style={{ marginTop: 36, fontWeight: 'bold' }}>{profile.name || 'EINVA GROUP'}</Text>
          {profile.directorName && <Text>{profile.directorName}</Text>}
          {profile.bankHolder && <Text>{profile.bankHolder}</Text>}
        </View>
      </Page>
    </Document>
  )
}
