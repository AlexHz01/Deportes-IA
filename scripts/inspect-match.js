const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const matchId = "e6823f86-06f6-4bd3-a5f6-ffe35c299995";
    console.log(`🔎 Inspecting Match: ${matchId}`);

    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { league: true, homeTeam: true, awayTeam: true }
    });

    if (!match) {
        console.log("❌ Match not found in DB.");
        return;
    }

    console.log("------------------------------------------------");
    console.log(`📅 Date: ${match.date}`);
    console.log(`🏆 League: ${match.league.name} (Ext ID: ${match.league.externalId})`);
    console.log(`⚽ ${match.homeTeam.name} vs ${match.awayTeam.name}`);
    console.log(`🔢 External Match ID: ${match.externalId}`);
    console.log(`📊 Status: ${match.status}`);
    console.log(`🥅 Scores: ${match.homeScore} - ${match.awayScore}`);
    console.log("------------------------------------------------");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
