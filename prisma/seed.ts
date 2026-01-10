import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = 'AdminPass123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create a sample operator user
  const operatorPassword = 'OperatorPass123';
  const operatorPasswordHash = await bcrypt.hash(operatorPassword, 10);

  const operator = await prisma.user.upsert({
    where: { email: 'operator@example.com' },
    update: {},
    create: {
      email: 'operator@example.com',
      passwordHash: operatorPasswordHash,
      name: 'Operator User',
      role: Role.OPERATOR,
    },
  });

  console.log('Created operator user:', operator.email);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
