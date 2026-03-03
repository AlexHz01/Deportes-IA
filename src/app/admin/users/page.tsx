"use client";

import { useState, useEffect } from "react";
import { getUsers, updateUser, deleteUser } from "@/actions/user-actions";
import { getCurrentUser } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import {
    Users,
    Shield,
    CreditCard,
    Trash2,
    Search,
    ChevronLeft,
    Mail,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Crown,
    Star,
    Zap
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [adminSession, setAdminSession] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const session = await getCurrentUser();
            if (!session || session.role !== 'ADMIN') {
                toast.error("Acceso denegado: Se requiere rol de Administrador");
                router.push("/admin/matches");
                return;
            }
            setAdminSession(session);
            loadUsers();
        };
        checkAuth();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        const result = await getUsers();
        if (result.success) {
            setUsers(result.users || []);
        } else {
            toast.error(result.error);
        }
        setIsLoading(false);
    };

    const handleUpdate = async (userId: string, data: any) => {
        const result = await updateUser(userId, data);
        if (result.success) {
            toast.success("Usuario actualizado correctamente");
            loadUsers();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) return;

        const result = await deleteUser(userId);
        if (result.success) {
            toast.success("Usuario eliminado");
            loadUsers();
        } else {
            toast.error(result.error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'GOLD': return <Crown className="w-4 h-4 text-yellow-500" />;
            case 'SILVER': return <Star className="w-4 h-4 text-gray-400" />;
            default: return <Zap className="w-4 h-4 text-blue-400" />;
        }
    };

    if (isLoading && !adminSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/admin/matches")}
                            className="p-3 bg-white hover:bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm transition-all group"
                        >
                            <ChevronLeft className="w-6 h-6 text-zinc-600 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-600" />
                                <h1 className="text-3xl font-black tracking-tight text-zinc-900">CONTROL DE <span className="text-blue-600">USUARIOS</span></h1>
                            </div>
                            <p className="text-zinc-500 font-medium text-sm mt-1">Gestiona suscripciones, roles y acceso a la plataforma</p>
                        </div>
                    </div>

                    <div className="relative group max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por email o nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all font-medium text-zinc-900 shadow-sm"
                        />
                    </div>
                </div>

                {/* Users Table / List */}
                <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 border-b border-zinc-100">
                                    <th className="px-8 py-6">Usuario</th>
                                    <th className="px-8 py-6">Rol</th>
                                    <th className="px-8 py-6">Suscripción</th>
                                    <th className="px-8 py-6">Registro</th>
                                    <th className="px-8 py-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-md">
                                                    {user.name ? user.name[0] : user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-zinc-900 max-w-[200px] truncate">{user.name || "Sin nombre"}</div>
                                                    <div className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdate(user.id, { role: e.target.value })}
                                                className={cn(
                                                    "bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-black outline-none cursor-pointer transition-all",
                                                    user.role === 'ADMIN' ? "text-purple-600 border-purple-200" : "text-zinc-600"
                                                )}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-2 rounded-lg flex items-center justify-center",
                                                    user.plan === 'GOLD' ? "bg-yellow-50" : user.plan === 'SILVER' ? "bg-zinc-100" : "bg-blue-50"
                                                )}>
                                                    {getPlanIcon(user.plan)}
                                                </div>
                                                <select
                                                    value={user.plan}
                                                    onChange={(e) => handleUpdate(user.id, { plan: e.target.value })}
                                                    className={cn(
                                                        "bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-black outline-none cursor-pointer transition-all uppercase",
                                                        user.plan === 'GOLD' ? "text-yellow-700 border-yellow-200" : user.plan === 'SILVER' ? "text-zinc-600 border-zinc-300" : "text-blue-600"
                                                    )}
                                                >
                                                    <option value="FREE">FREE</option>
                                                    <option value="SILVER">SILVER</option>
                                                    <option value="GOLD">GOLD</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-xs text-zinc-500 font-bold flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-100 hover:border-red-500 shadow-sm"
                                                title="Eliminar Usuario"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredUsers.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
                        <AlertCircle className="w-12 h-12 mb-4" />
                        <span className="font-black uppercase tracking-widest text-sm">No se encontraron usuarios</span>
                    </div>
                )}
            </div>
        </div>
    );
}
