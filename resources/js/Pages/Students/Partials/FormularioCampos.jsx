import React from 'react';

export default function FormularioCampos({ formData, handleInputChange, user, institutions, isEditing }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
                <label className="block text-sm text-slate-700 mb-1">Código de Alumno<span className="text-red-500">*</span></label>
                <input required name="student_code" value={formData.student_code} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500" />
            </div>
            <div>
                <label className="block text-sm text-slate-700 mb-1">Nombres <span className="text-red-500">*</span></label>
                <input required name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500" />
            </div>
            <div>
                <label className="block text-sm text-slate-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                <input required name="last_name_paternal" value={formData.last_name_paternal} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500" />
            </div>
            <div>
                <label className="block text-sm text-slate-700 mb-1">Apellido Materno</label>
                <input name="last_name_maternal" value={formData.last_name_maternal} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500" />
            </div>
            <div>
                <label className="block text-sm text-slate-700 mb-1">Nivel <span className="text-red-500">*</span></label>
                <select required name="level" value={formData.level} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500">
                    <option value="">Seleccione...</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Academia">Academia</option>
                </select>
            </div>
            <div>
                <label className="block text-sm text-slate-700 mb-1">Turno <span className="text-red-500">*</span></label>
                <select required name="shift" value={formData.shift} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500">
                    <option value="">Seleccione...</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                    <option value="Único">Único</option>
                </select>
            </div>
            <div>
                <label className="block text-sm text-slate-700 mb-1">Grado</label>
                <input name="grade" value={formData.grade} onChange={handleInputChange} placeholder="Ej: Primero" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500" />
            </div>
            <div>
                <label className="block text-sm text-slate-700 mb-1">Sección</label>
                <input name="section" value={formData.section} onChange={handleInputChange} placeholder="Ej: A" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500" />
            </div>
            {(user?.role === 'ADMIN_GENERAL' || user?.role === 'SUPER_ADMIN') && (
                <div className="md:col-span-2">
                    <label className="block text-sm text-slate-700 mb-1">Institución <span className="text-red-500">*</span></label>
                    <select required name="institution_id" value={formData.institution_id} onChange={handleInputChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-institutional-500">
                        <option value="">Asignar Institución...</option>
                        {institutions && institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {isEditing && (
                <div className="md:col-span-2 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={(e) => handleInputChange({
                                target: { name: 'is_active', value: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-institutional-600 focus:ring-institutional-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Alumno Activo</span>
                    </label>
                </div>
            )}
        </div>
    );
}
