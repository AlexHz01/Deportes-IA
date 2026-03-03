export class SportsAPIService {
    private apiKey: string;
    private baseUrl: string = "https://v3.football.api-sports.io";

    constructor() {
        this.apiKey = process.env.API_FOOTBALL_KEY || "";
        if (!this.apiKey) {
            console.warn("API_FOOTBALL_KEY is not set");
        }
    }

    private async fetchAPI(endpoint: string, params: Record<string, string> = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

        const response = await fetch(url.toString(), {
            headers: {
                "x-apisports-key": this.apiKey,
                "x-rapidapi-host": "v3.football.api-sports.io",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    async getLeagues(country?: string) {
        const params: Record<string, string> = {};
        if (country) params.country = country;

        // Fetch only top leagues to avoid clutter (can be adjusted)
        const data = await this.fetchAPI("/leagues", params);
        return data.response;
    }

    async getFixtures(date: string, leagueId?: string) {
        const params: Record<string, string> = { date };
        if (leagueId) params.league = leagueId;

        const data = await this.fetchAPI("/fixtures", params);
        return data.response;
    }

    async getFixturesByIds(ids: number[]) {
        if (!ids || ids.length === 0) return [];
        // API-Football allows comma separated IDs (max 20 per call usually, but we'll try batch)
        // If many, we might need to slice, but for now let's assume < 20 active matches viewable
        const idsStr = ids.join('-');

        // Since the API uses 'ids' parameter with dash separator or multiple calls? 
        // Docs say: id (integer) or ids (string of integers separated by "-")
        const data = await this.fetchAPI("/fixtures", { ids: idsStr });
        return data.response;
    }

    async getPredictions(fixtureId: number) {
        if (!fixtureId) return null;
        const data = await this.fetchAPI("/predictions", { fixture: fixtureId.toString() });
        return data.response[0]; // Returns rich comparison, form, and H2H data
    }

    async getLineups(fixtureId: number) {
        if (!fixtureId) return [];
        const data = await this.fetchAPI("/fixtures/lineups", { fixture: fixtureId.toString() });
        return data.response;
    }

    async getInjuries(fixtureId: number) {
        if (!fixtureId) return [];
        const data = await this.fetchAPI("/fixtures/injuries", { fixture: fixtureId.toString() });
        return data.response;
    }

    async getTopScorers(leagueId: number, season: number) {
        if (!leagueId || !season) return [];
        const data = await this.fetchAPI("/players/topscorers", {
            league: leagueId.toString(),
            season: season.toString()
        });
        return data.response;
    }
}

export const sportsAPI = new SportsAPIService();
