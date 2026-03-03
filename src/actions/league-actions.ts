"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLeagues() {
    try {
        const leagues = await prisma.league.findMany({
            orderBy: { name: "asc" },
            include: {
                sport: true,
                _count: { select: { teams: true, matches: true } },
            },
        });
        console.log(`[getLeagues] Found ${leagues.length} leagues`);
        return { success: true, leagues };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createLeague(formData: FormData) {
    const name = formData.get("name") as string;
    const country = formData.get("country") as string;
    const sportId = formData.get("sportId") as string;
    const tier = parseInt(formData.get("tier") as string || "3");

    if (!name || !sportId) {
        return { success: false, error: "Nombre y Deporte son obligatorios" };
    }

    try {
        const league = await prisma.league.create({
            data: { name, country, sportId, tier },
        });
        revalidatePath("/admin/leagues");
        return { success: true, league };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeague(id: string, data: any) {
    try {
        // Handle tier specifically if it's a string
        if (data.tier && typeof data.tier === 'string') {
            data.tier = parseInt(data.tier);
        }

        const league = await prisma.league.update({
            where: { id },
            data,
        });
        revalidatePath("/admin/leagues");
        return { success: true, league };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteLeague(id: string) {
    try {
        await prisma.league.delete({ where: { id } });
        revalidatePath("/admin/leagues");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
