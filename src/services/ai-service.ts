import prisma from "@/lib/prisma";
import { sportsAPI } from "./sports-api";

interface MatchData {
    homeTeam: string;
    awayTeam: string;
    league: string;
    date: string;
    externalId?: number; // Fixture ID from API-Football
    leagueId?: number;   // League ID from API-Football
    odds?: { home: number; draw: number; away: number };
    status?: string;
    homeScore?: number | null;
    awayScore?: number | null;
}

export class AIService {
    private async getSystemPrompt(): Promise<string> {
        const config = await prisma.aIConfig.findUnique({
            where: { key: "SYSTEM_PROMPT" },
        });

        return config?.value || "Analiza el partido de fútbol y da una predicción de apuestas.";
    }

    async analyzeMatch(match: MatchData) {
        try {
            const systemPrompt = await this.getSystemPrompt();
            const apiKey = process.env.DEEPSEEK_API_KEY;

            if (!apiKey) {
                throw new Error("DEEPSEEK_API_KEY no configurada en .env");
            }

            const { homeTeam, awayTeam, league, date, externalId, leagueId, status, homeScore, awayScore } = match;

            let extraDataContext = "";

            if (externalId) {
                try {
                    const [lineups, injuries, predictions] = await Promise.all([
                        sportsAPI.getLineups(externalId),
                        sportsAPI.getInjuries(externalId),
                        sportsAPI.getPredictions(externalId)
                    ]);

                    if (lineups && lineups.length > 0) {
                        extraDataContext += `\nALINEACIONES:\n${JSON.stringify(lineups, null, 1)}`;
                    }
                    if (injuries && injuries.length > 1) {
                        extraDataContext += `\nLESIONADOS/AUSENCIAS:\n${JSON.stringify(injuries, null, 1)}`;
                    }
                    if (predictions) {
                        const homeForm = predictions?.teams?.home?.league?.form || "N/A";
                        const awayForm = predictions?.teams?.away?.league?.form || "N/A";
                        const homeGoals = predictions?.teams?.home?.league?.goals || {};
                        const awayGoals = predictions?.teams?.away?.league?.goals || {};

                        extraDataContext += `\nDATOS COMPARATIVOS Y RENDIMIENTO:
- Forma Local (últimos 5): ${homeForm}
- Forma Visitante (últimos 5): ${awayForm}
- Promedio Goles Local: F ${homeGoals.for?.average || "?"}, C ${homeGoals.against?.average || "?"}
- Promedio Goles Visitante: F ${awayGoals.for?.average || "?"}, C ${awayGoals.against?.average || "?"}
- H2H y Comparativa Directa: ${JSON.stringify(predictions.comparison, null, 1)}`;
                    }
                } catch (e) {
                    console.error("Error fetching pro data:", e);
                }
            }

            let promptContext = `Analiza el partido de fútbol y proporciona una predicción detallada.`;

            if (status === 'FINISHED') {
                promptContext = `ESTE PARTIDO YA FINALIZÓ. Resultado: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}.
                Realiza un ANÁLISIS POST-PARTIDO explicando por qué se dio este resultado basándote en las estadísticas previas.
                Valida si la predicción lógica hubiera sido acertada.`;
            }

            const userContent = `${promptContext}
Partido: ${homeTeam} vs ${awayTeam}
Liga: ${league}
Fecha: ${date}
${extraDataContext}

IMPORTANTE: 
1. Incluye en tu análisis el porcentaje de probabilidad de tarjetas amarillas y faltas basado en la intensidad y el histórico.
2. La respuesta debe ser un objeto JSON con los campos: result, confidence, analysis, bettingTips (pick, odds, risk), cardsAnalysis (yellowCards, fouls, reason).`;

            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userContent },
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error de DeepSeek: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const content = JSON.parse(data.choices[0].message.content);

            return {
                result: content.result,
                confidence: content.confidence,
                analysis: content.analysis,
                bettingTips: {
                    pick: content.bettingTips?.pick || "Sin pick",
                    odds: content.bettingTips?.odds || "N/A",
                    risk: content.bettingTips?.risk || "Medio",
                },
                cardsAnalysis: {
                    yellowCards: content.cardsAnalysis?.yellowCards || "N/A",
                    fouls: content.cardsAnalysis?.fouls || "N/A",
                    reason: content.cardsAnalysis?.reason || "",
                },
                aiModel: "DeepSeek (Advanced Analysis)",
            };
        } catch (error: any) {
            console.error("AI Analysis Error:", error);
            throw error;
        }
    }
}

export const aiService = new AIService();
