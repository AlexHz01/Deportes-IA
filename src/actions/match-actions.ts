"use server";

import prisma from "@/lib/prisma";
import { sportsAPI } from "@/services/sports-api";
import { aiService } from "@/services/ai-service";
import { revalidatePath } from "next/cache";
import { MatchStatus, PredictionStatus } from "@prisma/client";

// Top Leagues Data (Hardcoded for seeding)
const LEAGUE_DATA: Record<number, { name: string; country: string; logo: string | null; tier: number }> = {
    2: { name: "UEFA Champions League", country: "World", logo: "https://media.api-sports.io/football/leagues/2.png", tier: 1 },
    3: { name: "UEFA Europa League", country: "World", logo: "https://media.api-sports.io/football/leagues/3.png", tier: 1 },
    13: { name: "CONMEBOL Libertadores", country: "World", logo: "https://media.api-sports.io/football/leagues/13.png", tier: 1 },
    11: { name: "CONMEBOL Sudamericana", country: "World", logo: "https://media.api-sports.io/football/leagues/11.png", tier: 1 },
    140: { name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png", tier: 1 },
    39: { name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", tier: 1 },
    135: { name: "Serie A", country: "Italy", logo: "https://media.api-sports.io/football/leagues/135.png", tier: 1 },
    78: { name: "Bundesliga", country: "Germany", logo: "https://media.api-sports.io/football/leagues/78.png", tier: 1 },
    61: { name: "Ligue 1", country: "France", logo: "https://media.api-sports.io/football/leagues/61.png", tier: 1 },
    262: { name: "Liga MX", country: "Mexico", logo: "https://media.api-sports.io/football/leagues/262.png", tier: 1 },
    263: { name: "Liga de Expansión MX", country: "Mexico", logo: "https://media.api-sports.io/football/leagues/263.png", tier: 2 },
    253: { name: "Major League Soccer", country: "USA", logo: "https://media.api-sports.io/football/leagues/253.png", tier: 2 },
    128: { name: "Liga Profesional", country: "Argentina", logo: "https://media.api-sports.io/football/leagues/128.png", tier: 1 },
    130: { name: "Copa Argentina", country: "Argentina", logo: "https://media.api-sports.io/football/leagues/130.png", tier: 2 },
    71: { name: "Brasileirão Série A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png", tier: 1 },
    72: { name: "Brasileirão Série B", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/72.png", tier: 2 },
    94: { name: "Primeira Liga", country: "Portugal", logo: "https://media.api-sports.io/football/leagues/94.png", tier: 2 },
    88: { name: "Eredivisie", country: "Netherlands", logo: "https://media.api-sports.io/football/leagues/88.png", tier: 2 },
};

const TOP_LEAGUES = Object.keys(LEAGUE_DATA).map(Number);

// Helper to map API-Football short status to Prisma MatchStatus
function mapApiStatus(shortStatus: string): MatchStatus {
    switch (shortStatus) {
        case "TBD":
        case "NS":
            return MatchStatus.SCHEDULED;
        case "1H":
        case "HT":
        case "2H":
        case "ET":
        case "BT":
        case "P":
        case "LIVE":
        case "INT":
            return MatchStatus.LIVE;
        case "FT":
        case "AET":
        case "PEN":
            return MatchStatus.FINISHED;
        case "SUSP":
        case "PST":
            return MatchStatus.POSTPONED;
        case "CANC":
        case "ABD":
        case "AWD":
        case "WO":
            return MatchStatus.CANCELLED;
        default:
            return MatchStatus.SCHEDULED;
    }
}

// Helper to seed leagues if they don't exist
async function ensureTopLeaguesExist() {
    let sport = await prisma.sport.findUnique({ where: { name: "Football" } });
    if (!sport) {
        sport = await prisma.sport.create({ data: { name: "Football" } });
    }

    for (const id of TOP_LEAGUES) {
        const data = LEAGUE_DATA[id];

        // 1. First, check if a league with this externalId already exists
        let league = await prisma.league.findUnique({
            where: { externalId: id }
        });

        // 2. If not, check by name/country/sportId
        if (!league) {
            league = await prisma.league.findFirst({
                where: {
                    name: data.name,
                    country: data.country,
                    sportId: sport.id
                }
            });

            if (!league) {
                // 3. Create it if it doesn't exist at all
                try {
                    await prisma.league.create({
                        data: {
                            name: data.name,
                            country: data.country,
                            logo: data.logo,
                            sportId: sport.id,
                            externalId: id,
                            tier: data.tier
                        } as any
                    });
                } catch (error) {
                    console.error(`Error creating league ${id}:`, error);
                }
            } else {
                // 4. Update the externalId and tier if it matches by name
                await prisma.league.update({
                    where: { id: league.id },
                    data: { externalId: id, tier: data.tier } as any
                });
            }
        } else {
            // Update tier if it changed
            await prisma.league.update({
                where: { id: league.id },
                data: { tier: data.tier } as any
            });
        }
    }
}

export async function syncMatches(startDate: string) {
    try {
        await ensureTopLeaguesExist();

        let count = 0;
        let existingCount = 0;
        const datesToSync = [];
        const start = new Date(startDate);

        // Fetch: 2 days before + 7 days ahead (Total ~9 days range for context)
        // This ensures check for yesterday's finished matches final scores
        for (let i = -2; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            datesToSync.push(d.toISOString().split('T')[0]);
        }

        for (const date of datesToSync) {
            const response = await sportsAPI.getFixtures(date);
            const fixtures = response.filter((f: any) => TOP_LEAGUES.includes(f.league.id));

            console.log(`Syncing date ${date}: Found ${response.length} total fixtures.`);
            if (response.length > 0 && fixtures.length === 0) {
                const foundLeagues = [...new Set(response.map((f: any) => `${f.league.name} (${f.league.id})`))].slice(0, 10);
                console.log(`No top leagues found. Some leagues available on this date: ${foundLeagues.join(', ')}`);
            } else if (fixtures.length > 0) {
                console.log(`Found ${fixtures.length} matches for top leagues on ${date}.`);
            }

            for (const fixture of fixtures) {
                const { fixture: matchInfo, league: leagueInfo, teams } = fixture;

                if (!teams.home || !teams.away) continue;

                const sport = await prisma.sport.findUnique({ where: { name: "Football" } });

                // 1. Try to find by externalId first
                let league = await prisma.league.findUnique({
                    where: { externalId: leagueInfo.id },
                });

                if (!league) {
                    // 2. Fallback to name/country/sportId
                    league = await prisma.league.findFirst({
                        where: {
                            name: leagueInfo.name,
                            country: leagueInfo.country,
                            sportId: sport!.id
                        }
                    });

                    if (!league) {
                        try {
                            league = await prisma.league.create({
                                data: {
                                    name: leagueInfo.name,
                                    country: leagueInfo.country,
                                    logo: leagueInfo.logo,
                                    sportId: sport!.id,
                                    externalId: leagueInfo.id
                                },
                            });
                        } catch (e) {
                            league = await prisma.league.findUnique({
                                where: { externalId: leagueInfo.id }
                            }) as any;
                        }
                    } else {
                        // Update externalId if it was missing or different
                        try {
                            league = await prisma.league.update({
                                where: { id: league.id },
                                data: { externalId: leagueInfo.id }
                            });
                        } catch (e) {
                            // If update fails (unique constraint), get the one that has that externalId
                            league = await prisma.league.findUnique({
                                where: { externalId: leagueInfo.id }
                            }) as any;
                        }
                    }
                }

                if (!league) continue;

                let homeTeam = await prisma.team.findFirst({
                    where: { name: teams.home.name, leagueId: league.id }
                });
                if (!homeTeam) {
                    try {
                        homeTeam = await prisma.team.create({
                            data: { name: teams.home.name, logo: teams.home.logo, leagueId: league.id }
                        });
                    } catch (e) {
                        homeTeam = await prisma.team.findFirst({
                            where: { name: teams.home.name, leagueId: league.id }
                        });
                    }
                }

                let awayTeam = await prisma.team.findFirst({
                    where: { name: teams.away.name, leagueId: league.id }
                });
                if (!awayTeam) {
                    try {
                        awayTeam = await prisma.team.create({
                            data: { name: teams.away.name, logo: teams.away.logo, leagueId: league.id }
                        });
                    } catch (e) {
                        awayTeam = await prisma.team.findFirst({
                            where: { name: teams.away.name, leagueId: league.id }
                        });
                    }
                }

                if (!homeTeam || !awayTeam) continue;

                // Find existing match by externalId OR by teams and same day
                const matchDate = new Date(matchInfo.date);
                const dayStart = new Date(matchDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(matchDate);
                dayEnd.setHours(23, 59, 59, 999);

                const existingMatch = await prisma.match.findFirst({
                    where: {
                        OR: [
                            { externalId: matchInfo.id },
                            {
                                homeTeamId: homeTeam.id,
                                awayTeamId: awayTeam.id,
                                date: {
                                    gte: dayStart,
                                    lte: dayEnd
                                }
                            }
                        ]
                    }
                });

                const homeScore = matchInfo.goals?.home ?? null;
                const awayScore = matchInfo.goals?.away ?? null;
                const status = mapApiStatus(matchInfo.status.short);

                if (!existingMatch) {
                    await prisma.match.create({
                        data: {
                            date: matchDate,
                            status: status,
                            leagueId: league.id,
                            homeTeamId: homeTeam.id,
                            awayTeamId: awayTeam.id,
                            homeScore: homeScore,
                            awayScore: awayScore,
                            externalId: matchInfo.id
                        }
                    });
                    count++;
                } else {
                    // Check if another match ALREADY has this externalId to avoid unique constraint error
                    if (existingMatch.externalId !== matchInfo.id) {
                        const conflict = await prisma.match.findFirst({
                            where: {
                                externalId: matchInfo.id,
                                id: { not: existingMatch.id }
                            }
                        });

                        if (conflict) {
                            // If there's a conflict, it means we have two records for the same match.
                            // We delete the one without/wrong ID and will sync the correct one.
                            await prisma.match.delete({ where: { id: existingMatch.id } });
                            continue; // Skip to next, the next sync iteration or finding by ID will handle it
                        }
                    }

                    // Update existing match and ensure externalId is synced
                    await prisma.match.update({
                        where: { id: existingMatch.id },
                        data: {
                            status: status,
                            homeScore: homeScore,
                            awayScore: awayScore,
                            date: matchDate,
                            externalId: matchInfo.id // Sync/Heal the ID
                        }
                    });
                    existingCount++;
                }
            }
        }

        // HEAL STEP: Fix finished matches with missing scores
        // Find existing matches that are FINISHED but have null scores (the "fictitious 0-0" issue)
        const brokenMatches = await prisma.match.findMany({
            where: {
                status: MatchStatus.FINISHED,
                OR: [
                    { homeScore: null },
                    { awayScore: null }
                ],
                externalId: { not: null }
            },
            take: 20 // Fix batch of 20 at a time to be safe with API limits
        });

        if (brokenMatches.length > 0) {
            console.log(`Healing ${brokenMatches.length} broken matches with missing scores...`);
            const ids = brokenMatches.map(m => m.externalId as number);

            try {
                const freshData = await sportsAPI.getFixturesByIds(ids);

                for (const data of freshData) {
                    const match = brokenMatches.find(m => m.externalId === data.fixture.id);
                    if (match && data.goals.home !== null && data.goals.away !== null) {
                        await prisma.match.update({
                            where: { id: match.id },
                            data: {
                                homeScore: data.goals.home,
                                awayScore: data.goals.away,
                                status: mapApiStatus(data.fixture.status.short)
                            }
                        });
                        existingCount++;
                        console.log(`Healed match ${match.id}: ${data.goals.home}-${data.goals.away}`);
                    }
                }
            } catch (err) {
                console.error("Error healing matches:", err);
            }
        }

        console.log(`Synchronization finished. New: ${count}, Updated: ${existingCount}`);
        revalidatePath("/admin/matches");
        return { success: true, count, updated: existingCount };
    } catch (error: any) {
        console.error("Sync Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getMatches(leagueId?: string, filter: 'upcoming' | 'today' | 'finished' = 'upcoming') {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const whereClause: any = {};

        if (leagueId && leagueId !== 'all') {
            whereClause.leagueId = leagueId;
        }

        switch (filter) {
            case 'today':
                whereClause.date = {
                    gte: todayStart,
                    lte: todayEnd,
                };
                break;
            case 'upcoming':
                // Include EVERYTHING from today onwards for better visibility
                whereClause.date = {
                    gte: todayStart,
                };
                whereClause.status = {
                    in: [MatchStatus.SCHEDULED, MatchStatus.LIVE]
                };
                break;
            case 'finished':
                whereClause.status = MatchStatus.FINISHED;
                // Show finished matches from the last 5 days
                const fiveDaysAgo = new Date(todayStart);
                fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
                whereClause.date = {
                    gte: fiveDaysAgo,
                    lte: todayEnd,
                };
                break;
        }

        const matches = await prisma.match.findMany({
            where: whereClause,
            take: (leagueId === 'all' || !leagueId) ? 10 : undefined,
            orderBy: { date: 'asc' },
            include: {
                league: true,
                homeTeam: true,
                awayTeam: true,
                predictions: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        // LIVE SCORE ENHANCEMENT
        // If filtering by 'today' or 'upcoming', fetch fresh data for matches happening today
        if (filter === 'today' || filter === 'upcoming') {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // Filter matches that have externalId and are nominally "today"
            const matchesToCheck = matches.filter((m: any) => {
                const matchDate = m.date.toISOString().split('T')[0];
                return m.externalId && matchDate === todayStr;
            });

            if (matchesToCheck.length > 0) {
                const ids = matchesToCheck.map((m: any) => m.externalId as number);
                try {
                    // Fetch live data from API-Football
                    const liveData = await sportsAPI.getFixturesByIds(ids);

                    // Merge live data into matches
                    for (const match of matches) {
                        const freshData = liveData.find((d: any) => d.fixture.id === match.externalId);
                        if (freshData) {
                            // Update display values in-memory
                            match.status = mapApiStatus(freshData.fixture.status.short);
                            match.homeScore = freshData.goals.home;
                            match.awayScore = freshData.goals.away;

                            // If match JUST finished, save to DB as requested
                            if (match.status === MatchStatus.FINISHED) {
                                await prisma.match.update({
                                    where: { id: match.id },
                                    data: {
                                        status: MatchStatus.FINISHED,
                                        homeScore: freshData.goals.home,
                                        awayScore: freshData.goals.away
                                    }
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error fetching live scores:", err);
                    // Fail silently and return DB data
                }
            } // Close if matchesToCheck
        } // Close if filter
        return { success: true, matches };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generatePrediction(matchId: string) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { homeTeam: true, awayTeam: true, league: true }
        });

        if (!match) return { success: false, error: "Partido no encontrado" };
        if (!match.externalId) return { success: false, error: "Este partido no tiene un ID externo para análisis profundo" };

        // Fetch predictions to get form and other pro data
        const predictionsData = await sportsAPI.getPredictions(match.externalId);

        const analysis = await aiService.analyzeMatch({
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            league: match.league.name,
            date: match.date.toISOString(),
            externalId: match.externalId || undefined,
            leagueId: match.league.externalId || undefined,
            status: match.status,
            homeScore: match.homeScore,
            awayScore: match.awayScore
        });

        const prediction = await prisma.prediction.create({
            data: {
                matchId: match.id,
                result: analysis.result,
                confidence: analysis.confidence,
                analysis: analysis.analysis,
                aiModel: analysis.aiModel,
                bettingTips: analysis.bettingTips as any,
                cardsAnalysis: analysis.cardsAnalysis as any,
                homeForm: predictionsData?.teams?.home?.league?.form || null,
                awayForm: predictionsData?.teams?.away?.league?.form || null,
                stats: {
                    homeGoals: predictionsData?.teams?.home?.league?.goals || null,
                    awayGoals: predictionsData?.teams?.away?.league?.goals || null,
                } as any,
                isPremium: true
            } as any
        });

        revalidatePath("/admin/matches");
        return { success: true, prediction };

    } catch (error: any) {
        console.error("Prediction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getWinRate() {
    try {
        // Simplified query: Count WINS and divide by TOTAL VALIDATED (WINS + LOSSES)
        const wins = await prisma.prediction.count({
            where: {
                status: PredictionStatus.WIN,
                match: { status: MatchStatus.FINISHED }
            }
        });

        const losses = await prisma.prediction.count({
            where: {
                status: PredictionStatus.LOSS,
                match: { status: MatchStatus.FINISHED }
            }
        });

        const total = wins + losses;
        const rate = total > 0 ? Math.round((wins / total) * 100) : 0;

        return { success: true, rate, total: total };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
