import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

async function checkFixturesRange() {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    console.log(`Checking fixtures for dates: ${dates.join(', ')}`);

    for (const date of dates) {
        try {
            const response = await fetch(`${BASE_URL}/fixtures?date=${date}`, {
                headers: {
                    'x-apisports-key': API_KEY || '',
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                }
            });

            const data = await response.json();
            const fixtures = data.response || [];
            console.log(`- ${date}: Total fixtures found: ${fixtures.length}`);

            if (fixtures.length > 0) {
                const leagues = [...new Set(fixtures.map((f: any) => `${f.league.name} (ID: ${f.league.id})`))].slice(0, 5);
                console.log(`  Example leagues: ${leagues.join(', ')}`);
            }
        } catch (error: any) {
            console.error(`Error for ${date}:`, error.message);
        }
    }
}

checkFixturesRange();
