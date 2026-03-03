"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getAIConfig, updateAIConfig } from "@/actions/ai-actions";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    async function loadConfig() {
        setIsLoading(true);
        const result = await getAIConfig();
        if (result.success && result.config) {
            setPrompt(result.config.value);
        }
        setIsLoading(false);
    }

    async function handleSave() {
        setIsSaving(true);
        setMessage(null);
        const result = await updateAIConfig(prompt);
        if (result.success) {
            setMessage({ type: 'success', text: "Configuración de IA guardada correctamente. Los próximos análisis usarán este nuevo prompt." });
        } else {
            setMessage({ type: 'error', text: "Error al guardar: " + result.error });
        }
        setIsSaving(false);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-64 items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-24">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">
                    Configuración de <span className="text-blue-600">Inteligencia Artificial</span>
                </h2>
                <p className="text-zinc-500 font-medium">
                    Modifica el comportamiento y el cerebro del sistema de análisis deportivo.
                </p>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-zinc-200 overflow-hidden">
                <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100 text-blue-600">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="font-black text-lg text-zinc-900 uppercase tracking-tight">System Prompt (Prompt Maestro)</span>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[24px] flex items-start gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-amber-900 font-black uppercase tracking-tight mb-1">Aviso de Seguridad Crítica</p>
                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                Este prompt define cómo la IA procesa los datos de los partidos.
                                <span className="font-black"> No modifiques el formato de salida JSON </span> salvo que desees alterar la estructura de la interfaz.
                            </p>
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={15}
                            className="w-full p-8 font-mono text-sm bg-zinc-50 border border-zinc-200 rounded-[32px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all resize-none shadow-inner leading-relaxed text-zinc-700"
                            placeholder="Escribe aquí las instrucciones para la IA..."
                        />
                        <div className="absolute top-4 right-4 opacity-10 group-focus-within:opacity-20 transition-opacity">
                            <RefreshCw className="w-12 h-12 text-zinc-900" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Conexión Estable con Open AI
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "flex items-center px-8 py-4 bg-zinc-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl font-black uppercase text-xs tracking-widest gap-3 transform hover:scale-[1.02] active:scale-95 disabled:opacity-75 disabled:cursor-wait",
                                isSaving && "opacity-75"
                            )}
                        >
                            {isSaving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>

                    {message && (
                        <div className={cn(
                            "p-6 rounded-[24px] animate-in fade-in slide-in-from-top-2 border flex items-center gap-4",
                            message.type === 'success'
                                ? "bg-green-50 text-green-800 border-green-100"
                                : "bg-red-50 text-red-800 border-red-100"
                        )}>
                            <div className={cn("p-2 bg-white rounded-xl shadow-sm", message.type === 'success' ? "text-green-600" : "text-red-600")}>
                                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <span className="font-bold text-sm">{message.text}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm group hover:border-blue-500/30 transition-all">
                    <h4 className="font-black mb-4 uppercase text-[10px] text-zinc-400 tracking-[0.2em]">Contexto Inteligente</h4>
                    <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                        La IA recibe automáticamente datos del partido como: <code className="bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-100 text-blue-600 font-mono text-xs">homeTeam</code>, <code className="bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-100 text-blue-600 font-mono text-xs">awayTeam</code> y <code className="bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-100 text-blue-600 font-mono text-xs">league</code>.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm group hover:border-blue-500/30 transition-all">
                    <h4 className="font-black mb-4 uppercase text-[10px] text-zinc-400 tracking-[0.2em]">Ejecución en Tiempo Real</h4>
                    <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                        Cada vez que pulsas <span className="font-black text-zinc-900 border-b-2 border-blue-100">"Generar IA"</span> en un partido, se realiza una petición única utilizando esta configuración maestra.
                    </p>
                </div>
            </div>
        </div>
    );
}
