import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PredictionValidator } from "@/services/prediction-validator";
import { PredictionStatus, MatchStatus, Match, Prediction } from "@prisma/client";

export async function GET(req: NextRequest) {
    try {
        // 1. Find pending predictions for finished matches
        const pendingPredictions = await prisma.prediction.findMany({
            where: {
                status: PredictionStatus.PENDING,
                match: {
                    status: MatchStatus.FINISHED
                }
            },
            include: {
                match: true
            }
        }) as (Prediction & { match: Match })[];

        if (pendingPredictions.length === 0) {
            return NextResponse.json({ message: "No pending predictions to validate", count: 0 });
        }

        let updatedCount = 0;
        let wins = 0;
        let losses = 0;
        const debug: any[] = [];


        // 2. Validate each prediction
        for (const prediction of pendingPredictions) {
            const newStatus = PredictionValidator.validate(prediction, prediction.match);

            if (newStatus !== PredictionStatus.PENDING) {
                await prisma.prediction.update({
                    where: { id: prediction.id },
                    data: { status: newStatus }
                });
                updatedCount++;
                if (newStatus === PredictionStatus.WIN) wins++;
                if (newStatus === PredictionStatus.LOSS) losses++;
                debug.push({ id: prediction.id, match: prediction.match.id, status: newStatus, msg: "Updated" });
            } else {
                debug.push({
                    id: prediction.id,
                    match: prediction.match.id,
                    msg: "Skipped - Scores Null?",
                    scores: { home: prediction.match.homeScore, away: prediction.match.awayScore }
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: pendingPredictions.length,
            updated: updatedCount,
            results: { wins, losses },
            debug // Expose debug info
        });

    } catch (error: any) {
        console.error("Validation Job Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
