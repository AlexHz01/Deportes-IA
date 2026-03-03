"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function register(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password) {
        return { error: "Email y contraseña son obligatorios" };
    }

    try {
        // @ts-ignore
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: "El usuario ya existe" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // @ts-ignore
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "USER",
                plan: "FREE",
            },
        });

        return { success: true };
    } catch (error: any) {
        return { error: "Error al registrar: " + error.message };
    }
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email y contraseña son obligatorios" };
    }

    try {
        // @ts-ignore
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { error: "Usuario no encontrado" };
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { error: "Contraseña incorrecta" };
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, plan: user.plan },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        (await cookies()).set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 semana
        });

        return { success: true, user: { name: user.name, role: user.role, plan: user.plan } };
    } catch (error: any) {
        return { error: "Error al iniciar sesión: " + error.message };
    }
}

export async function logout() {
    (await cookies()).delete("auth_token");
    return { success: true };
}

export async function getCurrentUser() {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded;
    } catch {
        return null;
    }
}

export async function updatePlan(userId: string, plan: string) {
    try {
        // @ts-ignore
        const user = await prisma.user.update({
            where: { id: userId },
            data: { plan }
        });

        // Regenerar cookie con el nuevo plan
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, plan: user.plan },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        (await cookies()).set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        });

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUserProfile() {
    const session = await getCurrentUser();
    if (!session) return null;

    try {
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                plan: true,
                createdAt: true,
            }
        });
        return user;
    } catch (error) {
        return null;
    }
}
