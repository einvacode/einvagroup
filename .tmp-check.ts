import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  const clients = await prisma.client.findMany({
    select: { id: true, name: true, company: true },
  });
  console.log(JSON.stringify({ users, clients }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
