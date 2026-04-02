import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL missing')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
})

async function main() {
  const team = await prisma.team.findUnique({ where: { name: 'CipherCrew' } })
  const challenge = await prisma.challenge.findUnique({ where: { id: 'seed_chal_crypto' } })

  if (!team || !challenge) {
    throw new Error('Missing seeded team/challenge')
  }

  await prisma.$transaction([
    prisma.submission.upsert({
      where: {
        teamId_challengeId: {
          teamId: team.id,
          challengeId: challenge.id
        }
      },
      update: { isCorrect: true },
      create: {
        teamId: team.id,
        challengeId: challenge.id,
        isCorrect: true
      }
    }),
    prisma.team.update({
      where: { id: team.id },
      data: { score: { increment: challenge.points } }
    })
  ])

  console.log(JSON.stringify({ team: team.name, challenge: challenge.id, pointsAdded: challenge.points }))
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
