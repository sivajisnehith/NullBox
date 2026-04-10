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

  // Create Users from Registration Numbers
  const regNumbers = [
    "25BEC7137", "25BEV7105", "25BEV7108", "22MIS7234", "22MIC7099", "22MIC7215",
    "24BCE8098", "24BCC7002", "24BCE7018", "24BCE7624", "23BCE7892", "23BCE8314",
    "23BCE7187", "23BME7078", "24BCS7055", "23BCE7363", "23BCE20176", "23BCE7354",
    "23BCE20091", "24BCA7766", "23BCE20159", "23MIS7251", "24BCS7137", "24BCS7133",
    "23BCE9050", "23BCE8939", "23BCE20177", "23BCE9569", "24BEC7059", "24BSD7015",
    "24BCD7162", "23BCE9954", "23BCE9572", "24BCB7176", "24BCB7074", "24BCB7159",
    "24BCA7454", "24MIC7108", "24BCB7265", "24BCE7281", "25BCE8824", "25BCW7003",
    "25BCE8757", "25BCS7038"
  ];

  console.log(`Creating ${regNumbers.length} participants...`);

  for (const regNo of regNumbers) {
    const hashedPassword = await bcrypt.hash(regNo, 10);
    await prisma.user.upsert({
      where: { registrationNumber: regNo },
      update: { password: hashedPassword },
      create: {
        email: `${regNo.toLowerCase()}@nullbox.ctf`,
        username: regNo,
        registrationNumber: regNo,
        password: hashedPassword,
        role: 'user'
      }
    });
  }

  console.log('Seed complete: Admin + 44 participants created.');
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
