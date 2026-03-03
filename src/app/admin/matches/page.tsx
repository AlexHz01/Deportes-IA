"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Play, BrainCircuit, Trophy, Globe, MapPin, Search, ChevronRight, X, CheckCircle2, XCircle, TrendingUp, Users, Loader2 } from "lucide-react";
import { getMatches, syncMatches, generatePrediction, getWinRate } from "@/actions/match-actions";
import { getLeagues } from "@/actions/league-actions";
import { cn } from "@/lib/utils";
import { FormDots } from "@/components/matches/form-dots";
import { toast } from "react-toastify";
import { getCurrentUser, logout } from "@/actions/auth-actions";
import { createConektaCheckout } from "@/actions/conekta-actions";
import { useRouter } from "next/navigation";

interface Match {
    id: string;
    date: Date;
    status: string;
    homeTeam: { name: string; logo: string | null };
    awayTeam: { name: string; logo: string | null };
    league: { id: string; name: string; country: string | null; tier: number };
    homeScore: number | null;
    awayScore: number | null;
    predictions: any[];
}

interface League {
    id: string;
    name: string;
    country: string | null;
    tier: number;
}

const AMERICAS = ["Mexico", "USA", "Argentina", "Brazil"];
const EUROPE = ["Portugal", "Spain", "Netherlands", "Germany", "Italy", "England", "World", "Europe"];

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<'upcoming' | 'today' | 'finished'>('upcoming');
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
    const [user, setUser] = useState<any>(null);
    const [winRate, setWinRate] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        checkUser();
        loadData();
    }, []);

    async function checkUser() {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            router.push("/auth");
        } else {
            setUser(currentUser);
        }
    }

    useEffect(() => {
        loadMatches();
    }, [selectedLeague, statusFilter]);

    async function loadData() {
        const leaguesData = await getLeagues();
        if (leaguesData.success && leaguesData.leagues) {
            setLeagues(leaguesData.leagues as any);
        }

        const rateData = await getWinRate();
        if (rateData.success) {
            setWinRate(rateData.rate ?? 0);
        }
    }

    async function loadMatches() {
        setIsLoading(true);
        const result = await getMatches(selectedLeague, statusFilter);
        if (result.success && result.matches) {
            setMatches(result.matches as any);
        }
        setIsLoading(false);
    }

    const canAccess = (matchTier: number) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;

        // GOLD: All (1,2,3)
        // SILVER: Mid and Basic (2,3)
        // FREE: Basic only (3)
        if (user.plan === 'GOLD') return true;
        if (user.plan === 'SILVER' && matchTier >= 2) return true;
        if (user.plan === 'FREE' && matchTier >= 3) return true;

        return false;
    };

    const renderStat = (val: any) => {
        if (!val) return "N/A";
        if (typeof val === 'object') {
            return val.average ?? val.total ?? JSON.stringify(val);
        }
        return val;
    };

    async function handleSync() {
        setIsSyncing(true);
        // 1. Sync Matches from API
        const today = new Date().toISOString().split('T')[0];
        const result = await syncMatches(today);

        // 2. Validate Predictions (Calculate WinRate)
        try {
            const validateRes = await fetch('/api/cron/validate-predictions');
            const validateData = await validateRes.json();
            if (validateData.updated > 0) {
                toast.success(`Validación: ${validateData.updated} predicciones actualizadas`);
            }
        } catch (e) {
            console.error("Validation error", e);
        }

        if (result.success) {
            toast.success(`Sincronizados: ${result.count} nuevos, ${result.updated} actualizados`);
            loadMatches();
        } else {
            toast.error("Error al sincronizar: " + result.error);
        }
        setIsSyncing(false);
    }

    async function handleAnalyze(matchId: string) {
        setAnalyzingId(matchId);
        const result = await generatePrediction(matchId);
        if (result.success) {
            toast.success("¡Predicción generada con éxito!");
            loadMatches();
        } else {
            toast.error("Error al generar predicción: " + result.error);
        }
        setAnalyzingId(null);
    }

    async function handleUpgrade(plan: any) {
        setIsRedirecting(true);
        const result = await createConektaCheckout(plan);
        if (result.url) {
            window.location.href = result.url;
        } else {
            toast.error(result.error || "Error al conectar con Conekta");
            setIsRedirecting(false);
        }
    }

    const americasLeagues = leagues.filter(l => l.country && AMERICAS.includes(l.country));
    const europeLeagues = leagues.filter(l => l.country && EUROPE.includes(l.country) || (l.name.includes("UEFA") || l.country === "World"));
    const restLeagues = leagues.filter(l => !americasLeagues.some(al => al.id === l.id) && !europeLeagues.some(el => el.id === l.id));

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 md:p-8">
            {/* Premium Header */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">ANALISTA <span className="text-blue-500">PRO</span></h1>
                        <p className="text-gray-400 text-sm italic">Inteligencia Artificial para Ganadores</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm backdrop-blur-md">
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => router.push("/admin/users")}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 font-bold text-xs"
                        >
                            <Users className="w-4 h-4" />
                            <span>GESTIÓN DE USUARIOS</span>
                        </button>
                    )}
                    <button
                        onClick={() => router.push("/admin/profile")}
                        className="px-4 text-right hover:bg-zinc-50 rounded-xl py-1 transition-all group"
                        title="Ir a Mi Perfil"
                    >
                        <div className="text-sm font-semibold group-hover:text-blue-600 transition-colors text-zinc-700">{user?.email}</div>
                        <div className="text-[10px] uppercase tracking-widest text-blue-600 font-black">{user?.plan} PLAN</div>
                    </button>
                    <button
                        onClick={async () => { await logout(); router.push("/auth"); }}
                        className="p-3 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900"
                        title="Cerrar Sesión"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto">
                {/* Stats Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white border border-zinc-200 p-6 rounded-[32px] flex items-center gap-6 group hover:border-blue-500/30 transition-all cursor-default shadow-sm">
                        <div className="p-4 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-zinc-900">{winRate}%</div>
                            <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Win Rate Activo</div>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-[32px] flex items-center gap-6 group hover:border-blue-500/30 transition-all cursor-default shadow-sm">
                        <div className="p-4 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
                            <BrainCircuit className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-zinc-900">{matches.filter(m => m.predictions.length > 0).length}</div>
                            <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Análisis Generados</div>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-[32px] flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-purple-50 rounded-2xl group-hover:scale-110 transition-transform">
                                <RefreshCw className={cn("w-6 h-6 text-purple-600", isSyncing && "animate-spin")} />
                            </div>
                            <div>
                                <div className="text-lg font-black uppercase tracking-tight text-zinc-900">Datos en Vivo</div>
                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sincronización API</div>
                            </div>
                        </div>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="bg-purple-600 hover:bg-purple-700 p-3 rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50 text-white"
                        >
                            <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                        <select
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none appearance-none hover:border-blue-500/30 transition-all cursor-pointer font-medium text-zinc-700 shadow-sm"
                        >
                            <option value="all">Todas las Ligas</option>
                            <optgroup label="Américas">
                                {americasLeagues.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.country})</option>
                                ))}
                            </optgroup>
                            <optgroup label="Europa">
                                {europeLeagues.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.country})</option>
                                ))}
                            </optgroup>
                            <optgroup label="Otras">
                                {restLeagues.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.country})</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div className="bg-white p-1 rounded-2xl border border-zinc-200 flex shadow-sm">
                        {(['upcoming', 'today', 'finished'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={cn(
                                    "px-8 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap uppercase tracking-widest",
                                    statusFilter === f ? "bg-blue-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                {f === 'upcoming' ? 'Próximos' : f === 'today' ? 'Hoy' : 'Finalizados'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Matches List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] animate-pulse">Obteniendo datos de mercado...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="bg-white border border-zinc-200 rounded-[32px] p-24 text-center shadow-sm">
                        <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tight text-zinc-400">No hay partidos en esta categoría</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto">Prueba cambiando de liga o de filtro de tiempo para obtener nuevas oportunidades.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {matches.map((match) => {
                            const hasPrediction = match.predictions.length > 0;
                            const isAnalyzing = analyzingId === match.id;

                            return (
                                <div
                                    key={match.id}
                                    className="group relative bg-white border border-zinc-200 rounded-[32px] overflow-hidden hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-xl"
                                >
                                    {/* Match Header */}
                                    <div className="bg-zinc-50/50 p-4 border-b border-zinc-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                                <Globe className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                {match.league.name} • {match.league.country}
                                            </span>
                                            {match.league.tier <= 1 && (
                                                <span className="text-[9px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full font-black border border-yellow-200">ELITE</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold bg-white border border-zinc-100 px-3 py-1 rounded-full">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", match.status === 'LIVE' ? "bg-red-500 animate-pulse" : "bg-zinc-200")} />
                                            <span>
                                                {new Date(match.date).toLocaleDateString([], { day: '2-digit', month: 'short' })} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Teams Section */}
                                    <div className="p-8 flex items-center justify-between relative">
                                        {/* Score Display */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
                                            <div className="text-4xl font-black tabular-nums tracking-tighter">
                                                {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                                                    <div className="flex gap-4 items-center">
                                                        <span className="bg-zinc-50 px-3 py-1 rounded-xl shadow-inner border border-zinc-100">{match.homeScore ?? 0}</span>
                                                        <span className="text-zinc-200">—</span>
                                                        <span className="bg-zinc-50 px-3 py-1 rounded-xl shadow-inner border border-zinc-100">{match.awayScore ?? 0}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-200 italic">VS</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center gap-4 text-center">
                                            <div className="p-4 bg-zinc-50 rounded-3xl group-hover:scale-105 transition-transform duration-500 border border-zinc-100 shadow-inner">
                                                {match.homeTeam.logo ? (
                                                    <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-16 h-16 object-contain drop-shadow-md" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center font-black text-2xl text-blue-600">{match.homeTeam.name[0]}</div>
                                                )}
                                            </div>
                                            <span className="text-sm font-black uppercase tracking-tight max-w-[120px] truncate text-zinc-900">{match.homeTeam.name}</span>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center gap-4 text-center">
                                            <div className="p-4 bg-zinc-50 rounded-3xl group-hover:scale-105 transition-transform duration-500 border border-zinc-100 shadow-inner">
                                                {match.awayTeam.logo ? (
                                                    <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-16 h-16 object-contain drop-shadow-md" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center font-black text-2xl text-blue-600">{match.awayTeam.name[0]}</div>
                                                )}
                                            </div>
                                            <span className="text-sm font-black uppercase tracking-tight max-w-[120px] truncate text-zinc-900">{match.awayTeam.name}</span>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="px-8 pb-8 flex flex-col gap-4">
                                        {hasPrediction ? (
                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between overflow-hidden group/pred">
                                                    <div>
                                                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Pick Sugerido</div>
                                                        <div className="text-lg font-black text-zinc-900">{match.predictions[0].result}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Confianza</div>
                                                        <div className="text-lg font-black text-green-600">{Math.round(match.predictions[0].confidence * 100)}%</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedAnalysis({ ...match, prediction: match.predictions[0] })}
                                                    className="bg-zinc-100 hover:bg-zinc-200 p-4 rounded-2xl border border-zinc-200 transition-all active:scale-95 flex items-center justify-center group/btn"
                                                    title="Ver Análisis Completo"
                                                >
                                                    <ChevronRight className="w-6 h-6 text-zinc-600 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                                {(match.status === 'FINISHED' || match.status === 'LIVE') && (
                                                    <button
                                                        onClick={() => handleAnalyze(match.id)}
                                                        disabled={isAnalyzing}
                                                        className="bg-purple-50 hover:bg-purple-100 p-4 rounded-2xl border border-purple-200 transition-all active:scale-95 flex items-center justify-center group/refresh"
                                                        title="Actualizar Análisis (Retake)"
                                                    >
                                                        <RefreshCw className={cn("w-5 h-5 text-purple-600 group-hover/refresh:rotate-180 transition-transform duration-500", isAnalyzing && "animate-spin")} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAnalyze(match.id)}
                                                disabled={isAnalyzing}
                                                className="w-full bg-blue-600 hover:bg-blue-700 p-5 rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        <span>IA Procesando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <BrainCircuit className="w-6 h-6" />
                                                        <span>Generar Análisis Pro</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Analysis Modal */}
            {selectedAnalysis && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedAnalysis(null)} />

                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/90 backdrop-blur-lg p-8 border-b border-zinc-100 flex items-center justify-between z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <BrainCircuit className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-zinc-900">ANÁLISIS DE ELITE</h3>
                                    <p className="text-sm text-zinc-500 font-medium">{selectedAnalysis.homeTeam.name} vs {selectedAnalysis.awayTeam.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAnalysis(null)}
                                className="p-3 hover:bg-zinc-100 rounded-full transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-10">
                            {!canAccess(selectedAnalysis.league.tier) ? (
                                <div className="py-12 relative">
                                    {/* Blurred Background Content */}
                                    <div className="blur-2xl pointer-events-none select-none opacity-10 space-y-8">
                                        <div className="h-32 bg-zinc-100 rounded-[32px]" />
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="h-40 bg-zinc-100 rounded-[32px]" />
                                            <div className="h-40 bg-zinc-100 rounded-[32px]" />
                                        </div>
                                    </div>

                                    {/* Paywall Card */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="max-w-md w-full bg-white border border-zinc-200 p-12 rounded-[48px] shadow-2xl text-center">
                                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-600/20">
                                                <Trophy className="w-12 h-12 text-white" />
                                            </div>
                                            <h4 className="text-3xl font-black mb-4 tracking-tight text-zinc-900">EXPERIENCIA GOLD</h4>
                                            <p className="text-zinc-500 mb-10 leading-relaxed text-lg">
                                                Los datos tácticos de la <span className="text-zinc-900 font-bold">{selectedAnalysis.league.name}</span> requieren el plan **{selectedAnalysis.league.tier === 1 ? 'GOLD' : 'SILVER'}**.
                                            </p>
                                            <button
                                                onClick={() => handleUpgrade(selectedAnalysis.league.tier === 1 ? 'GOLD' : 'SILVER')}
                                                disabled={isRedirecting}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.03] active:scale-95 text-lg disabled:opacity-50"
                                            >
                                                {isRedirecting ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>CONECTANDO CON CONEKTA...</span>
                                                    </div>
                                                ) : (
                                                    `SUBIR NIVEL A ${selectedAnalysis.league.tier === 1 ? 'GOLD' : 'SILVER'} AHORA`
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {/* Analysis Content */}
                                    <div className="bg-blue-50 border border-blue-100 p-8 rounded-[32px]">
                                        <h4 className="text-blue-600 font-black text-sm uppercase tracking-widest mb-4">Dictamen de la IA</h4>
                                        <p className="text-xl leading-relaxed text-zinc-700 font-medium italic">
                                            "{selectedAnalysis.prediction.analysis}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="bg-zinc-50 p-8 rounded-[32px] border border-zinc-200">
                                            <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">Probabilidad de Éxito</div>
                                            <div className="text-5xl font-black mb-2 text-zinc-900">{selectedAnalysis.prediction.result}</div>
                                            <div className="flex items-center gap-4 text-sm font-bold text-blue-600">
                                                <span>CONFIANZA DE {Math.round(selectedAnalysis.prediction.confidence * 100)}%</span>
                                                <div className="flex-1 h-1.5 bg-zinc-200 rounded-full">
                                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedAnalysis.prediction.confidence * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 p-8 rounded-[32px] border border-zinc-200">
                                            <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">Pick Sugerido</div>
                                            <div className="text-3xl font-black text-green-600 mb-4">{selectedAnalysis.prediction.bettingTips.pick}</div>
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-zinc-400 uppercase">Cuota</span>
                                                <span className="text-zinc-900">@{selectedAnalysis.prediction.bettingTips.odds}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-2 bg-zinc-50 p-8 rounded-[32px] border border-zinc-200">
                                            <h5 className="font-black text-sm text-zinc-400 tracking-widest uppercase mb-6 flex items-center gap-3">
                                                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                                                Métricas de Ataque/Defensa
                                            </h5>
                                            <div className="grid grid-cols-2 gap-10">
                                                <div className="space-y-6">
                                                    <div className="text-xs font-black text-blue-600 uppercase">{selectedAnalysis.homeTeam.name}</div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-zinc-500">Goles favor</span>
                                                        <span className="font-black text-zinc-900">{renderStat(selectedAnalysis.prediction.stats?.homeGoals?.for?.average)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-zinc-500">Goles contra</span>
                                                        <span className="font-black text-red-600">{renderStat(selectedAnalysis.prediction.stats?.homeGoals?.against?.average)}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="text-xs font-black text-blue-600 uppercase">{selectedAnalysis.awayTeam.name}</div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-zinc-500">Goles favor</span>
                                                        <span className="font-black text-zinc-900">{renderStat(selectedAnalysis.prediction.stats?.awayGoals?.for?.average)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-zinc-500">Goles contra</span>
                                                        <span className="font-black text-red-600">{renderStat(selectedAnalysis.prediction.stats?.awayGoals?.against?.average)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 p-8 rounded-[32px] border border-zinc-200 flex flex-col justify-center text-center">
                                            <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">Disciplina y Cards</div>
                                            <div className="text-4xl font-black text-yellow-600 mb-2">{selectedAnalysis.prediction.cardsAnalysis?.yellowCards || "N/A"}</div>
                                            <p className="text-xs text-zinc-500 font-medium px-4">Tendencia de amarillas estimada para este choque.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
