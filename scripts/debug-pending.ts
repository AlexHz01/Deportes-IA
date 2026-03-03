import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking pending predictions that were processed but not updated...");

    const pendingPredictions = await prisma.prediction.findMany({
        where: {
            status: 'PENDING',
            match: {
                status: 'FINISHED'
            }
        },
        include: {
            match: true
        }
    });

    if (pendingPredictions.length === 0) {
        console.log("✅ No problematic predictions found.");
        return;
    }

    console.log(`⚠️ Found ${pendingPredictions.length} pending predictions for FINISHED matches.\n`);

    pendingPredictions.forEach((pred, index) => {
        const match = pred.match;
        console.log(`PREDICTION #${index + 1}: ${pred.id}`);
        console.log(`   Result: "${pred.result}"`);
        console.log(`   Match: ${match.homeTeamId} vs ${match.awayTeamId}`);
        console.log(`   Status: "${match.status}"`);
        console.log(`   Home Score: ${match.homeScore}`);
        console.log(`   Away Score: ${match.awayScore}`);
        console.log(`   Date: ${match.date}`);
        console.log("-----------------------------------------");
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
