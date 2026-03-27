import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { Upload } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export function InstitutionForm({ isOpen, onClose, initialData }) {
    const defaultLogo = 'https://ui-avatars.com/api/?name=IN&background=1e3a8a&color=fff';
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        status: 'active',
        logo_file: null,
        _method: 'POST', // Default to POST, we'll change if editing
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        clearErrors();
        if (initialData) {
            setData({
                name: initialData.name || '',
                status: initialData.status || 'active',
                logo_file: null,
                _method: 'PUT', // Emulate PUT for multipart form
            });
            setLogoPreview(initialData.logo_url || initialData.logo || defaultLogo);
        } else {
            reset();
            setData('_method', 'POST');
            setLogoPreview(defaultLogo);
        }
    }, [initialData, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo_file', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (initialData?.id) {
            // Update
            post(route('institutions.update', initialData.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            // Create
            post(route('institutions.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                    {initialData ? "Editar Institución" : "Nueva Institución"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Logo Upload Section */}
                    <div className="flex flex-col items-center justify-center space-y-3 mb-4">
                        <div
                            className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors relative group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center">
                                    <Upload className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] uppercase font-semibold">Logo</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div className="text-xs text-slate-500 text-center">
                            Haga clic en la imagen para cambiar el logo.<br />
                            Formato RECOMENDADO: PNG, JPG (Max 2MB)
                        </div>
                        <InputError message={errors.logo_file} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="name" value="Nombre de la Institución" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Ej: Academia John Nash - Sede Sur"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value="Estado" />
                        <select
                            id="status"
                            className="mt-1 block w-full border-slate-300 focus:border-institutional-500 focus:ring-institutional-500 rounded-md shadow-sm"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                        <InputError message={errors.status} className="mt-2" />
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
                        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? "Guardando..." : (initialData ? "Guardar Cambios" : "Crear Institución")}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
