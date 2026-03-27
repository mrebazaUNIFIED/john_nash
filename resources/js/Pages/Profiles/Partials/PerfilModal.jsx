import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function PerfilModal({ isOpen, onClose, userToEdit, onSuccess, currentUser }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        institution_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [institutions, setInstitutions] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            // Load institutions for the dropdown
            axios.get(route('database.users.index'), { params: { institutions_only: true } })
                .catch(() => {});

            // Load institutions via a simple GET to the institutions list
            axios.get('/database/institutions')
                .then(r => setInstitutions(r.data))
                .catch(() => setInstitutions([]));

            if (userToEdit) {
                setFormData({
                    name: userToEdit.name || '',
                    email: userToEdit.email || '',
                    password: '',
                    password_confirmation: '',
                    role: userToEdit.role || '',
                    institution_id: userToEdit.institution_id || ''
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: '',
                    role: currentUser?.role === 'ADMIN_COLEGIO' ? 'PORTERO' : '',
                    institution_id: currentUser?.role === 'ADMIN_COLEGIO' ? (currentUser?.institution_id || '') : ''
                });
            }
            setErrors({});
        }
    }, [isOpen, userToEdit, currentUser]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const submitData = { ...formData };

            // Remove password fields if not set (for edit)
            if (!submitData.password || submitData.password.trim() === '') {
                delete submitData.password;
                delete submitData.password_confirmation;
            }

            if (submitData.institution_id === '') {
                submitData.institution_id = null;
            }

            if (userToEdit) {
                await axios.put(route('database.users.update', userToEdit.id), submitData);
            } else {
                await axios.post(route('database.users.store'), submitData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                alert(error.response?.data?.message || 'Error al guardar el perfil');
            }
        } finally {
            setLoading(false);
        }
    };

    const isColegioAdmin = currentUser?.role === 'ADMIN_COLEGIO';
    const needsInstitution = formData.role === 'ADMIN_COLEGIO' || formData.role === 'PORTERO';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {userToEdit ? 'Editar Perfil' : 'Nuevo Perfil'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={`w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none transition-colors ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                            placeholder="Nombre de la persona"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email / Usuario</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={`w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                            placeholder="correo@institucion.edu.pe"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contraseña {userToEdit && <span className="text-slate-400 font-normal">(dejar en blanco para no cambiar)</span>}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!userToEdit}
                            placeholder={userToEdit ? 'Opcional' : 'Nueva contraseña'}
                            className={`w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
                    </div>

                    {/* Password Confirmation - only show if password has content */}
                    {formData.password && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required={!!formData.password}
                                placeholder="Repite la contraseña"
                                className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none"
                            />
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                        {isColegioAdmin ? (
                            <input
                                type="text"
                                value="PORTERO"
                                disabled
                                className="w-full h-11 px-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                            />
                        ) : (
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className={`w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none bg-white ${errors.role ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                            >
                                <option value="">Selecciona un Rol</option>
                                {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">SUPER ADMIN</option>}
                                <option value="ADMIN_GENERAL">ADMIN GENERAL</option>
                                <option value="ADMIN_COLEGIO">ADMIN COLEGIO</option>
                                <option value="PORTERO">PORTERO</option>
                            </select>
                        )}
                        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role[0]}</p>}
                    </div>

                    {/* Institution - only if ADMIN_COLEGIO or PORTERO */}
                    {needsInstitution && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Institución</label>
                            {isColegioAdmin ? (
                                <input
                                    type="text"
                                    value={institutions.find(i => i.id == formData.institution_id)?.name || 'Tu institución'}
                                    disabled
                                    className="w-full h-11 px-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                                />
                            ) : (
                                <select
                                    name="institution_id"
                                    value={formData.institution_id}
                                    onChange={handleChange}
                                    required
                                    className={`w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none bg-white ${errors.institution_id ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                                >
                                    <option value="">Selecciona Institución</option>
                                    {institutions.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                </select>
                            )}
                            {errors.institution_id && <p className="text-xs text-red-500 mt-1">{errors.institution_id[0]}</p>}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-institutional-600 hover:bg-institutional-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium shadow-sm min-w-[120px] text-sm"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
