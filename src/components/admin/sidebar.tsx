"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Trophy,
    Activity,
    Settings,
    LogOut,
    Menu,
    X,
    TrendingUp,
    User,
} from "lucide-react";
import { useState, useEffect } from "react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Deportes",
        href: "/admin/sports",
        icon: Activity,
        isAdminOnly: true,
    },
    {
        title: "Ligas",
        href: "/admin/leagues",
        icon: Trophy,
        isAdminOnly: true,
    },
    {
        title: "Partidos",
        href: "/admin/matches",
        icon: Activity,
    },
    {
        title: "Configuración IA",
        href: "/admin/settings",
        icon: Settings,
        isAdminOnly: true,
    },
    {
        title: "Mi Perfil",
        href: "/admin/profile",
        icon: User,
    },
];

export function AdminSidebar({ userRole }: { userRole?: string }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const filteredItems = sidebarItems.filter(item =>
        !item.isAdminOnly || userRole === 'ADMIN'
    );

    // Close sidebar when navigating on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Header/Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-white border-b border-zinc-200">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-zinc-900">AnalistaPRO</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-zinc-100 text-zinc-600"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar Desktop & Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 bg-zinc-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="hidden lg:flex items-center gap-3 h-20 px-8 border-b border-zinc-800/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Analista<span className="text-indigo-400">PRO</span>
                        </span>
                    </div>

                    <div className="lg:hidden h-20 px-8 flex items-center justify-between border-b border-zinc-800/50">
                        <span className="text-xl font-bold tracking-tight">Menu</span>
                        <button onClick={() => setIsOpen(false)}><X className="h-6 w-6 text-zinc-400" /></button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                        {filteredItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all group",
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5 mr-3 px-0.5",
                                        isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                    )} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800/50">
                        <Link
                            href="/"
                            className="flex items-center w-full px-4 py-3.5 text-sm font-medium text-zinc-400 rounded-xl hover:bg-zinc-800 hover:text-white transition-all"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Salir al Inicio
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-zinc-950/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
