import React, { useState } from 'react';
import { UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import FormularioCampos from './FormularioCampos';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function AgregarIndividual({ institutions, onSuccess }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [data, setData] = useState({
        student_code: '', first_name: '', last_name_paternal: '', last_name_maternal: '',
        level: '', shift: '', grade: '', section: '', institution_id: '', is_active: true
    });
    
    const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: null });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const reset = () => {
        setData({
            student_code: '', first_name: '', last_name_paternal: '', last_name_maternal: '',
            level: '', shift: '', grade: '', section: '', institution_id: '', is_active: true
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ loading: true, success: false, error: null });

        try {
            await axios.post(route('students.store'), data);
            
            setFormStatus({ loading: false, success: true, error: null });
            setTimeout(() => {
                reset();
                setFormStatus({ loading: false, success: false, error: null });
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al guardar el alumno.';
            setFormStatus({ loading: false, success: false, error: errorMessage });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <UserPlus className="w-8 h-8 text-institutional-600" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Agregar Alumno Individual</h3>
                        <p className="text-sm text-slate-500">Ingrese los datos correspondientes para matricular al alumno en el sistema.</p>
                    </div>
                </div>

                {formStatus.success && (
                    <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>¡Alumno registrado correctamente!</span>
                    </div>
                )}

                {formStatus.error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200">
                        <b>Error:</b> {formStatus.error}
                    </div>
                )}

                <form onSubmit={handleFormSubmit}>
                    <FormularioCampos 
                        formData={data} 
                        handleInputChange={handleInputChange} 
                        user={user} 
                        institutions={institutions} 
                        isEditing={false}
                    />
                    
                    <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors" onClick={() => reset()}>
                            Limpiar
                        </button>
                        <button type="submit" disabled={formStatus.loading} className="flex items-center gap-2 px-4 py-2 bg-institutional-600 text-white text-sm font-medium rounded-md hover:bg-institutional-700 transition-colors disabled:opacity-50">
                            {formStatus.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Guardar Alumno
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
