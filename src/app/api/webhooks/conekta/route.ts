import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch (err) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log(`[Conekta Webhook] Received event: ${body.type}`);

    try {
        // Conekta Event Types: https://developers.conekta.com/v2.1.0/reference/webhooks-1
        switch (body.type) {
            case "order.paid": {
                const order = body.data.object;
                const userId = order.metadata?.userId;
                const plan = order.metadata?.plan;

                if (userId && plan) {
                    await (prisma as any).user.update({
                        where: { id: userId },
                        data: {
                            plan: plan,
                        }
                    });
                    console.log(`Plan ${plan} activado para usuario ${userId} vía Conekta`);
                }
                break;
            }

            // If using recurring subscriptions specifically via API
            case "subscription.paid": {
                const subscription = body.data.object;
                const userId = subscription.metadata?.userId;
                const plan = subscription.metadata?.plan;

                if (userId && plan) {
                    await (prisma as any).user.update({
                        where: { id: userId },
                        data: {
                            plan: plan,
                            conektaSubscriptionId: subscription.id
                        }
                    });
                }
                break;
            }

            case "subscription.canceled": {
                const subscription = body.data.object;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await (prisma as any).user.update({
                        where: { id: userId },
                        data: {
                            plan: "FREE",
                            conektaSubscriptionId: null
                        }
                    });
                    console.log(`Suscripción Conekta cancelada para usuario ${userId}`);
                }
                break;
            }

            default:
                console.log(`[Conekta Webhook] Unhandled event type: ${body.type}`);
        }
    } catch (error: any) {
        console.error(`[Conekta Webhook Error]: ${error.message}`);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
