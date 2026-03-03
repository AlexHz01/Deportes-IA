"use server";

import prisma from "@/lib/prisma";

export async function bootstrapAdmin(email: string) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                plan: 'GOLD'
            }
        });
        return { success: true, user: user.email };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
