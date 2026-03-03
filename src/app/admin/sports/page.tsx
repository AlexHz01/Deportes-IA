"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import { createSport, deleteSport, getSports } from "@/actions/sport-actions";
import { cn } from "@/lib/utils";

interface Sport {
    id: string;
    name: string;
    image: string | null;
    _count: { leagues: number };
}

export default function SportsPage() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadSports();
    }, []);

    async function loadSports() {
        setIsLoading(true);
        const result = await getSports();
        if (result.success && result.sports) {
            setSports(result.sports);
        }
        setIsLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Estás seguro de eliminar este deporte?")) return;
        const result = await deleteSport(id);
        if (result.success) {
            loadSports();
        } else {
            alert("Error al eliminar");
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsCreating(true);
        const formData = new FormData(e.currentTarget);
        const result = await createSport(formData);

        if (result.success) {
            (e.target as HTMLFormElement).reset();
            loadSports();
        } else {
            alert(result.error || "Error al crear");
        }
        setIsCreating(false);
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">
                    Gestión de <span className="text-blue-600">Deportes</span>
                </h2>
                <p className="text-zinc-500 font-medium">
                    Gestiona los deportes disponibles en la plataforma.
                </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
                {/* Formulario de Creación */}
                <div className="md:col-span-1">
                    <div className="p-8 bg-white rounded-[32px] shadow-sm border border-zinc-200 sticky top-8">
                        <h3 className="font-black text-lg mb-6 text-zinc-900 flex items-center gap-3">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Nuevo Deporte
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                                    Nombre del Deporte
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    placeholder="Ej: Fútbol"
                                    className="w-full px-4 py-3 border border-zinc-200 rounded-2xl bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold placeholder:text-zinc-300"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className={cn(
                                    "w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl text-sm font-black text-white bg-zinc-900 hover:bg-black focus:outline-none transition-all transform hover:scale-[1.02] active:scale-95",
                                    isCreating && "opacity-75 cursor-not-allowed"
                                )}
                            >
                                {isCreating ? "Guardando..." : "Guardar Deporte"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista de Deportes */}
                <div className="md:col-span-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <Trophy className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cargando deportes...</p>
                        </div>
                    ) : sports.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[32px] border-2 border-dashed border-zinc-200">
                            <Trophy className="mx-auto h-16 w-16 text-zinc-200 mb-6" />
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">No hay deportes</h3>
                            <p className="mt-2 text-sm text-zinc-400 font-medium tracking-tight">Comienza creando uno nuevo para organizar tus ligas.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {sports.map((sport) => (
                                <div
                                    key={sport.id}
                                    className="relative flex items-center space-x-4 p-6 bg-white rounded-[28px] border border-zinc-200 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                            <Trophy className="h-7 w-7" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-1">{sport.name}</p>
                                        <div className="flex items-center text-[10px] text-zinc-400 font-black uppercase tracking-widest gap-2">
                                            <span className="text-blue-600">{sport._count.leagues} Ligas activas</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(sport.id)}
                                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
