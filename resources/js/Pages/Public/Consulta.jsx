import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';

export default function Consulta({ institution, banners }) {
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!institution) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center animate-in fade-in duration-500">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Institución No Seleccionada</h2>
                    <Link href="/" className="text-institutional-600 font-bold hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setQuery(value);
            if (error) setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query) {
            setError('Por favor, ingrese el código de alumno');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/public/student/check`, {
                params: {
                    codigo: query,
                    institution_id: institution.id
                }
            });
            
            if (response.data.success) {
                router.get(`/resultado/${query}?institution_id=${institution.id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Alumno no encontrado. Verifique el código e intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout banners={banners}>
            <Head title={`Consulta - ${institution.name}`} />

            <div className="max-w-xl mx-auto w-full flex-grow flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-institutional-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Cambiar Institución
                </Link>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 py-6 px-8 flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl p-1.5 shadow-inner flex items-center justify-center overflow-hidden">
                            <img src={institution.logo_url || '/images/default-logo.png'} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-institutional-400 uppercase tracking-widest mb-0.5">Institución Seleccionada</p>
                            <h2 className="font-black text-white text-xl leading-tight uppercase tracking-tight">{institution.name}</h2>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Consulta de Asistencia</h2>
                            <p className="text-slate-500 font-medium mt-1">Ingrese el código del estudiante para continuar.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="000000"
                                    value={query}
                                    onChange={handleChange}
                                    className={cn(
                                        "w-full text-4xl font-black text-center py-6 rounded-2xl border-2 tracking-[0.2em] focus:ring-4 transition-all uppercase placeholder:tracking-normal placeholder:text-xl placeholder:font-bold",
                                        error 
                                            ? "border-red-200 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100" 
                                            : "border-slate-100 bg-slate-50 text-slate-900 focus:border-institutional-500 focus:ring-institutional-100"
                                    )}
                                    autoFocus
                                />
                                {error && (
                                    <p className="mt-3 text-sm font-bold text-red-600 text-center animate-in fade-in slide-in-from-top-1">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || query.length === 0}
                                className="w-full bg-institutional-600 hover:bg-institutional-700 text-white text-xl font-black py-5 rounded-2xl shadow-lg shadow-institutional-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-wider"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                                Consultar Ahora
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-12">
                    Acceso Seguro a la Información Estudiantil
                </p>
            </div>
        </PublicLayout>
    );
}
