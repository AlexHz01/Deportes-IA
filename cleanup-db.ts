import prisma from './src/lib/prisma'

async function cleanup() {
    console.log('--- Iniciando Limpieza de Base de Datos (PRUEBAS) ---');

    try {
        // 1. Borrar Predicciones (dependen de Matches)
        const delPreds = await prisma.prediction.deleteMany({});
        console.log(`- Borradas ${delPreds.count} predicciones.`);

        // 2. Borrar Matches
        const delMatches = await prisma.match.deleteMany({});
        console.log(`- Borrados ${delMatches.count} partidos.`);

        // 3. Borrar Equipos
        const delTeams = await prisma.team.deleteMany({});
        console.log(`- Borrados ${delTeams.count} equipos.`);

        // 4. Borrar Ligas
        const delLeagues = await prisma.league.deleteMany({});
        console.log(`- Borradas ${delLeagues.count} ligas.`);

        console.log('\n--- BASE DE DATOS LIMPIA ---');
        console.log('Ahora puedes ir al panel y pulsar "Sincronizar" para reconstruir todo correctamente.');
    } catch (error) {
        console.error('Error durante la limpieza:', error);
    }
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
