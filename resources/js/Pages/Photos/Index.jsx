import React, { useState } from 'react';
import { Card } from '@/Components/ui/Card';
import { ImagePlus, Images } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CargaIndividual from './Partials/CargaIndividual';
import CargaMasiva from './Partials/CargaMasiva';

export default function PhotosIndex() {
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'masiva'

    return (
        <AuthenticatedLayout>
            <Head title="Fotografías" />

            <div className="space-y-6 fade-in w-full mx-auto py-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Fotografías de Alumnos</h2>
                        <p className="text-sm text-slate-500">Gestione las fotos para el reconocimiento visual o credenciales</p>
                    </div>
                </div>

                <div className="flex bg-slate-200 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'individual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <ImagePlus className="w-4 h-4" /> Carga Individual
                    </button>
                    <button
                        onClick={() => setActiveTab('masiva')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'masiva' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Images className="w-4 h-4" /> Carga Masiva (CódigoAlumno.jpg)
                    </button>
                </div>

                <Card>
                    <div className="p-8">
                        {activeTab === 'individual' ? (
                            <CargaIndividual />
                        ) : (
                            <CargaMasiva />
                        )}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
