import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

async function checkFixtures() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking fixtures for: ${today}`);

    try {
        const response = await fetch(`${BASE_URL}/fixtures?date=${today}`, {
            headers: {
                'x-apisports-key': API_KEY || '',
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        const data = await response.json();
        const fixtures = data.response || [];
        console.log(`Fixtures found today: ${fixtures.length}`);

        const leagueCounts: Record<string, number> = {};
        fixtures.forEach((f: any) => {
            const key = `${f.league.name} (${f.league.id})`;
            leagueCounts[key] = (leagueCounts[key] || 0) + 1;
        });

        console.log('Active Leagues Today:');
        Object.entries(leagueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .forEach(([l, c]) => console.log(`- ${l}: ${c} matches`));

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkFixtures();
