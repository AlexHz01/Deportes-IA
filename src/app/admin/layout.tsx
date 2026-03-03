import { AdminSidebar } from "@/components/admin/sidebar";
import { getCurrentUser } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth");
    }

    return (
        <div className="flex h-screen bg-zinc-50">
            <AdminSidebar userRole={user.role} />
            <main className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
