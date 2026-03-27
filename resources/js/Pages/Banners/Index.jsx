import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import { Plus, Trash2, Link as LinkIcon, Eye, Power, X, Loader2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// ─── Banner Form Modal ───────────────────────────────────────────────────────
function BannerFormModal({ isOpen, onClose, onSuccess, currentUser }) {
    const [title, setTitle] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [file, setFile] = useState(null);
    const [position, setPosition] = useState('left');
    const [institutionId, setInstitutionId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const isGlobalAdmin = currentUser?.role === 'ADMIN_GENERAL' || currentUser?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (isOpen) {
            setTitle(''); setTargetUrl(''); setFile(null);
            setPosition('left'); setInstitutionId('');
            setStartDate(''); setEndDate(''); setErrors({});

            if (isGlobalAdmin) {
                axios.get('/database/institutions')
                    .then(r => setInstitutions(r.data))
                    .catch(() => setInstitutions([]));
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('La imagen es obligatoria');
        setLoading(true);
        setErrors({});

        const form = new FormData();
        form.append('title', title);
        form.append('image', file);
        form.append('position', position);
        form.append('start_date', startDate);
        form.append('end_date', endDate);
        if (targetUrl) form.append('target_url', targetUrl);
        if (institutionId) form.append('institution_id', institutionId);

        try {
            await axios.post(route('database.banners.store'), form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess();
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                alert(error.response?.data?.message || 'Error al guardar el banner');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputCls = (field) =>
        `w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none text-sm transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-semibold text-slate-800">Nuevo Banner Publicitario</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título del Banner *</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                            placeholder="Ej: Matrícula Abierta 2025" className={inputCls('title')} />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Enlace de Redirección <span className="text-slate-400 font-normal">(Opcional)</span></label>
                        <input type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
                            placeholder="https://wa.me/51999..." className={inputCls('target_url')} />
                        {errors.target_url && <p className="text-xs text-red-500 mt-1">{errors.target_url[0]}</p>}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio *</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className={inputCls('start_date')} />
                            {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin *</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className={inputCls('end_date')} />
                            {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date[0]}</p>}
                        </div>
                    </div>

                    {/* Position */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Posición *</label>
                        <div className="flex gap-3">
                            {[
                                { val: 'left', label: '◀ Izquierda' },
                                { val: 'right', label: 'Derecha ▶' },

                            ].map(({ val, label }) => (
                                <button key={val} type="button" onClick={() => setPosition(val)}
                                    className={`flex-1 py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all ${position === val
                                        ? 'border-institutional-500 bg-institutional-50 text-institutional-700'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Institution (admins only) */}
                    {isGlobalAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Institución</label>
                            <select value={institutionId} onChange={e => setInstitutionId(e.target.value)}
                                className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-institutional-500 outline-none bg-white text-sm">
                                <option value="">Global (todas las instituciones)</option>
                                {institutions.map(inst => (
                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-400 mt-1">«Global» aparece en la página principal. Un banner de institución solo aparece al consultar esa institución.</p>
                        </div>
                    )}

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Imagen del Banner * <span className="text-slate-400 font-normal">(Recomendado: 300×600px para lateral)</span>
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-institutional-400 transition-colors">
                            <UploadCloud className={`w-8 h-8 mb-2 ${file ? 'text-institutional-500' : 'text-slate-400'}`} />
                            <span className="text-sm text-slate-600">{file ? file.name : 'Click para seleccionar imagen'}</span>
                            <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — máx. 5MB</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
                        </label>
                        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image[0]}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-6 py-2 bg-institutional-600 hover:bg-institutional-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-sm min-w-[130px]">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Banner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Preview Modal ───────────────────────────────────────────────────────────
function PreviewModal({ banner, onClose }) {
    if (!banner) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">Vista Previa del Banner</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 flex flex-col items-center gap-4">
                    <img src={banner.image_url} alt={banner.title} className="max-w-full max-h-80 object-contain rounded-lg shadow-sm border border-slate-100" />
                    <div className="text-center">
                        <p className="font-semibold text-slate-800">{banner.title}</p>
                        <p className="text-sm text-slate-500 mt-1">Posición: {banner.position === 'left' ? '◀ Izquierda' : banner.position === 'right' ? 'Derecha ▶' : banner.position === 'top' ? '▲ Superior' : '▼ Inferior'}</p>
                        {banner.target_url && (
                            <a href={banner.target_url} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-institutional-600 hover:underline mt-1 flex items-center justify-center gap-1">
                                <LinkIcon className="w-3 h-3" />{banner.target_url}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Publicidad() {
    const { auth } = usePage().props;
    const user = auth.user;

    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [previewBanner, setPreviewBanner] = useState(null);

    const loadBanners = async () => {
        try {
            setLoading(true);
            const r = await axios.get(route('database.banners.index'));
            setBanners(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBanners(); }, []);

    const handleToggle = async (id) => {
        try {
            await axios.post(route('database.banners.toggle', id));
            loadBanners();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este banner de forma permanente?')) return;
        try {
            await axios.delete(route('database.banners.destroy', id));
            setBanners(prev => prev.filter(b => b.id !== id));
        } catch (e) { console.error(e); }
    };

    const positionLabel = (pos) => {
        const map = { left: '◀ Izquierda', right: 'Derecha ▶', top: '▲ Superior', bottom: '▼ Inferior' };
        return map[pos] || pos;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Banners Publicitarios" />

            <div className="space-y-6 fade-in w-full mx-auto py-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Banners Publicitarios</h2>
                        <p className="text-sm text-slate-500">Gestione la publicidad mostrada en el Portal de Padres</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-institutional-600 hover:bg-institutional-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Banner
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-3 text-center py-16 text-slate-500 animate-pulse">Cargando banners...</div>
                    ) : banners.length === 0 ? (
                        <div className="col-span-3 text-center py-16 text-slate-500 bg-white border-2 border-dashed border-slate-200 rounded-xl">
                            <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="font-medium">No hay banners publicitarios registrados.</p>
                            <p className="text-sm mt-1">Haz clic en «Nuevo Banner» para comenzar.</p>
                        </div>
                    ) : banners.map(banner => (
                        <div
                            key={banner.id}
                            className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all ${!banner.is_active ? 'opacity-60 grayscale' : ''}`}
                        >
                            {/* Preview Image */}
                            <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                                {banner.image_url ? (
                                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                                ) : (
                                    <UploadCloud className="w-10 h-10 text-slate-300" />
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 truncate mb-1" title={banner.title}>{banner.title}</h3>

                                {banner.target_url && (
                                    <div className="flex items-center text-xs text-blue-600 mb-2 truncate">
                                        <LinkIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <a href={banner.target_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{banner.target_url}</a>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        {banner.institution ? banner.institution.name : 'Global'}
                                    </span>
                                    <span className="text-xs font-medium text-institutional-600 bg-institutional-50 px-2 py-1 rounded border border-institutional-100">
                                        {positionLabel(banner.position)}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded border ${banner.is_active ? 'text-green-700 bg-green-50 border-green-100' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                                        {banner.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-400">
                                        {banner.start_date && banner.end_date
                                            ? `${banner.start_date} → ${banner.end_date}`
                                            : ''}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setPreviewBanner(banner)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Vista Previa">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleToggle(banner.id)}
                                            className={`p-2 rounded-lg transition-colors ${banner.is_active
                                                ? 'text-institutional-600 hover:bg-institutional-50'
                                                : 'text-slate-400 hover:bg-slate-100'}`}
                                            title={banner.is_active ? 'Desactivar' : 'Activar'}>
                                            <Power className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(banner.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <BannerFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={loadBanners}
                currentUser={user}
            />
            <PreviewModal banner={previewBanner} onClose={() => setPreviewBanner(null)} />
        </AuthenticatedLayout>
    );
}
