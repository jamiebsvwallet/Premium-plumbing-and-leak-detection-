import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('AdminPass123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('Seeded admin user:', admin.email)

  // Create a sample operator
  const operatorPassword = await bcrypt.hash('OperatorPass123', 10)
  const operator = await prisma.user.upsert({
    where: { email: 'operator@example.com' },
    update: {},
    create: {
      email: 'operator@example.com',
      passwordHash: operatorPassword,
      name: 'Sample Operator',
      role: 'OPERATOR',
    },
  })

  console.log('Seeded operator user:', operator.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
