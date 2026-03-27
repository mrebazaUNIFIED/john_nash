import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Database, Users, UserPlus } from 'lucide-react';
import DirectorioAlumnos from './Partials/DirectorioAlumnos';
import CargaMasivaAlumnos from './Partials/CargaMasivaAlumnos';
import AgregarIndividual from './Partials/AgregarIndividual';

export default function Index({ institutions }) {
    const [activeTab, setActiveTab] = useState('directorio');

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Alumnos</h2>}
        >
            <Head title="Alumnos" />

            <div className="space-y-6 fade-in w-full">
                <div className="flex bg-slate-200 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('directorio')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'directorio' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Database className="w-4 h-4" /> Directorio
                    </button>
                    <button
                        onClick={() => setActiveTab('masiva')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'masiva' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Users className="w-4 h-4" /> Carga Masiva
                    </button>
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <UserPlus className="w-4 h-4" /> Agregar Individual
                    </button>
                </div>

                {activeTab === 'directorio' && (
                    <DirectorioAlumnos institutions={institutions} />
                )}

                {activeTab === 'masiva' && (
                    <CargaMasivaAlumnos 
                        institutions={institutions} 
                        onSuccess={() => setActiveTab('directorio')} 
                    />
                )}

                {activeTab === 'individual' && (
                    <AgregarIndividual 
                        institutions={institutions} 
                        onSuccess={() => setActiveTab('directorio')} 
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
