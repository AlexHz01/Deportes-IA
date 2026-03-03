"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, logout, getUserProfile } from "@/actions/auth-actions";
import { createConektaCheckout, checkPaymentStatus } from "@/actions/conekta-actions";
import { useRouter, useSearchParams } from "next/navigation";
import {
    User,
    Mail,
    Calendar,
    CreditCard,
    Shield,
    LogOut,
    ChevronRight,
    Crown,
    Star,
    Zap,
    Loader2,
    CheckCircle2,
    Settings,
    Clock
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        loadUser();

        // Auto-check payment status if returned from Conekta
        const payment = searchParams.get("payment");
        if (payment === "success") {
            verifyPayment();
        }
    }, [searchParams]);

    const verifyPayment = async () => {
        setIsVerifying(true);
        const result = await checkPaymentStatus();
        if (result.success) {
            toast.success("¡Pago confirmado! Tu plan se ha actualizado.");
            // Refresh user data
            const updatedProfile = await getUserProfile();
            if (updatedProfile) setUser(updatedProfile);
            // Clean URL
            router.replace("/admin/profile");
        }
        setIsVerifying(false);
    };

    const loadUser = async () => {
        setIsLoading(true);
        const profile = await getUserProfile();
        if (!profile) {
            router.push("/auth");
        } else {
            setUser(profile);
        }
        setIsLoading(false);
    };

    const formatDate = (date: any) => {
        if (!date) return "N/A";
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const handleUpgrade = async (plan: string) => {
        setIsRedirecting(true);
        const result = await createConektaCheckout(plan);
        if (result.url) {
            window.location.href = result.url;
        } else {
            toast.error(result.error || "No se pudo iniciar el proceso de pago");
            setIsRedirecting(false);
        }
    };

    // Stripe billing portal is not available for Conekta, 
    // so we disable the manage button for now or redirect to history if implemented.
    const handleManageSubscription = async () => {
        toast.info("La gestión de suscripción está disponible a través de soporte para pagos vía Conekta.");
    };

    const getPlanConfig = (plan: string) => {
        switch (plan) {
            case 'GOLD':
                return {
                    name: 'Gold Elite',
                    icon: <Crown className="w-8 h-8 text-yellow-600" />,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200'
                };
            case 'SILVER':
                return {
                    name: 'Silver Pro',
                    icon: <Star className="w-8 h-8 text-indigo-600" />,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                    border: 'border-indigo-200'
                };
            default:
                return {
                    name: 'Free Basic',
                    icon: <Zap className="w-8 h-8 text-blue-600" />,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200'
                };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando perfil...</p>
            </div>
        );
    }

    const planInfo = getPlanConfig(user?.plan);

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header / Intro */}
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-2 text-zinc-900">MI <span className="text-blue-600">PERFIL</span></h1>
                <p className="text-zinc-500 font-medium">Gestiona tu identidad y tus privilegios de análisis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-zinc-200 rounded-[32px] p-8 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <User className="w-32 h-32 text-zinc-900" />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-600/20">
                                {user?.email[0].toUpperCase()}
                            </div>
                            <div className="text-center md:text-left space-y-2">
                                <h2 className="text-2xl font-black text-zinc-900">{user?.name || "Usuario de AnalistaPRO"}</h2>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                                        <Mail className="w-4 h-4" />
                                        {user?.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                                        <Shield className="w-4 h-4" />
                                        Rol: <span className="font-black text-zinc-900 border-b-2 border-blue-100 ml-1">{user?.role}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-4">
                            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Miembro desde</div>
                                <div className="font-black text-sm capitalize text-zinc-900">{formatDate(user?.createdAt)}</div>
                            </div>
                            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Estatus del Token</div>
                                <div className="font-black text-sm text-green-600 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    ACTIVO
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                        <h3 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center gap-3 text-zinc-900">
                            <Settings className="w-5 h-5 text-zinc-400" />
                            Acciones de Cuenta
                        </h3>
                        <div className="grid gap-4">
                            <button
                                onClick={async () => { await logout(); router.push("/auth"); }}
                                className="flex items-center justify-between p-5 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-100 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-red-100 rounded-xl">
                                        <LogOut className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-red-600">Cerrar Sesión</div>
                                        <div className="text-xs text-red-600/60 font-bold">Finalizar tu jornada de análisis actual</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-red-600/30 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Upgrade Options for Free/Silver Users */}
                    {user?.plan !== 'GOLD' && (
                        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-zinc-900">
                                    <Crown className="w-5 h-5 text-yellow-600" />
                                    Planes Disponibles
                                </h3>
                                <div className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-1 rounded-full border border-blue-100 uppercase flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pagos vía Conekta
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Silver Option */}
                                {user?.plan === 'FREE' && (
                                    <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-2xl flex flex-col h-full hover:border-indigo-500/30 transition-colors group">
                                        <div className="mb-4">
                                            <div className="text-indigo-600 font-black text-xl mb-1">SILVER PRO</div>
                                            <div className="text-2xl font-black text-zinc-900">$190<span className="text-xs text-zinc-500 font-medium"> MXN/mes</span></div>
                                        </div>
                                        <ul className="space-y-2 mb-6 flex-1">
                                            <li className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase"><CheckCircle2 className="w-3 h-3 text-indigo-600" /> Ligas Americanas</li>
                                            <li className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase"><CheckCircle2 className="w-3 h-3 text-indigo-600" /> Análisis Táctico Extra</li>
                                        </ul>
                                        <button
                                            onClick={() => handleUpgrade('SILVER')}
                                            disabled={isRedirecting}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                        >
                                            {isRedirecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "SUBIR A SILVER"}
                                        </button>
                                    </div>
                                )}

                                {/* Gold Option */}
                                <div className="bg-zinc-50 border border-yellow-200 p-6 rounded-2xl flex flex-col h-full hover:border-yellow-500/50 transition-colors relative group">
                                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-[8px] font-black px-2 py-1 rounded-full border border-yellow-200 uppercase">Recomendado</div>
                                    <div className="mb-4">
                                        <div className="text-yellow-600 font-black text-xl mb-1">GOLD ELITE</div>
                                        <div className="text-2xl font-black text-zinc-900">$490<span className="text-xs text-zinc-500 font-medium"> MXN/mes</span></div>
                                    </div>
                                    <ul className="space-y-2 mb-6 flex-1">
                                        <li className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase"><CheckCircle2 className="w-3 h-3 text-yellow-600" /> Todo lo anterior</li>
                                        <li className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase"><CheckCircle2 className="w-3 h-3 text-yellow-600" /> Ligas UEFA Elite</li>
                                        <li className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase"><CheckCircle2 className="w-3 h-3 text-yellow-600" /> IA Máxima Precisión</li>
                                    </ul>
                                    <button
                                        onClick={() => handleUpgrade('GOLD')}
                                        disabled={isRedirecting}
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                                    >
                                        {isRedirecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "SUBIR A GOLD"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Plan Status Card */}
                <div className="space-y-6">
                    <div className={cn("rounded-[32px] border p-8 flex flex-col items-center text-center shadow-lg transition-all h-full", planInfo.bg, planInfo.border)}>
                        <div className="mb-6 p-4 rounded-3xl bg-white shadow-sm border border-zinc-100">
                            {planInfo.icon}
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Plan Actual</h3>
                        <div className={cn("text-3xl font-black mb-6 tracking-tight", planInfo.color)}>
                            {planInfo.name}
                        </div>

                        <div className="w-full h-px bg-zinc-200/50 mb-6" />

                        <div className="w-full space-y-4 mb-8">
                            <div className="flex justify-between text-xs font-black">
                                <span className="text-zinc-400 uppercase">Análisis Elite</span>
                                <span className={user?.plan === 'GOLD' ? "text-green-600" : "text-red-500"}>
                                    {user?.plan === 'GOLD' ? 'ILIMITADO' : 'RESTRICTO'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs font-black">
                                <span className="text-zinc-400 uppercase">Contexto de Goles</span>
                                <span className={user?.plan !== 'FREE' ? "text-green-600" : "text-red-500"}>
                                    {user?.plan !== 'FREE' ? 'INCLUIDO' : 'NO INCLUIDO'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleManageSubscription}
                            disabled={isRedirecting}
                            className="w-full mt-auto bg-zinc-900 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isRedirecting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    <span>GESTIONAR PLAN</span>
                                </>
                            )}
                        </button>

                        {user?.plan === 'FREE' && (
                            <p className="mt-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4">
                                Desbloquea la Premier y La Liga subiendo a Silver o Gold.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
