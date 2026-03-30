import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, School, Image as ImageIcon, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Mini Card ───────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, bg, href, loading }) {
    const inner = (
        <div className={`bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-institutional-300 transition-all rounded-xl p-6 flex items-center justify-between ${href ? 'cursor-pointer hover:-translate-y-1 transform' : ''}`}>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                {loading ? (
                    <div className="h-9 w-20 bg-slate-200 rounded animate-pulse mt-1" />
                ) : (
                    <h3 className="text-3xl font-bold text-slate-800">{value ?? '—'}</h3>
                )}
            </div>
            <div className={`p-4 rounded-full ${bg} ${color}`}>
                <Icon className="w-8 h-8" />
            </div>
        </div>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex items-center justify-between animate-pulse">
            <div className="space-y-3 w-1/2">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-8 bg-slate-200 rounded w-3/4" />
            </div>
            <div className="w-14 h-14 rounded-full bg-slate-200" />
        </div>
    );
}

// ─── Quick Access Button ──────────────────────────────────────────────────────
function QuickBtn({ href, icon: Icon, label, color }) {
    return (
        <Link
            href={href}
            className="p-4 bg-slate-50 hover:bg-institutional-50 border border-slate-200 rounded-xl text-left transition-colors group flex flex-col gap-2"
        >
            <Icon className={`w-6 h-6 ${color} group-hover:scale-110 transition-transform`} />
            <span className="font-semibold text-slate-700 text-sm">{label}</span>
        </Link>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(route('dashboard.stats'))
            .then(r => setStats(r.data))
            .catch(err => console.error('Error cargando estadísticas:', err))
            .finally(() => setLoading(false));
    }, []);

    // Prepare weekly chart data with human-readable day names
    const weeklyData = (stats?.weeklyData ?? []).map(row => ({
        name: new Date(row.date + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
        total: Number(row.total ?? 0),
        puntual: Number(row.puntual ?? 0),
        tardanza: Number(row.tardanza ?? 0),
    }));

    const cards = [
        {
            title: 'Instituciones Activas',
            value: stats?.institutions,
            icon: School,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            href: route('institutions.index'),
        },
        {
            title: 'Alumnos Registrados',
            value: stats?.students,
            icon: Users,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
            href: route('students.index'),
        },
        {
            title: 'Asistencias Hoy',
            value: stats?.attendancesToday,
            icon: CheckSquare,
            color: 'text-green-500',
            bg: 'bg-green-50',
            href: route('reports.index'),
        },
        {
            title: 'Banners Activos',
            value: stats?.banners,
            icon: ImageIcon,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            href: route('banners.index'),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className=" mx-auto py-6 px-4 space-y-8 animate-in fade-in duration-500">

                {/* Title */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Resumen General</h2>
                    <p className="text-slate-500">Bienvenido al panel de control de ADEC</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading
                        ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        : cards.map((c, i) => <StatCard key={i} {...c} loading={loading} />)
                    }
                </div>

                {/* Charts + Quick Access */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Bar Chart */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-institutional-500" /> Actividad de la Semana
                            </h3>
                        </div>
                        <div className="p-4 h-72">
                            {loading ? (
                                <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg" />
                            ) : weeklyData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                    No hay datos de asistencia esta semana.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: '#64748B', fontSize: 11 }} dy={8}
                                        />
                                        <YAxis
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: '#64748B', fontSize: 11 }} dx={-8}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F1F5F9' }}
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: 12 }}
                                        />
                                        <Bar dataKey="puntual" name="Puntual" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="tardanza" name="Tardanza" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-800">Accesos Rápidos</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <QuickBtn href={route('institutions.index')} icon={School} label="Gestionar Instituciones" color="text-institutional-600" />
                            <QuickBtn href={route('students.index')} icon={Users} label="Directorio Alumnos" color="text-indigo-600" />
                            <QuickBtn href={route('reports.index')} icon={CheckSquare} label="Reporte Diario" color="text-green-600" />
                            <QuickBtn href={route('scanner')} icon={Clock} label="Terminal Scanner" color="text-slate-600" />
                        </div>
                    </div>

                </div>



            </div>
        </AuthenticatedLayout>
    );
}
