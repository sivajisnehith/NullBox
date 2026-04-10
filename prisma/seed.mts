import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD || 'Viper$Trike_CmD_99!'
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

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

  const challenges = await Promise.all([
    prisma.challenge.upsert({
      where: { id: 'seed_chal_web' },
      update: { points: 100 },
      create: {
        id: 'seed_chal_web',
        title: 'Seeded Web Recon',
        description: 'Seed challenge for leaderboard testing',
        category: 'Web',
        points: 100,
        flag: 'CTF{seed_web}'
      }
    }),
    prisma.challenge.upsert({
      where: { id: 'seed_chal_crypto' },
      update: { points: 200 },
      create: {
        id: 'seed_chal_crypto',
        title: 'Seeded Crypto',
        description: 'Seed challenge for leaderboard testing',
        category: 'Crypto',
        points: 200,
        flag: 'CTF{seed_crypto}'
      }
    }),
    prisma.challenge.upsert({
      where: { id: 'seed_chal_pwn' },
      update: { points: 300 },
      create: {
        id: 'seed_chal_pwn',
        title: 'Seeded Pwn',
        description: 'Seed challenge for leaderboard testing',
        category: 'Pwn',
        points: 300,
        flag: 'CTF{seed_pwn}'
      }
    })
  ])

  const teams = await Promise.all([
    prisma.team.upsert({
      where: { name: 'AlphaNull' },
      update: {},
      create: { name: 'AlphaNull', joinCode: 'ALPHA001' }
    }),
    prisma.team.upsert({
      where: { name: 'ByteBandits' },
      update: {},
      create: { name: 'ByteBandits', joinCode: 'BYTE0001' }
    }),
    prisma.team.upsert({
      where: { name: 'CipherCrew' },
      update: {},
      create: { name: 'CipherCrew', joinCode: 'CIPHER01' }
    })
  ])

  await prisma.user.upsert({
    where: { email: 'alpha.lead@nullbox.ctf' },
    update: { teamId: teams[0].id },
    create: {
      email: 'alpha.lead@nullbox.ctf',
      username: 'alpha_lead',
      registrationNumber: 'TEAM-ALPHA-01',
      password: await bcrypt.hash('alpha123', 10),
      role: 'user',
      teamId: teams[0].id
    }
  })
  await prisma.user.upsert({
    where: { email: 'byte.lead@nullbox.ctf' },
    update: { teamId: teams[1].id },
    create: {
      email: 'byte.lead@nullbox.ctf',
      username: 'byte_lead',
      registrationNumber: 'TEAM-BYTE-01',
      password: await bcrypt.hash('byte123', 10),
      role: 'user',
      teamId: teams[1].id
    }
  })
  await prisma.user.upsert({
    where: { email: 'cipher.lead@nullbox.ctf' },
    update: { teamId: teams[2].id },
    create: {
      email: 'cipher.lead@nullbox.ctf',
      username: 'cipher_lead',
      registrationNumber: 'TEAM-CIPHER-01',
      password: await bcrypt.hash('cipher123', 10),
      role: 'user',
      teamId: teams[2].id
    }
  })

  const submissionsToSeed = [
    { teamId: teams[0].id, challengeId: challenges[2].id, isCorrect: true }, // 300
    { teamId: teams[0].id, challengeId: challenges[1].id, isCorrect: true }, // +200 => 500
    { teamId: teams[1].id, challengeId: challenges[1].id, isCorrect: true }, // 200
    { teamId: teams[1].id, challengeId: challenges[0].id, isCorrect: true }, // +100 => 300
    { teamId: teams[2].id, challengeId: challenges[0].id, isCorrect: true } // 100
  ]

  for (const sub of submissionsToSeed) {
    await prisma.submission.upsert({
      where: {
        teamId_challengeId: {
          teamId: sub.teamId,
          challengeId: sub.challengeId
        }
      },
      update: { isCorrect: true },
      create: sub
    })
  }

  // Keep score field aligned with sum of correct solved challenge points.
  for (const team of teams) {
    const solved = await prisma.submission.findMany({
      where: { teamId: team.id, isCorrect: true },
      include: { challenge: true }
    })
    const score = solved.reduce((acc, s) => acc + s.challenge.points, 0)
    await prisma.team.update({ where: { id: team.id }, data: { score } })
  }

  console.log('Seed complete: 3 teams + correct submissions + synced scores')
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
