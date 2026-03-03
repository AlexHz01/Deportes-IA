"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_PROMPT = `Eres un experto analista de apuestas deportivas con 20 años de experiencia. 
Tu tarea es analizar el siguiente partido de fútbol y proporcionar una predicción precisa. 
Debes considerar el rendimiento reciente de los equipos, porterías a cero, promedio de goles, y contexto de la liga.
Responde SIEMPRE en formato JSON con la siguiente estructura:
{
  "result": "Victoria Local/Empate/Victoria Visitante",
  "confidence": 0.85,
  "analysis": "Explicación detallada del por qué de la predicción...",
  "bettingTips": {
    "pick": "Gana Local + Más de 1.5 goles",
    "odds": "1.85",
    "risk": "Bajo/Medio/Alto"
  }
}`;

export async function getAIConfig() {
    try {
        let config = await prisma.aIConfig.findUnique({
            where: { key: "SYSTEM_PROMPT" },
        });

        if (!config) {
            config = await prisma.aIConfig.create({
                data: {
                    key: "SYSTEM_PROMPT",
                    value: DEFAULT_PROMPT,
                },
            });
        }

        return { success: true, config };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAIConfig(value: string) {
    try {
        const config = await prisma.aIConfig.upsert({
            where: { key: "SYSTEM_PROMPT" },
            update: { value },
            create: {
                key: "SYSTEM_PROMPT",
                value,
            },
        });

        revalidatePath("/admin/settings");
        return { success: true, config };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
