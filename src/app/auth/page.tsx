"use client";

import { useState } from "react";
import { login, register } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Trophy, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const result = isLogin ? await login(formData) : await register(formData);

        if (result.success) {
            toast.success(isLogin ? "¡Bienvenido de nuevo!" : "¡Cuenta creada con éxito!");
            if (isLogin) {
                router.push("/admin/matches");
            } else {
                setIsLogin(true);
            }
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        ANALISTA <span className="text-blue-500">PRO</span>
                    </h1>
                    <p className="text-gray-400">Inteligencia Artificial para Ganadores</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="flex bg-black/40 p-1 rounded-xl mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Juan Perez"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Entrar" : "Empezar Ahora"}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-gray-500 text-sm text-center mt-8 px-8 leading-relaxed">
                    Al unirte, aceptas transformar tu manera de analizar el deporte con el poder de la IA.
                </p>
            </div>
        </div>
    );
}
