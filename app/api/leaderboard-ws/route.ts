import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const teams = await prisma.team.findMany({
    take: 100,
    include: {
      _count: { select: { submissions: { where: { isCorrect: true } } } },
      members: true,
      submissions: {
        where: { isCorrect: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  const sorted = teams.sort((a: any, b: any) => {
    if (b.score !== a.score) return b.score - a.score;
    const aLast = a.submissions.at(-1)?.createdAt.getTime() ?? 0;
    const bLast = b.submissions.at(-1)?.createdAt.getTime() ?? 0;
    return aLast - bLast;
  });

  return NextResponse.json(sorted);
}