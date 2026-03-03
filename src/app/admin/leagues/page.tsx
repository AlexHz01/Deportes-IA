"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Trophy, Globe, RefreshCw, Zap, Star, Crown } from "lucide-react";
import { createLeague, deleteLeague, getLeagues, updateLeague } from "@/actions/league-actions";
import { getSports } from "@/actions/sport-actions";
import { cn } from "@/lib/utils";

interface League {
    id: string;
    name: string;
    country: string | null;
    tier: number;
    sport: { name: string };
    _count: { teams: number; matches: number };
}

interface Sport {
    id: string;
    name: string;
}

export default function LeaguesPage() {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [updatingTier, setUpdatingTier] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        const [leaguesData, sportsData] = await Promise.all([
            getLeagues(),
            getSports(),
        ]);

        if (leaguesData.success && leaguesData.leagues) {
            setLeagues(leaguesData.leagues as any);
        }
        if (sportsData.success && sportsData.sports) {
            setSports(sportsData.sports);
        }
        setIsLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Estás seguro de eliminar esta liga?")) return;
        const result = await deleteLeague(id);
        if (result.success) {
            loadData();
        } else {
            alert("Error al eliminar");
        }
    }

    async function handleTierChange(id: string, newTier: string) {
        setUpdatingTier(id);
        const result = await updateLeague(id, { tier: newTier });
        if (result.success) {
            setLeagues(leagues.map(l => l.id === id ? { ...l, tier: parseInt(newTier) } : l));
        } else {
            alert("Error al actualizar el nivel");
        }
        setUpdatingTier(null);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsCreating(true);
        const formData = new FormData(e.currentTarget);
        const result = await createLeague(formData);

        if (result.success) {
            (e.target as HTMLFormElement).reset();
            loadData();
        } else {
            alert(result.error || "Error al crear");
        }
        setIsCreating(false);
    }

    const getTierConfig = (tier: number) => {
        switch (tier) {
            case 1:
                return { label: 'Elite (Gold)', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', icon: Crown };
            case 2:
                return { label: 'Pro (Silver)', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: Star };
            default:
                return { label: 'Basic (Free)', bg: 'bg-zinc-50', text: 'text-zinc-600', border: 'border-zinc-100', icon: Zap };
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">
                    Gestión de <span className="text-blue-600">Ligas</span>
                </h2>
                <p className="text-zinc-500 font-medium">
                    Gestiona las competiciones y torneos de la plataforma.
                </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
                {/* Formulario de Creación */}
                <div className="md:col-span-1">
                    <div className="p-8 bg-white rounded-[32px] shadow-sm border border-zinc-200 sticky top-8">
                        <h3 className="font-black text-lg mb-6 text-zinc-900 flex items-center gap-3">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Nueva Liga
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    placeholder="Ej: La Liga"
                                    className="w-full px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold placeholder:text-zinc-300"
                                />
                            </div>

                            <div>
                                <label htmlFor="country" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                    País
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    id="country"
                                    placeholder="Ej: España"
                                    className="w-full px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold placeholder:text-zinc-300"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sportId" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                        Deporte
                                    </label>
                                    <select
                                        name="sportId"
                                        id="sportId"
                                        required
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold cursor-pointer text-xs"
                                    >
                                        <option value="">Deporte...</option>
                                        {sports.map(sport => (
                                            <option key={sport.id} value={sport.id}>{sport.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="tier" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                        Plan (Tier)
                                    </label>
                                    <select
                                        name="tier"
                                        id="tier"
                                        required
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold cursor-pointer text-xs"
                                    >
                                        <option value="3">Basic (Free)</option>
                                        <option value="2">Pro (Silver)</option>
                                        <option value="1">Elite (Gold)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className={cn(
                                    "w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl text-sm font-black text-white bg-zinc-900 hover:bg-black focus:outline-none transition-all transform hover:scale-[1.02] active:scale-95",
                                    isCreating && "opacity-75 cursor-not-allowed"
                                )}
                            >
                                {isCreating ? "Guardando..." : "Guardar Liga"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista de Ligas */}
                <div className="md:col-span-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cargando ligas...</p>
                        </div>
                    ) : leagues.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[32px] border-2 border-dashed border-zinc-200">
                            <Globe className="mx-auto h-16 w-16 text-zinc-200 mb-6" />
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">No hay ligas registradas</h3>
                            <p className="mt-2 text-sm text-zinc-400 font-medium tracking-tight">Crea una nueva liga para comenzar a monitorizar partidos.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {leagues.map((league) => {
                                const tierInfo = getTierConfig(league.tier);
                                const TierIcon = tierInfo.icon;

                                return (
                                    <div
                                        key={league.id}
                                        className="relative flex flex-col p-6 bg-white rounded-[28px] border border-zinc-200 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all group overflow-hidden"
                                    >
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="flex-shrink-0">
                                                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                                                    <Trophy className="h-7 w-7" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight truncate pr-8">{league.name}</p>
                                                    <button
                                                        onClick={() => handleDelete(league.id)}
                                                        className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center text-[10px] text-zinc-400 font-black uppercase tracking-widest gap-2">
                                                    <span className="bg-zinc-100 px-2 py-0.5 rounded-full">{league.country || 'Global'}</span>
                                                    <span>•</span>
                                                    <span className="text-blue-600">{league.sport.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-zinc-50">
                                            <div className="flex items-center gap-4">
                                                <div className="text-[10px] font-black text-zinc-500 flex flex-col">
                                                    <span className="text-zinc-300 text-[8px] uppercase tracking-tighter">Equipos</span>
                                                    {league._count.teams}
                                                </div>
                                                <div className="w-px h-6 bg-zinc-100" />
                                                <div className="text-[10px] font-black text-zinc-500 flex flex-col">
                                                    <span className="text-zinc-300 text-[8px] uppercase tracking-tighter">Partidos</span>
                                                    {league._count.matches}
                                                </div>
                                            </div>

                                            <div className="relative">
                                                {updatingTier === league.id && (
                                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                                                        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                                                    </div>
                                                )}
                                                <label className="text-[8px] font-black text-zinc-300 uppercase absolute -top-2 left-2 px-1 bg-white">Nivel del Plan</label>
                                                <select
                                                    value={league.tier}
                                                    onChange={(e) => handleTierChange(league.id, e.target.value)}
                                                    className={cn(
                                                        "w-full pl-8 pr-2 py-2 rounded-xl border appearance-none font-black text-[10px] uppercase tracking-wider outline-none transition-all cursor-pointer",
                                                        tierInfo.bg,
                                                        tierInfo.text,
                                                        tierInfo.border
                                                    )}
                                                >
                                                    <option value="3">Tier 3 (Basic)</option>
                                                    <option value="2">Tier 2 (Silver)</option>
                                                    <option value="1">Tier 1 (Elite)</option>
                                                </select>
                                                <TierIcon className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5", tierInfo.text)} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
