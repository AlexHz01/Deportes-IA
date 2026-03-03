"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./auth-actions";

const privateKey = process.env.CONEKTA_PRIVATE_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const CONEKTA_API_URL = "https://api.conekta.io";

const PLAN_PRICES: Record<string, { amount: number, name: string }> = {
    SILVER: { amount: 19000, name: "Plan Silver Pro" }, // 190.00 MXN = 19000 cents
    GOLD: { amount: 49000, name: "Plan Gold Elite" },   // 490.00 MXN = 49000 cents
};

async function conektaFetch(endpoint: string, options: any = {}) {
    // Basic Auth: base64(privateKey + ":")
    const auth = Buffer.from(`${privateKey}:`).toString('base64');

    const response = await fetch(`${CONEKTA_API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Accept": "application/vnd.conekta-v2.1.0+json",
            "Content-Type": "application/json",
            "Authorization": `Basic ${auth}`,
            ...options.headers,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.details?.[0]?.message || data.message || "Error calling Conekta API");
    }
    return data;
}

export async function createConektaCheckout(plan: string) {
    const userSession = await getCurrentUser();
    if (!userSession) {
        return { error: "Debes iniciar sesión para suscribirte" };
    }

    if (!privateKey) {
        return { error: "Configuración de Conekta incompleta (API Key faltante)" };
    }

    try {
        const dbUser = await (prisma as any).user.findUnique({
            where: { id: userSession.userId }
        });

        if (!dbUser) return { error: "Usuario no encontrado" };

        let customerId = dbUser.conektaCustomerId;

        // 1. Create Conekta Customer if not exists
        if (!customerId) {
            try {
                // Check if we need to create a customer
                const customerResponse = await conektaFetch("/customers", {
                    method: "POST",
                    body: JSON.stringify({
                        name: dbUser.name || "Usuario Deporte IA",
                        email: dbUser.email,
                        phone: "+5215555555555", // Dummy requirement for some API versions
                        metadata: { userId: dbUser.id }
                    })
                });
                customerId = customerResponse.id;

                await (prisma as any).user.update({
                    where: { id: dbUser.id },
                    data: { conektaCustomerId: customerId }
                });
            } catch (err: any) {
                console.error("Conekta Customer Error:", err.message);
                return { error: `Error al crear cliente: ${err.message}` };
            }
        }

        const planConfig = PLAN_PRICES[plan];
        if (!planConfig) {
            return { error: "Plan no válido" };
        }

        // 2. Create Order with Checkout
        const orderRequest = {
            currency: "MXN",
            customer_info: {
                customer_id: customerId
            },
            line_items: [{
                name: planConfig.name,
                unit_price: planConfig.amount,
                quantity: 1
            }],
            checkout: {
                allowed_payment_methods: ["card", "cash", "bank_transfer"],
                type: "HostedPayment",
                success_url: `${APP_URL}/admin/profile?payment=success`,
                failure_url: `${APP_URL}/admin/profile?payment=failed`,
                monthly_installments_enabled: false,
                redirection_time: 5 // Min 4 seconds
            },
            metadata: {
                userId: dbUser.id,
                plan: plan
            }
        };

        const orderResponse = await conektaFetch("/orders", {
            method: "POST",
            body: JSON.stringify(orderRequest)
        });

        const checkoutUrl = orderResponse.checkout.url;

        return { url: checkoutUrl };

    } catch (error: any) {
        console.error("Conekta Error:", error.message);
        return { error: `Error de Conekta: ${error.message}` };
    }
}

export async function checkPaymentStatus() {
    const userSession = await getCurrentUser();
    if (!userSession) return { error: "No sesión" };

    try {
        const dbUser = await (prisma as any).user.findUnique({
            where: { id: userSession.userId }
        });

        if (!dbUser?.conektaCustomerId) return { error: "No cliente Conekta" };

        // Get last order for customer
        const response = await conektaFetch(`/orders?customer_id=${dbUser.conektaCustomerId}&limit=1&sort=created_at.desc`);
        const lastOrder = response.data?.[0];

        if (lastOrder && lastOrder.payment_status === 'paid') {
            const plan = lastOrder.metadata?.plan;

            // Only update if plan is different
            if (plan && dbUser.plan !== plan) {
                await (prisma as any).user.update({
                    where: { id: dbUser.id },
                    data: { plan: plan }
                });
                return { success: true, plan: plan, status: 'paid' };
            }
            return { success: true, plan: dbUser.plan, status: 'paid' };
        }

        return { success: false, status: lastOrder?.payment_status || 'unknown' };
    } catch (error: any) {
        console.error("Check Status Error:", error.message);
        return { error: error.message };
    }
}
