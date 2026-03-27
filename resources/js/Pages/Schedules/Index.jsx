import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ schedules, institutions }) {
    return (
        <AuthenticatedLayout header="Gestión de Horarios">
            <Head title="Configuración de Horarios" />

            <div className="space-y-6 fade-in w-full">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Reglas de Asistencia</h2>
                        <p className="text-sm text-slate-500">Configure los horarios de ingreso y tolerancias por institución</p>
                    </div>
                </div>

                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500">
                    <p className="mb-4 text-lg">Módulo de Horarios en integración con Laravel backend.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
