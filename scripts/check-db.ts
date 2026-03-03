import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const sports = await prisma.sport.count();
    const leagues = await prisma.league.findMany({ include: { _count: { select: { matches: true } } } });
    const matches = await prisma.match.count();

    console.log(`Sports count: ${sports}`);
    console.log(`Leagues count: ${leagues.length}`);
    leagues.forEach(l => {
        console.log(`- ${l.name} (${l.country}): ${l._count.matches} matches`);
    });
    console.log(`Total Matches count: ${matches}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
