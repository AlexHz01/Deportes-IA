import { Match, Prediction, PredictionStatus } from "@prisma/client";

export class PredictionValidator {
    static validate(prediction: Prediction, match: Match): PredictionStatus {
        if (match.homeScore === null || match.awayScore === null) {
            return PredictionStatus.PENDING;
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
            const line = this.extractLine(result);
            if (line !== null) isWin = totalGoals > line;
        }
        else if (result.includes("menos de")) {
            const line = this.extractLine(result);
            if (line !== null) isWin = totalGoals < line;
        }

        // 4. Ambos Anotan (BTTS)
        else if (result.includes("ambos anotan") || result.includes("btst") || result.includes("sí")) {
            isWin = homeScore > 0 && awayScore > 0;
        }
        else if (result.includes("no ambos anotan") || (result.includes("ambos anotan") && result.includes("no"))) {
            isWin = homeScore === 0 || awayScore === 0;
        }

        // Void cases (e.g. Draw No Bet, Asian Handicap - not fully implemented but structure ready)
        if (isVoid) return PredictionStatus.VOID;

        return isWin ? PredictionStatus.WIN : PredictionStatus.LOSS;
    }

    private static extractLine(text: string): number | null {
        const match = text.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : null;
    }
}
