import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin/operator user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const operator = await prisma.user.upsert({
    where: { email: 'operator@example.com' },
    update: {},
    create: {
      email: 'operator@example.com',
      password: hashedPassword,
      name: 'Water Company Operator',
      role: 'operator',
    },
  });

  console.log('Created operator user:', operator.email);

  // Create a demo customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Demo Customer',
      role: 'customer',
    },
  });

  console.log('Created customer user:', customer.email);

  // Create a demo device for the customer
  const device = await prisma.device.upsert({
    where: { deviceId: 'DEMO-DEVICE-001' },
    update: {},
    create: {
      deviceId: 'DEMO-DEVICE-001',
      name: 'Kitchen Leak Sensor',
      type: 'leak-sensor',
      metadata: JSON.stringify({
        location: 'Kitchen sink',
        installDate: new Date().toISOString(),
      }),
      ownerId: customer.id,
    },
  });

  console.log('Created demo device:', device.deviceId);

  console.log('Seeding completed!');
  console.log('\nLogin credentials:');
  console.log('Operator: operator@example.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
