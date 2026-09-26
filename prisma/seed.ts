import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data (optional, be careful in production!)
  await prisma.payment.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.quotationItem.deleteMany()
  await prisma.quotation.deleteMany()
  await prisma.progressUpdate.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const staffPassword = await bcrypt.hash('staff123', 10)

  const admin = await prisma.user.create({
    data: { name: 'Ahmad Fauzi', email: 'admin@projekerja.com', password: adminPassword, role: 'ADMIN' }
  })
  
  const manager = await prisma.user.create({
    data: { name: 'Siti Rahayu', email: 'siti@projekerja.com', password: managerPassword, role: 'MANAGER' }
  })
  
  const staff = await prisma.user.create({
    data: { name: 'Budi Santoso', email: 'budi@projekerja.com', password: staffPassword, role: 'STAFF' }
  })

  // Clients
  const client1 = await prisma.client.create({
    data: { name: 'PT. Maju Jaya Sentosa', address: 'Jakarta', phone: '081234567890', email: 'info@majujaya.co.id' }
  })
  const client2 = await prisma.client.create({
    data: { name: 'CV. Berkah Mandiri', address: 'Bandung', phone: '081234567891', email: 'contact@berkahmandiri.com' }
  })
  const client3 = await prisma.client.create({
    data: { name: 'PT. Nusantara Digital', address: 'Surabaya', phone: '081234567892', email: 'hello@nusantaradigital.id' }
  })
  const client4 = await prisma.client.create({
    data: { name: 'Toko Elektronik Sejahtera', address: 'Semarang', phone: '081234567893', email: 'toko@sejahtera.com' }
  })

  // Projects
  const proj1 = await prisma.project.create({
    data: {
      name: 'Instalasi CCTV Mall Central',
      description: 'Pemasangan 50 titik CCTV baru',
      clientId: client1.id,
      userId: manager.id,
      status: 'IN_PROGRESS',
      progress: 65,
      type: 'CCTV'
    }
  })

  const proj2 = await prisma.project.create({
    data: {
      name: 'Jaringan Fiber Optik Kantor',
      description: 'Penarikan kabel FO antar gedung 300m',
      clientId: client2.id,
      userId: manager.id,
      status: 'IN_PROGRESS',
      progress: 40,
      type: 'JARINGAN'
    }
  })

  const proj3 = await prisma.project.create({
    data: {
      name: 'Sistem Keamanan Gudang',
      description: 'Access control dan CCTV terintegrasi',
      clientId: client3.id,
      userId: manager.id,
      status: 'PLANNING',
      progress: 0,
      type: 'CCTV'
    }
  })

  const proj4 = await prisma.project.create({
    data: {
      name: 'Instalasi Listrik Ruko Baru',
      description: 'Pemasangan instalasi listrik 3 lantai',
      clientId: client4.id,
      userId: manager.id,
      status: 'COMPLETED',
      progress: 100,
      type: 'LISTRIK'
    }
  })

  const proj5 = await prisma.project.create({
    data: {
      name: 'Maintenance CCTV Tahunan',
      description: 'Perawatan rutin CCTV',
      clientId: client1.id,
      userId: manager.id,
      status: 'ON_HOLD',
      progress: 30,
      type: 'CCTV'
    }
  })

  // Quotations & Invoices & Payments for Proj1 (IN PROGRESS)
  const q1Total = 33_500_000
  const q1 = await prisma.quotation.create({
    data: {
      number: 'QUO-2023-001',
      projectId: proj1.id,
      clientId: client1.id,
      subtotal: q1Total,
      discount: 0,
      tax: 0,
      total: q1Total,
      validUntil: new Date('2023-02-10'),
      status: 'ACCEPTED',
      items: {
        create: [
          { name: 'Kamera CCTV Hikvision 2MP', description: 'Kamera CCTV Hikvision 2MP', qty: 50, unitPrice: 450000, total: 22500000, unit: 'Unit' },
          { name: 'Kabel RG59+Power', description: 'Kabel RG59+Power', qty: 10, unitPrice: 350000, total: 3500000, unit: 'Roll' },
          { name: 'Jasa Instalasi', description: 'Jasa Instalasi', qty: 50, unitPrice: 150000, total: 7500000, unit: 'Job' }
        ]
      }
    }
  })

  const inv1 = await prisma.invoice.create({
    data: {
      number: 'INV-2023-001',
      projectId: proj1.id,
      clientId: client1.id,
      quotationId: q1.id,
      subtotal: q1Total,
      tax: 0,
      total: q1Total,
      paidAmount: 15_000_000,
      dueDate: new Date('2023-02-15'),
      status: 'PARTIAL',
      items: {
        create: [
          { name: 'Kamera CCTV Hikvision 2MP', description: 'Kamera CCTV Hikvision 2MP', qty: 50, unitPrice: 450000, total: 22500000, unit: 'Unit' },
          { name: 'Kabel RG59+Power', description: 'Kabel RG59+Power', qty: 10, unitPrice: 350000, total: 3500000, unit: 'Roll' },
          { name: 'Jasa Instalasi', description: 'Jasa Instalasi', qty: 50, unitPrice: 150000, total: 7500000, unit: 'Job' }
        ]
      }
    }
  })

  // Total invoice is (50*450k)+(10*350k)+(50*150k) = 22.5M + 3.5M + 7.5M = 33.5M
  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      amount: 15000000,
      date: new Date('2023-01-20'),
      method: 'TRANSFER',
      note: 'TRX-111'
    }
  })

  // Proj 4 (COMPLETED)
  const q2Total = 20_000_000
  const q2 = await prisma.quotation.create({
    data: {
      number: 'QUO-2023-002',
      projectId: proj4.id,
      clientId: client4.id,
      subtotal: q2Total,
      discount: 0,
      tax: 0,
      total: q2Total,
      validUntil: new Date('2023-03-05'),
      status: 'ACCEPTED',
      items: {
        create: [
          { name: 'Material Listrik Lengkap', description: 'Material Listrik Lengkap', qty: 1, unitPrice: 12000000, total: 12000000, unit: 'Set' },
          { name: 'Jasa Pemasangan', description: 'Jasa Pemasangan', qty: 1, unitPrice: 8000000, total: 8000000, unit: 'Paket' }
        ]
      }
    }
  })

  const inv2 = await prisma.invoice.create({
    data: {
      number: 'INV-2023-002',
      projectId: proj4.id,
      clientId: client4.id,
      quotationId: q2.id,
      subtotal: q2Total,
      tax: 0,
      total: q2Total,
      paidAmount: 20_000_000,
      dueDate: new Date('2023-03-10'),
      status: 'PAID',
      items: {
        create: [
          { name: 'Material Listrik Lengkap', description: 'Material Listrik Lengkap', qty: 1, unitPrice: 12000000, total: 12000000, unit: 'Set' },
          { name: 'Jasa Pemasangan', description: 'Jasa Pemasangan', qty: 1, unitPrice: 8000000, total: 8000000, unit: 'Paket' }
        ]
      }
    }
  })

  await prisma.payment.create({
    data: {
      invoiceId: inv2.id,
      amount: 20000000,
      date: new Date('2023-03-01'),
      method: 'TRANSFER',
      note: 'TRX-222'
    }
  })

  // Expenses
  await prisma.expense.createMany({
    data: [
      { projectId: proj1.id, category: 'MATERIAL', name: 'Beli kabel tambahan', amount: 1500000, date: new Date('2023-01-25'), note: 'Beli kabel tambahan' },
      { projectId: proj1.id, category: 'TRANSPORT', name: 'Bensin & tol tim', amount: 350000, date: new Date('2023-01-26'), note: 'Bensin & tol tim' },
      { projectId: proj4.id, category: 'MATERIAL', name: 'MCB dan Saklar', amount: 8000000, date: new Date('2023-02-12'), note: 'MCB dan Saklar' },
      { projectId: proj4.id, category: 'OTHER', name: 'Makan siang tukang', amount: 500000, date: new Date('2023-02-15'), note: 'Makan siang tukang' }
    ]
  })

  // Schedules
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  const lastWeek = new Date()
  lastWeek.setDate(today.getDate() - 7)

  await prisma.schedule.createMany({
    data: [
      { projectId: proj1.id, name: 'Tarik kabel lantai 1', startDate: lastWeek, endDate: today, assigneeId: staff.id, status: 'COMPLETED' },
      { projectId: proj1.id, name: 'Pasang kamera outdoor', startDate: today, endDate: nextWeek, assigneeId: staff.id, status: 'IN_PROGRESS' },
      { projectId: proj2.id, name: 'Survey jalur FO', startDate: lastWeek, endDate: lastWeek, assigneeId: staff.id, status: 'COMPLETED' },
      { projectId: proj2.id, name: 'Gali tanah untuk pipa', startDate: today, endDate: nextWeek, assigneeId: staff.id, status: 'IN_PROGRESS' },
      { projectId: proj3.id, name: 'Desain denah', startDate: nextWeek, endDate: new Date(nextWeek.getTime() + 86400000*3), assigneeId: manager.id, status: 'PENDING' }
    ]
  })

  // Progress Updates
  await prisma.progressUpdate.createMany({
    data: [
      { projectId: proj1.id, userId: staff.id, percentage: 30, note: 'Selesai lantai 1', createdAt: lastWeek },
      { projectId: proj1.id, userId: staff.id, percentage: 65, note: 'Lantai 2 sudah pasang breket', createdAt: today },
      { projectId: proj2.id, userId: staff.id, percentage: 20, note: 'Survey selesai', createdAt: lastWeek },
      { projectId: proj2.id, userId: staff.id, percentage: 40, note: 'Penggalian 30%', createdAt: today },
      { projectId: proj4.id, userId: manager.id, percentage: 100, note: 'Semua instalasi berfungsi, BAST ditandatangani', createdAt: new Date('2023-03-05') }
    ]
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
