"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth-actions";

export async function getUsers() {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: "No autorizado" };
    }

    try {
        // @ts-ignore
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                createdAt: true,
            }
        });
        return { success: true, users };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUser(userId: string, data: { role?: any, plan?: any }) {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: "No autorizado" };
    }

    try {
        // @ts-ignore
        await prisma.user.update({
            where: { id: userId },
            data
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId: string) {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: "No autorizado" };
    }

    try {
        // @ts-ignore
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
