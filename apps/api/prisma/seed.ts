import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.account.upsert({
    where: { email: 'admin@example.test' },
    update: {},
    create: {
      auth0Subject: 'local|admin',
      email: 'admin@example.test',
      role: 'ADMIN',
      emailVerified: true,
      verificationStatus: 'APPROVED',
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
