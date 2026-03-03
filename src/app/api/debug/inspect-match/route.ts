import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sportsAPI } from "@/services/sports-api";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "No match ID provided" });

    const match = await prisma.match.findUnique({
        where: { id },
        include: {
            league: true,
            homeTeam: true,
            awayTeam: true,
            predictions: true
        }
    });

    let apiData = null;
    if (match?.externalId) {
        try {
            const response = await sportsAPI.getFixturesByIds([match.externalId]);
            if (response && response.length > 0) {
                apiData = response[0];
            }
        } catch (error: any) {
            apiData = { error: error.message };
        }
    }

    return NextResponse.json({ dbMatch: match, apiData });
}
