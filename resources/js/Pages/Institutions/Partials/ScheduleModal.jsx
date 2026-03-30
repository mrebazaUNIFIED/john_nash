import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { Loader2, Trash2, Plus, CheckCircle2, X } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';

export function ScheduleModal({ isOpen, onClose, institution }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        shift: 'Mañana',
        level: 'Primaria',
        entry_time: '07:30',
        tolerance_minutes: 10
    });

    const [successMsg, setSuccessMsg] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (institution?.id) {
            post(route('schedules.store', institution.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    clearErrors();
                    setSuccessMsg('¡Horario agregado correctamente!');
                    setTimeout(() => setSuccessMsg(''), 3000);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm('¿Eliminar este horario?')) return;
        router.delete(route('schedules.destroy', id), {
            preserveScroll: true
        });
    };

    if (!institution) return null;

    const schedules = institution.schedules || [];

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                {/* Header con botón cerrar */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">
                        Horarios: {institution.name}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Mensaje de éxito */}
                    {successMsg && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {successMsg}
                        </div>
                    )}

                    {/* Formulario de agregar */}
                    <form onSubmit={handleCreate} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Agregar Nuevo Horario</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <InputLabel value="Turno" className="text-xs text-slate-600 mb-1" />
                                <select
                                    className="w-full text-sm p-2 border border-slate-300 rounded focus:border-institutional-500 focus:ring-institutional-500"
                                    value={data.shift}
                                    onChange={e => setData('shift', e.target.value)}
                                >
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                    <option value="Noche">Noche</option>
                                </select>
                                <InputError message={errors.shift} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="Nivel" className="text-xs text-slate-600 mb-1" />
                                <select
                                    className="w-full text-sm p-2 border border-slate-300 rounded focus:border-institutional-500 focus:ring-institutional-500"
                                    value={data.level}
                                    onChange={e => setData('level', e.target.value)}
                                >
                                    <option value="Inicial">Inicial</option>
                                    <option value="Primaria">Primaria</option>
                                    <option value="Secundaria">Secundaria</option>
                                    <option value="General">General (Academia)</option>
                                </select>
                                <InputError message={errors.level} className="mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <InputLabel value="Hora Ingreso" className="text-xs text-slate-600 mb-1" />
                                <TextInput
                                    type="time"
                                    required
                                    className="w-full text-sm"
                                    value={data.entry_time}
                                    onChange={(e) => setData('entry_time', e.target.value)}
                                />
                                <InputError message={errors.entry_time} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel value="Tolerancia (m)" className="text-xs text-slate-600 mb-1" />
                                <TextInput
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full text-sm"
                                    value={data.tolerance_minutes}
                                    onChange={(e) => setData('tolerance_minutes', parseInt(e.target.value))}
                                />
                                <InputError message={errors.tolerance_minutes} className="mt-1" />
                            </div>
                        </div>
                        <PrimaryButton type="submit" disabled={processing} className="w-full justify-center gap-2">
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
                            Agregar Horario
                        </PrimaryButton>
                    </form>

                    {/* Lista de horarios */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">
                            Horarios Configurados
                            <span className="ml-2 text-xs font-normal text-slate-400">({schedules.length})</span>
                        </h4>
                        {schedules.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded border border-dashed border-slate-200">
                                No hay horarios configurados.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {schedules.map(schedule => (
                                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded text-sm">
                                        <div>
                                            <div className="font-semibold text-slate-800">{schedule.level} - Turno {schedule.shift}</div>
                                            <div className="text-slate-500 text-xs mt-1">
                                                Ingreso: <span className="font-mono text-slate-700">{schedule.entry_time?.substring(0, 5)}</span> |
                                                Tolerancia: <span className="font-mono text-slate-700">{schedule.tolerance_minutes}m</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(schedule.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Eliminar Horario"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botón cerrar en el footer */}
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <SecondaryButton onClick={onClose}>
                            Cerrar
                        </SecondaryButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
