import React, { useState, useEffect, useRef } from 'react';
import { Edit2, X, CheckCircle2, Loader2, Camera, Upload } from 'lucide-react';
import FormularioCampos from './FormularioCampos';
import axios from 'axios';

export default function ModalEdicionAlumno({ isOpen, onClose, student, user, institutions, onSuccess }) {
    const [formData, setFormData] = useState({
        student_code: '', first_name: '', last_name_paternal: '', last_name_maternal: '',
        level: '', shift: '', grade: '', section: '', institution_id: '', is_active: true
    });
    const [formStatus, setFormStatus] = useState({ loading: false, error: null, success: false });

    // Photo state
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoMsg, setPhotoMsg] = useState({ type: '', text: '' });
    const photoInputRef = useRef(null);

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
            setPhotoPreview(student.photo_url || null);
            setPhotoFile(null);
            setPhotoMsg({ type: '', text: '' });
        }
    }, [student, isOpen]);

    if (!isOpen) return null;

    const defaultAvatar = student
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent((student.first_name || 'A') + '+' + (student.last_name_paternal || 'B'))}&background=1e3a8a&color=fff&size=128`
        : 'https://ui-avatars.com/api/?name=A+B&background=1e3a8a&color=fff&size=128';

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handlePhotoUpload = async () => {
        if (!photoFile || !student?.id) return;
        setPhotoLoading(true);
        setPhotoMsg({ type: '', text: '' });

        const form = new FormData();
        form.append('photo', photoFile);

        try {
            const res = await axios.post(route('students.photo', student.id), form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPhotoMsg({ type: 'success', text: '¡Foto actualizada correctamente!' });
            setPhotoFile(null);
            if (onSuccess) onSuccess();
        } catch (error) {
            setPhotoMsg({ 
                type: 'error', 
                text: error.response?.data?.message || 'Error al subir la foto.' 
            });
        } finally {
            setPhotoLoading(false);
        }
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
                
                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                    {/* ── Foto del alumno ── */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Foto del Alumno
                        </h4>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img
                                    src={photoPreview || defaultAvatar}
                                    alt="Foto alumno"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm bg-white"
                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 bg-institutional-600 text-white rounded-full p-1.5 shadow hover:bg-institutional-700 transition-colors"
                                    title="Cambiar foto"
                                >
                                    <Upload className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={photoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                {photoFile ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-600 font-medium truncate max-w-[200px]">{photoFile.name}</p>
                                        <button
                                            type="button"
                                            onClick={handlePhotoUpload}
                                            disabled={photoLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-institutional-600 text-white text-xs font-medium rounded-md hover:bg-institutional-700 transition-colors disabled:opacity-50"
                                        >
                                            {photoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                            {photoLoading ? 'Subiendo...' : 'Subir Foto'}
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-slate-500">Haz clic en el ícono para cambiar la foto.</p>
                                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG — máx 2MB</p>
                                    </div>
                                )}
                                {photoMsg.text && (
                                    <p className={`text-xs mt-1 font-medium ${photoMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {photoMsg.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Estado del formulario ── */}
                    {formStatus.success && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Alumno actualizado correctamente.
                        </div>
                    )}
                    {formStatus.error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
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
