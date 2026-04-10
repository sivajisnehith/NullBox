import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD || 'Viper$Trike_CmD_99!'
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

  // CLEANUP: Delete all existing data
  console.log('Cleaning up database...')
  await prisma.submission.deleteMany()
  await prisma.container.deleteMany()
  await prisma.hint.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.user.deleteMany()
  await prisma.team.deleteMany()
  await prisma.challenge.deleteMany()

  // Only create the Admin
  console.log('Creating admin user...')
  await prisma.user.upsert({
    where: { email: 'admin@nullbox.ctf' },
    update: { password: hashedAdminPassword },
    create: {
      email: 'admin@nullbox.ctf',
      username: 'CommandCore',
      registrationNumber: 'ADMIN001',
      password: hashedAdminPassword,
      role: 'admin'
    }
  })

  console.log('Clean-up complete. Only Admin user exists.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
