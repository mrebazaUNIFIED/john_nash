import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import {
    FileDown, Filter, Loader2, UserSearch,
    AlertCircle, RefreshCcw, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toLocalDate = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
};
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return toLocalDate(d); };
const lastOfMonth = () => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(0);
    return toLocalDate(d);
};
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = String(dateStr).substring(0, 10).split('-');
    if (parts.length !== 3) return '—';
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS = {
    PUNTUAL: { label: 'Puntual', cls: 'bg-green-100 text-green-700 border-green-200' },
    TARDANZA: { label: 'Tardanza', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    FALTA: { label: 'Falta', cls: 'bg-red-100   text-red-700   border-red-200' },
};
function StatusBadge({ status }) {
    const s = STATUS[status] ?? STATUS.FALTA;
    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${s.cls}`}>
            {s.label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 30;

export default function Reportes() {
    const [loading, setLoading] = useState(false);   // export
    const [fetching, setFetching] = useState(true);    // table
    const [allLogs, setAllLogs] = useState([]);
    const [error, setError] = useState('');

    // Filters state
    const [startDate, setStartDate] = useState(firstOfMonth());
    const [endDate, setEndDate] = useState(lastOfMonth());
    const [studentSearch, setStudentSearch] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({ start: firstOfMonth(), end: lastOfMonth(), search: '' });

    // Pagination
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(allLogs.length / PAGE_SIZE));
    const pagedLogs = allLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const doFetch = useCallback(async (start, end, search) => {
        setFetching(true);
        setError('');
        setPage(1);
        setAppliedFilters({ start, end, search });
        try {
            const r = await axios.get(route('reports.json'), {
                params: {
                    start_date: start || undefined,
                    end_date: end || undefined,
                    search: search || undefined,
                }
            });
            setAllLogs(r.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al cargar datos');
            setAllLogs([]);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => { doFetch(firstOfMonth(), lastOfMonth(), ''); }, []);

    // ── Export CSV ────────────────────────────────────────────────────────────
    const handleExport = async () => {
        setLoading(true);
        try {
            const r = await axios.get(route('reports.export'), {
                params: {
                    start_date: appliedFilters.start || undefined,
                    end_date: appliedFilters.end || undefined,
                    search: appliedFilters.search || undefined,
                },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([r.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = appliedFilters.start
                ? `reporte_asistencia_${appliedFilters.start}_al_${appliedFilters.end}.csv`
                : 'reporte_asistencia_general.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error al exportar. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => doFetch(startDate, endDate, studentSearch.trim());
    const handleReset = () => {
        const s = firstOfMonth(), e = lastOfMonth();
        setStartDate(s); setEndDate(e); setStudentSearch('');
        doFetch(s, e, '');
    };

    // Stats summary
    const statsCount = allLogs.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1; return acc;
    }, {});

    return (
        <AuthenticatedLayout>
            <Head title="Reportes de Asistencia" />

            <div className="space-y-5 fade-in flex flex-col  mx-auto py-6 px-2">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Reportes de Asistencia</h2>
                        <p className="text-sm text-slate-500">
                            Con búsqueda de alumno: incluye días de <span className="text-red-600 font-semibold">FALTA</span> automáticamente dentro del rango.
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={loading || fetching}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        Exportar CSV
                    </button>
                </div>

                {/* ── Summary chips ───────────────────────────────────────── */}
                {!fetching && allLogs.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { label: 'Total', val: allLogs.length, cls: 'bg-slate-100 text-slate-700 border-slate-200' },
                            { label: 'Puntual', val: statsCount.PUNTUAL || 0, cls: 'bg-green-50 text-green-700 border-green-200' },
                            { label: 'Tardanza', val: statsCount.TARDANZA || 0, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
                            { label: 'Falta', val: statsCount.FALTA || 0, cls: 'bg-red-50   text-red-700   border-red-200' },
                        ].map(({ label, val, cls }) => (
                            <div key={label} className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 ${cls}`}>
                                <span className="font-bold text-base">{val}</span> {label}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Card with filters + table ────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

                    {/* Filter bar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-wrap gap-3 items-end">

                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                <UserSearch className="w-3.5 h-3.5" /> Buscar Alumno
                            </label>
                            <input
                                type="text"
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleApply()}
                                placeholder="Nombre o código de alumno"
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-institutional-500 bg-white"
                            />
                        </div>

                        {/* Dates */}
                        <div className="flex-1 min-w-[145px]">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Fecha Inicio</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-institutional-500 bg-white" />
                        </div>
                        <div className="flex-1 min-w-[145px]">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Fecha Fin</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-institutional-500 bg-white" />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                            <button onClick={handleApply}
                                className="flex items-center gap-2 bg-institutional-600 hover:bg-institutional-700 text-white h-10 px-4 rounded-lg text-sm font-medium transition-colors">
                                <Filter className="w-4 h-4" /> Aplicar
                            </button>
                            <button onClick={handleReset}
                                className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-100 h-10 px-4 rounded-lg text-sm font-medium transition-colors">
                                <RefreshCcw className="w-4 h-4" /> Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-[280px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Fecha</th>
                                    <th className="px-5 py-3 font-semibold">Hora</th>
                                    <th className="px-5 py-3 font-semibold">Alumno</th>
                                    <th className="px-5 py-3 font-semibold">Grado / Sec.</th>
                                    <th className="px-5 py-3 font-semibold text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {fetching ? (
                                    <tr><td colSpan="5" className="py-16 text-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-institutional-400" />
                                        Cargando registros...
                                    </td></tr>
                                ) : error ? (
                                    <tr><td colSpan="5" className="py-16 text-center">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                                        <p className="text-red-600">{error}</p>
                                        <button onClick={handleApply} className="mt-3 text-sm text-institutional-600 underline">Reintentar</button>
                                    </td></tr>
                                ) : pagedLogs.length === 0 ? (
                                    <tr><td colSpan="5" className="py-16 text-center text-slate-400">No hay registros para los filtros aplicados.</td></tr>
                                ) : pagedLogs.map(log => (
                                    <tr key={log.id}
                                        className={`transition-colors ${log.status === 'FALTA' ? 'bg-red-50/50 hover:bg-red-100/60' : 'hover:bg-slate-50/80'}`}>
                                        <td className="px-5 py-3 text-slate-600">{formatDate(log.date)}</td>
                                        <td className="px-5 py-3 font-mono text-slate-700">{log.time ? log.time.substring(0, 5) : '—'}</td>
                                        <td className="px-5 py-3 font-medium text-slate-900">{log.studentName}</td>
                                        <td className="px-5 py-3 text-slate-500">{log.grade}</td>
                                        <td className="px-5 py-3 text-center"><StatusBadge status={log.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
                            <span>Página {page} de {totalPages} · {allLogs.length} registros</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
