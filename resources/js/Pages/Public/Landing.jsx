import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router } from '@inertiajs/react';
import { GraduationCap, ChevronRight } from 'lucide-react';

export default function Landing({ institutions, banners }) {
    const handleSelect = (inst) => {
        router.get(`/consulta?institution_id=${inst.id}`);
    };

    return (
        <PublicLayout banners={banners}>
            <Head title="Portal de Asistencia" />
            
            <div className="max-w-4xl mx-auto w-full py-10 animate-in fade-in duration-700">
                <div className="text-center mb-10">
                    <GraduationCap className="h-16 w-16 mx-auto text-institutional-600 mb-4" />
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Portal de Asistencia</h1>
                    <p className="text-slate-500">Seleccione su institución educativa para consultar la asistencia</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {institutions.map(inst => (
                        <div
                            key={inst.id}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-institutional-500 hover:shadow-md transition-all group cursor-pointer flex items-center gap-4"
                            onClick={() => handleSelect(inst)}
                        >
                            <img
                                src={inst.logo_url || '/images/logo.jpeg'}
                                alt={`Logo ${inst.name}`}
                                className="w-16 h-16 rounded-full object-contain border border-slate-100 group-hover:ring-2 ring-institutional-200 transition-all"
                            />
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-institutional-950 group-hover:text-institutional-700 transition-colors">
                                    {inst.name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Institución Activa
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-institutional-500 transition-colors" />
                        </div>
                    ))}
                </div>

                {institutions.length === 0 && (
                    <div className="text-center p-8 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                        No hay instituciones activas en este momento.
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
