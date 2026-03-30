import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InstitutionForm } from './Partials/InstitutionForm';
import { ScheduleModal } from './Partials/ScheduleModal';

export default function Index({ institutions }) {
    const { flash } = usePage().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInstitution, setEditingInstitution] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [flashMsg, setFlashMsg] = useState('');

    // Schedule Modal state
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleInstitution, setScheduleInstitution] = useState(null);

    // Mostrar flash de éxito del backend
    useEffect(() => {
        if (flash?.success) {
            setFlashMsg(flash.success);
            const t = setTimeout(() => setFlashMsg(''), 3000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    // Sincronizar scheduleInstitution cuando Inertia actualiza las instituciones
    // (ej: después de agregar un horario)
    useEffect(() => {
        if (scheduleInstitution && institutions) {
            const updated = institutions.find(i => i.id === scheduleInstitution.id);
            if (updated) setScheduleInstitution(updated);
        }
    }, [institutions]);

    const openCreate = () => {
        setEditingInstitution(null);
        setIsFormOpen(true);
    };

    const openEdit = (institution) => {
        setEditingInstitution(institution);
        setIsFormOpen(true);
    };

    const openSchedules = (institution) => {
        setScheduleInstitution(institution);
        setIsScheduleModalOpen(true);
    };

    const handleCloseScheduleModal = () => {
        setIsScheduleModalOpen(false);
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`¿Está seguro de eliminar la institución "${name}"? Esta acción no se puede deshacer.`)) {
            router.delete(route('institutions.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const filteredInstitutions = institutions ? institutions.filter(inst =>
        (inst.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <AuthenticatedLayout header="Instituciones Educativas">
            <Head title="Instituciones" />

            <div className="space-y-6 fade-in w-full">

                {/* Flash message */}
                {flashMsg && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium shadow-sm">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        {flashMsg}
                    </div>
                )}

                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Instituciones Educativas</h2>
                        <p className="text-sm text-slate-500">Gestione los colegios y academias del sistema</p>
                    </div>
                    <button 
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-institutional-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-institutional-700 focus:bg-institutional-700 active:bg-institutional-900 focus:outline-none focus:ring-2 focus:ring-institutional-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Institución
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-institutional-500 focus:border-institutional-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Institución</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInstitutions.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8 text-slate-500">
                                            No se encontraron instituciones.
                                        </td>
                                    </tr>
                                ) : filteredInstitutions.map((inst) => (
                                    <tr key={inst.id} className="bg-white border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                            <img 
                                                src={inst.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}&background=1e3a8a&color=fff`}
                                                alt="Logo" 
                                                className="w-10 h-10 rounded-full border border-slate-200 shadow-sm object-cover bg-white" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}&background=1e3a8a&color=fff`;
                                                }}
                                            />
                                            {inst.name}
                                        </td>
                                        <td className="px-6 py-4 text-center align-middle">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                                                inst.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                                            )}>
                                                {inst.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {inst.is_active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right align-middle">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openSchedules(inst)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Horarios">
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openEdit(inst)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(inst.id, inst.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <InstitutionForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                initialData={editingInstitution}
            />

            {scheduleInstitution && (
                <ScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={handleCloseScheduleModal}
                    institution={scheduleInstitution}
                />
            )}
        </AuthenticatedLayout>
    );
}
