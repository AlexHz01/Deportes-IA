"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSports() {
    try {
        const sports = await prisma.sport.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { leagues: true } } },
        });
        return { success: true, sports };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createSport(formData: FormData) {
    const name = formData.get("name") as string;
    const image = formData.get("image") as string;

    if (!name) {
        return { success: false, error: "El nombre es obligatorio" };
    }

    try {
        const sport = await prisma.sport.create({
            data: { name, image },
        });
        revalidatePath("/admin/sports");
        return { success: true, sport };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSport(id: string) {
    try {
        await prisma.sport.delete({ where: { id } });
        revalidatePath("/admin/sports");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
