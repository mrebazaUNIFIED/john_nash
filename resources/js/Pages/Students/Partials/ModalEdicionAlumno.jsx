import React, { useState, useEffect } from 'react';
import { Edit2, X, CheckCircle2, Loader2 } from 'lucide-react';
import FormularioCampos from './FormularioCampos';
import axios from 'axios';

export default function ModalEdicionAlumno({ isOpen, onClose, student, user, institutions, onSuccess }) {
    const [formData, setFormData] = useState({
        student_code: '', first_name: '', last_name_paternal: '', last_name_maternal: '',
        level: '', shift: '', grade: '', section: '', institution_id: '', is_active: true
    });
    const [formStatus, setFormStatus] = useState({ loading: false, error: null, success: false });

    // Update form when student changes
    useEffect(() => {
        if (student && isOpen) {
            setFormData({
                student_code: student.student_code || '',
                first_name: student.first_name || '',
                last_name_paternal: student.last_name_paternal || '',
                last_name_maternal: student.last_name_maternal || '',
                level: student.level || '',
                shift: student.shift || '',
                grade: student.grade || '',
                section: student.section || '',
                institution_id: student.institution_id || '',
                is_active: student.is_active !== false
            });
            setFormStatus({ loading: false, error: null, success: false });
        }
    }, [student, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ loading: true, error: null, success: false });

        try {
            await axios.put(route('students.database.update', student.id), formData);
            setFormStatus({ loading: false, error: null, success: true });
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1000);
        } catch (error) {
            setFormStatus({ 
                loading: false, 
                error: error.response?.data?.error || error.response?.data?.message || 'Error al actualizar el alumno.',
                success: false 
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-institutional-500" />
                        Editar Alumno
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {formStatus.success && (
                        <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-md flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Alumno actualizado correctamente.
                        </div>
                    )}
                    {formStatus.error && (
                        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md text-sm">
                            <b>Error:</b> {formStatus.error}
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit} id="edit-form">
                        <FormularioCampos 
                            formData={formData} 
                            handleInputChange={handleInputChange} 
                            user={user} 
                            institutions={institutions} 
                            isEditing={true}
                        />
                    </form>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" form="edit-form" disabled={formStatus.loading} className="flex items-center gap-2 px-4 py-2 bg-institutional-600 font-medium text-white rounded-md hover:bg-institutional-700 transition-colors disabled:opacity-50">
                        {formStatus.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}
