require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const sports = await prisma.sport.count();
    const leagues = await prisma.league.findMany({ include: { _count: { select: { matches: true } } } });
    const matches = await prisma.match.findMany({
        include: { homeTeam: true, awayTeam: true, league: true },
        take: 5
    });

    console.log(`Sports count: ${sports}`);
    console.log(`Leagues count: ${leagues.length}`);
    leagues.forEach(l => {
        console.log(`- ${l.name} (${l.country}): ${l._count.matches} matches`);
    });
    console.log(`Total Matches count (showing sample):`);
    matches.forEach(m => {
        console.log(`  [${m.league.name}] ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.date.toISOString()})`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
