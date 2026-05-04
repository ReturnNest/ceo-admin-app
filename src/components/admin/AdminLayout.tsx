import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    ClipboardCheck,
    History,
    Menu,
    LogOut,
    ShieldCheck,
    MessageSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Create Listing', icon: PlusCircle, path: '/admin/create-listing' },
    { name: 'Moderation Queue', icon: ClipboardCheck, path: '/admin/moderation' },
    { name: 'Private Records', icon: ShieldCheck, path: '/admin/private-records' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Transactions', icon: History, path: '/admin/billing' },
    { name: 'Message History', icon: MessageSquare, path: '/admin/messages' },
    { name: 'Seller Management', icon: Users, path: '/admin/sellers' },
    { name: 'Audit Logs', icon: ShieldCheck, path: '/admin/audit' },
];

export const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">CEO Admin</h1>
                            <p className="text-xs text-slate-500 font-medium">Investment Portal</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                    location.pathname === item.path
                                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5",
                                    location.pathname === item.path ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                )} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group">
                            <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header (Mobile) */}
                <header className="flex lg:hidden items-center justify-between px-6 h-16 bg-slate-900 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-blue-500" />
                        <span className="font-bold">CEO Admin</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 rounded-lg text-slate-400 hover:bg-slate-800"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
