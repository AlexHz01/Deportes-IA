const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando Limpieza Profunda (Stand-alone) ---');
    try {
        // Borrar en orden inverso a las dependencias
        const pCount = await prisma.prediction.deleteMany({});
        console.log(`- Predicciones eliminadas: ${pCount.count}`);

        const mCount = await prisma.match.deleteMany({});
        console.log(`- Partidos eliminados: ${mCount.count}`);

        const tCount = await prisma.team.deleteMany({});
        console.log(`- Equipos eliminados: ${tCount.count}`);

        const lCount = await prisma.league.deleteMany({});
        console.log(`- Ligas eliminadas: ${lCount.count}`);

        console.log('\n¡Base de datos de deportes limpia! (Prisma Studio puede tardar en refrescar)');
    } catch (e) {
        console.error('Error detallado:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
