import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  companyName: { fontSize: 20, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#16a34a', marginBottom: 10 },
  section: { marginBottom: 20 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f3f4f6', padding: 5 },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  totals: { marginTop: 20, alignItems: 'flex-end' },
  totalsRow: { flexDirection: 'row', width: '50%', justifyContent: 'space-between', paddingVertical: 4 },
  boldText: { fontWeight: 'bold' },
  redText: { color: '#ef4444' },
});

export const InvoiceDocument = ({ invoice, companyProfile }: { invoice: any; companyProfile?: any }) => {
  const profile = companyProfile || {};

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVOICE</Text>
          <Text>Nomor: {invoice.number}</Text>
          <Text>Tanggal: {new Date(invoice.createdAt).toLocaleDateString('id-ID')}</Text>
          <Text style={styles.redText}>Jatuh Tempo: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.companyName}>{profile.name || 'Einva Group'}</Text>
          <Text>{profile.address || 'Jl. Contoh Perusahaan No. 123'}</Text>
          <Text>{profile.city || 'Jakarta, Indonesia'}</Text>
          {profile.email && <Text>{profile.email}</Text>}
          {profile.phone && <Text>{profile.phone}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Tagihan Kepada (Bill To):</Text>
        <Text>{invoice.client?.name}</Text>
        <Text>{invoice.client?.company}</Text>
        <Text>{invoice.client?.address}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={{ ...styles.tableColHeader, width: '10%' }}><Text>No</Text></View>
          <View style={{ ...styles.tableColHeader, width: '40%' }}><Text>Deskripsi</Text></View>
          <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>Qty</Text></View>
          <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>Harga</Text></View>
          <View style={{ ...styles.tableColHeader, width: '20%' }}><Text>Jumlah</Text></View>
        </View>
        {invoice.items?.map((item: any, idx: number) => (
          <View style={styles.tableRow} key={idx}>
            <View style={{ ...styles.tableCol, width: '10%' }}><Text>{idx + 1}</Text></View>
            <View style={{ ...styles.tableCol, width: '40%' }}><Text>{item.name}</Text></View>
            <View style={{ ...styles.tableCol, width: '15%' }}><Text>{item.quantity} {item.unit}</Text></View>
            <View style={{ ...styles.tableCol, width: '15%' }}><Text>Rp{item.unitPrice.toLocaleString('id-ID')}</Text></View>
            <View style={{ ...styles.tableCol, width: '20%' }}><Text>Rp{item.subtotal.toLocaleString('id-ID')}</Text></View>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalsRow}><Text>Subtotal:</Text><Text>Rp{invoice.subtotal.toLocaleString('id-ID')}</Text></View>
        {invoice.discount > 0 && <View style={styles.totalsRow}><Text style={styles.redText}>Diskon:</Text><Text style={styles.redText}>-Rp{invoice.discount.toLocaleString('id-ID')}</Text></View>}
        {invoice.tax > 0 && <View style={styles.totalsRow}><Text>PPN ({invoice.tax}%):</Text><Text>Rp{((invoice.subtotal - invoice.discount) * invoice.tax / 100).toLocaleString('id-ID')}</Text></View>}
        <View style={{ ...styles.totalsRow, marginTop: 5, borderTopWidth: 1 }}><Text style={styles.boldText}>Grand Total:</Text><Text style={styles.boldText}>Rp{invoice.total.toLocaleString('id-ID')}</Text></View>
        
        <View style={{ ...styles.totalsRow, marginTop: 5 }}><Text>Telah Dibayar:</Text><Text>Rp{invoice.paidAmount.toLocaleString('id-ID')}</Text></View>
        <View style={{ ...styles.totalsRow, borderTopWidth: 1, backgroundColor: '#fef2f2', padding: 5 }}><Text style={{ ...styles.boldText, ...styles.redText }}>Sisa Tagihan:</Text><Text style={{ ...styles.boldText, ...styles.redText }}>Rp{(invoice.total - invoice.paidAmount).toLocaleString('id-ID')}</Text></View>
      </View>

      {(invoice.notes || profile.notes) && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontWeight: 'bold' }}>Informasi Pembayaran / Catatan:</Text>
          <Text>{invoice.notes || profile.notes}</Text>
        </View>
      )}

      <View style={{ marginTop: 50, width: '100%', textAlign: 'center' }}>
        <Text style={{ fontStyle: 'italic', color: '#6b7280' }}>Terima kasih atas kepercayaan Anda kepada {profile.name || 'Einva Group'}.</Text>
      </View>
    </Page>
  </Document>
  );
};
