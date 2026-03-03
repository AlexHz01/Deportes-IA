const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('--- Iniciando Reseteo de Base de Datos (SQL Directo) ---');
    try {
        await client.connect();

        // Truncar todas las tablas relacionadas con deportes en orden de dependencia
        // O simplemente usar CASCADE
        console.log('- Limpiando tablas...');
        await client.query('TRUNCATE TABLE "Prediction", "Match", "Team", "League", "Sport" CASCADE;');

        console.log('¡Éxito! Base de datos reseteada.');
        console.log('Acción sugerida: Vé al panel de administración y pulsa "Sincronizar" para empezar de cero.');
    } catch (err) {
        console.error('Error durante el reseteo:', err.message);
    } finally {
        await client.end();
    }
}

main();
