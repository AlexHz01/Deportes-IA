import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking validation status for finished matches...");

    const predictions = await prisma.prediction.findMany({
        where: {
            match: {
                status: 'FINISHED'
            }
        },
        include: {
            match: true
        }
    });

    if (predictions.length === 0) {
        console.log("⚠️ No predictions found for finished matches.");
        return;
    }

    let pendingCount = 0;
    let winCount = 0;
    let lossCount = 0;
    let voidCount = 0;

    for (const pred of predictions) {
        if (pred.status === 'PENDING') pendingCount++;
        if (pred.status === 'WIN') winCount++;
        if (pred.status === 'LOSS') lossCount++;
        if (pred.status === 'VOID') voidCount++;

        console.log(`[${pred.status}] Match: ${pred.match.homeTeamId} vs ${pred.match.awayTeamId} | Result: ${pred.result} | Score: ${pred.match.homeScore}-${pred.match.awayScore}`);
    }

    console.log("\n📊 Summary:");
    console.log(`- PENDING: ${pendingCount}`);
    console.log(`- WIN: ${winCount}`);
    console.log(`- LOSS: ${lossCount}`);
    console.log(`- VOID: ${voidCount}`);

    if (pendingCount > 0) {
        console.log("\n⚠️ Some predictions are still PENDING despite being finished. Validation job needs to run.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
