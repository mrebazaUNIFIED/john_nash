import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    School,
    Users,
    Image as ImageIcon,
    FileText,
    LogOut,
    ScanLine,
    UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const navItems = [
        { href: route('dashboard'),          icon: LayoutDashboard, label: 'Dashboard',       roles: ['SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_COLEGIO'], activePattern: 'dashboard' },
        { href: route('institutions.index'), icon: School,          label: 'Instituciones',   roles: ['SUPER_ADMIN', 'ADMIN_GENERAL'],                  activePattern: 'institutions.*' },
        { href: route('students.index'),     icon: Users,           label: 'Alumnos',         roles: ['SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_COLEGIO'],  activePattern: 'students.*' },
        { href: route('photos.index'),       icon: ImageIcon,       label: 'Fotografías',     roles: ['SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_COLEGIO'],  activePattern: 'photos.*' },
        { href: route('profiles.index'),     icon: UserCircle,      label: 'Perfiles',        roles: ['SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_COLEGIO'],  activePattern: 'profiles.*' },
        { href: route('banners.index'),      icon: ImageIcon,       label: 'Publicidad',      roles: ['SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_COLEGIO'],  activePattern: 'banners.*' },
        { href: route('reports.index'),      icon: FileText,        label: 'Reportes',        roles: ['SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_COLEGIO'],  activePattern: 'reports.*' },
        { href: route('scanner'),            icon: ScanLine,        label: 'Abrir Scanner',   roles: ['SUPER_ADMIN', 'ADMIN_GENERAL', 'ADMIN_COLEGIO', 'PORTERO', 'OPERADOR'], activePattern: 'scanner' },
    ].filter(item => !item.roles || item.roles.includes(user?.role));

    return (
        // h-screen + overflow-hidden so the two panels each scroll independently
        <div className="h-screen w-screen overflow-hidden bg-slate-100 flex">

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className="w-64 flex-shrink-0 bg-institutional-900 text-white flex-col hidden md:flex h-full overflow-y-auto">
                {/* Logo */}
                <div className="p-4 bg-institutional-950 flex flex-col items-center justify-center py-5 gap-2">
                    <img src="/images/logo.jpeg" alt="Academia John Nash" className="h-16 object-contain" />
                    <div className="text-center">
                        <h2 className="text-sm font-bold tracking-tight text-white">ADEC Admin</h2>
                        <p className="text-xs text-institutional-300 font-medium">Academia John Nash</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-grow py-4 space-y-0.5">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                                route().current(item.activePattern)
                                    ? 'bg-institutional-800 text-white border-r-4 border-white'
                                    : 'text-institutional-200 hover:bg-institutional-800/50 hover:text-white'
                            )}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User chip */}
                <div className="p-4 bg-institutional-950 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-institutional-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {(user?.username || user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.username || user?.name || 'Admin'}</p>
                            <p className="text-xs text-institutional-400 truncate">{user?.role || 'administrator'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Area ──────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

                {/* Top bar */}
                <header className="shrink-0 bg-white shadow-sm px-6 py-3 flex justify-between items-center z-10">
                    <h1 className="text-xl font-semibold text-slate-800 truncate">Panel Organizativo</h1>
                    <Link
                        method="post"
                        href={route('logout')}
                        as="button"
                        className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 px-3 py-2 rounded-md transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </Link>
                </header>

                {/* Page content — scrollable */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
