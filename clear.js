const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.payment.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.progressUpdate.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  console.log("Data sampel berhasil dibersihkan!")
}
main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
