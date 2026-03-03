const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Inline Validator Logic to avoid import issues
const PredictionValidator = {
    validate: (prediction, match) => {
        if (match.homeScore === null || match.awayScore === null) {
            return 'PENDING';
        }

        const result = prediction.result.toLowerCase();
        const homeScore = match.homeScore;
        const awayScore = match.awayScore;
        const totalGoals = homeScore + awayScore;

        let isWin = false;
        let isVoid = false;

        // 1. Ganador del Partido (1X2)
        if (result.includes("local") && !result.includes("empate") && !result.includes("doble")) {
            isWin = homeScore > awayScore;
        }
        else if (result.includes("visitante") && !result.includes("empate") && !result.includes("doble")) {
            isWin = awayScore > homeScore;
        }
        else if (result.includes("empate") && !result.includes("local") && !result.includes("visitante")) {
            isWin = homeScore === awayScore;
        }

        // 2. Doble Oportunidad
        else if (result.includes("local") && result.includes("empate")) { // 1X
            isWin = homeScore >= awayScore;
        }
        else if (result.includes("visitante") && result.includes("empate")) { // X2
            isWin = awayScore >= homeScore;
        }
        else if (result.includes("local") && result.includes("visitante")) { // 12
            isWin = homeScore !== awayScore;
        }

        // 3. Goles (Over/Under)
        else if (result.includes("más de")) {
            const line = PredictionValidator.extractLine(result);
            if (line !== null) isWin = totalGoals > line;
        }
        else if (result.includes("menos de")) {
            const line = PredictionValidator.extractLine(result);
            if (line !== null) isWin = totalGoals < line;
        }

        // 4. Ambos Anotan (BTTS)
        else if (result.includes("ambos anotan") || result.includes("btst") || result.includes("sí")) {
            isWin = homeScore > 0 && awayScore > 0;
        }
        else if (result.includes("no ambos anotan") || (result.includes("ambos anotan") && result.includes("no"))) {
            isWin = homeScore === 0 || awayScore === 0;
        }

        if (isVoid) return 'VOID';

        return isWin ? 'WIN' : 'LOSS';
    },

    extractLine: (text) => {
        const match = text.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : null;
    }
};

async function main() {
    console.log("🔍 Checking for finished matches to validate...");

    // 1. Find finished matches with predictions
    const finishedMatches = await prisma.match.findMany({
        where: {
            status: 'FINISHED',
            predictions: {
                some: {}
            }
        },
        include: {
            predictions: true,
            homeTeam: true,
            awayTeam: true,
            league: true
        },
        orderBy: {
            date: 'desc'
        },
        take: 5
    });

    if (finishedMatches.length === 0) {
        console.log("⚠️ No finished matches found with predictions.");
        return;
    }

    console.log(`Found ${finishedMatches.length} recent finished matches with predictions:\n`);

    let wins = 0;
    let total = 0;

    for (const match of finishedMatches) {
        console.log(`⚽ ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        console.log(`   Result: ${match.homeScore} - ${match.awayScore} | Date: ${match.date.toISOString().split('T')[0]}`);

        for (const pred of match.predictions) {
            // Run validation logic manually to compare
            const calculatedStatus = PredictionValidator.validate(pred, match);
            const isCorrect = calculatedStatus === 'WIN';
            const icon = isCorrect ? '✅' : '❌';

            console.log(`   🔮 Prediction: "${pred.result}"`);
            console.log(`      DB Status: ${pred.status}`);
            console.log(`      Calc Status: ${icon} ${calculatedStatus}`);

            if (isCorrect) wins++;
            total++;
        }
        console.log("-----------------------------------------");
    }

    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    console.log(`\n📊 Calculated Win Rate from these samples: ${winRate}% (${wins}/${total})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
