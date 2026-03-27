import { usePage, Link, router } from '@inertiajs/react';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function ScannerLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-900 text-white flex flex-col">
            <header className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold text-institutional-400">Terminal Scanner</h1>
                    <p className="text-xs text-slate-400">ADEC Access Control</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex-col text-right hidden sm:flex">
                        <span className="text-sm font-medium">{user?.name || 'Operador'}</span>
                        <span className="text-xs text-slate-400">{user?.role || 'OPERADOR'}</span>
                    </div>
                    {/* Offline indicator will go here */}
                    <div className="flex items-center gap-2 mr-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-sm text-slate-300 hidden sm:inline">Conectado</span>
                    </div>
                    {user?.role !== 'OPERADOR' && user?.role !== 'PORTERO' && (
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-2 text-sm bg-institutional-600 hover:bg-institutional-700 text-white px-3 py-2 rounded-md transition-colors border border-institutional-600 shadow-sm"
                            title="Volver al Panel"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden sm:inline">Panel Admin</span>
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors border border-slate-700"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center relative">
                {children}
            </main>
        </div>
    );
}
