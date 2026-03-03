import {
    Users,
    Trophy,
    Activity,
    TrendingUp,
} from "lucide-react";
import prisma from "@/lib/prisma";

import { getCurrentUser } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth");

    // Fetch real data from Prisma
    const [leaguesCount, matchesCount, predictionsCount, usersCount, finishedMatches] = await Promise.all([
        prisma.league.count(),
        prisma.match.count({
            where: {
                status: {
                    in: ['SCHEDULED', 'LIVE']
                }
            }
        }),
        prisma.prediction.count(),
        prisma.user.count(),
        prisma.match.findMany({
            where: {
                status: 'FINISHED',
                predictions: { some: {} }
            },
            include: {
                predictions: { take: 1, orderBy: { createdAt: 'desc' } }
            }
        })
    ]);

    // Calculate real Win Rate from validated predictions
    let wins = 0;
    let totalValidated = 0;

    finishedMatches.forEach((match: any) => {
        const pred = match.predictions[0];
        if (!pred || match.homeScore === null || match.awayScore === null) return;

        // Use the stored status if available (validated by cron), otherwise fallback to manual check
        if (pred.status === 'WIN') {
            wins++;
            totalValidated++;
        } else if (pred.status === 'LOSS') {
            totalValidated++;
        } else if (pred.status === 'PENDING') {
            // Fallback for pending validation
            const result = pred.result.toLowerCase();
            let isWin = false;

            if (result.includes("local") && !result.includes("empate")) isWin = match.homeScore > match.awayScore;
            else if (result.includes("visitante") && !result.includes("empate")) isWin = match.awayScore > match.homeScore;
            else if (result.includes("empate") && !result.includes("local") && !result.includes("visitante")) isWin = match.homeScore === match.awayScore;

            if (isWin) wins++;
            totalValidated++;
        }
    });

    const winRate = totalValidated > 0 ? Math.round((wins / totalValidated) * 100) : 0;

    const stats = [
        {
            title: "Usuarios Totales",
            value: usersCount.toString(),
            change: "Creciendo",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Tasa de Acierto",
            value: `${winRate}%`,
            change: "Real-time",
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-100 dark:bg-green-900/20",
        },
        {
            title: "Partidos Activos",
            value: matchesCount.toString(),
            change: "Hoy",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-100 dark:bg-purple-900/20",
        },
        {
            title: "Predicciones IA",
            value: predictionsCount.toString(),
            change: "Total",
            icon: Trophy,
            color: "text-yellow-500",
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
        },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">
                    Dashboard <span className="text-blue-600">PRO</span>
                </h2>
                <p className="text-zinc-500 font-medium">
                    Bienvenido al panel de control de AnalistaPRO.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="p-8 bg-white rounded-[32px] shadow-sm border border-zinc-200 group hover:border-blue-500/30 transition-all cursor-default"
                        >
                            <div className="flex items-center justify-between pb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    {stat.title}
                                </h3>
                                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <div className="text-3xl font-black text-zinc-900">
                                    {stat.value}
                                </div>
                                <span className="text-xs text-green-600 font-black uppercase tracking-tighter bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-white rounded-[40px] shadow-sm border border-zinc-200 p-8">
                    <h3 className="font-black text-lg mb-8 text-zinc-900 flex items-center gap-3">
                        <div className="w-2 h-6 bg-blue-600 rounded-full" />
                        Actividad Reciente
                    </h3>
                    <div className="h-[250px] flex items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-100 rounded-[32px]">
                        <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">Estadísticas vinculadas correctamente</p>
                    </div>
                </div>
                <div className="col-span-3 bg-white rounded-[40px] shadow-sm border border-zinc-200 p-8">
                    <h3 className="font-black text-lg mb-8 text-zinc-900 flex items-center gap-3">
                        <div className="w-2 h-6 bg-green-600 rounded-full" />
                        Partidos Destacados
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-zinc-50 border border-zinc-100 rounded-[32px] p-8 text-center">
                            <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mb-2">Monitorización en Vivo</p>
                            <p className="text-sm text-zinc-500 font-medium">
                                Los partidos de tus ligas Elite se actualizan automáticamente cada 60 segundos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
