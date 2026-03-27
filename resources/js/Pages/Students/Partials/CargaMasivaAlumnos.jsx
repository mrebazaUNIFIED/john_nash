import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function CargaMasivaAlumnos({ institutions, onSuccess }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [file, setFile] = useState(null);
    const [uploadLevel, setUploadLevel] = useState('');
    const [uploadShift, setUploadShift] = useState('');
    const [uploadInstitution, setUploadInstitution] = useState('');
    const [status, setStatus] = useState('idle');
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!uploadLevel || !uploadShift) {
            alert('Por favor selecciona el nivel y el turno antes de subir el archivo.');
            return;
        }
        if (user?.role === 'ADMIN_GENERAL' && !uploadInstitution) {
            alert('Por favor selecciona la institución destino.');
            return;
        }
        
        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('level', uploadLevel);
        formData.append('shift', uploadShift);
        if (uploadInstitution) formData.append('institution_id', uploadInstitution);

        try {
            const res = await axios.post(route('students.upload'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            setStatus('complete');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Upload Error:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al intentar realizar la subida.';
            alert("Error: " + errorMsg);
            setStatus('idle');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-8">
                {status === 'complete' ? (
                    <div className="text-center py-10 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Carga completada!</h3>
                        <p className="text-slate-600 mb-2">Se insertaron <span className="font-bold">{result?.imported}</span> registros correctamente de un total de <span className="font-bold">{result?.processed}</span>.</p>

                        {result?.errors && result.errors.length > 0 && (
                            <div className="mt-4 mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                                <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                                    ⚠️ Se ignoraron {result.errors.length} registro(s) por falta de datos o código duplicado:
                                </p>
                                <div className="max-h-32 overflow-y-auto text-xs text-red-600 space-y-1 bg-red-100/50 p-2 rounded">
                                    {result.errors.map((err, i) => (
                                        <p key={i} className="font-mono">{err}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={() => { setFile(null); setStatus('idle'); }} 
                            className="px-4 py-2 mt-4 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
                        >
                            Subir otro archivo
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-12 transition-colors hover:border-institutional-400 hover:bg-institutional-50 group">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-2xl text-left">
                            {(user?.role === 'ADMIN_GENERAL' || user?.role === 'SUPER_ADMIN') && (
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Institución Destino <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institutional-500 shadow-sm"
                                        value={uploadInstitution}
                                        onChange={e => setUploadInstitution(e.target.value)}
                                    >
                                        <option value="">Seleccione Institución...</option>
                                        {institutions && institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nivel <span className="text-red-500">*</span></label>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institutional-500 shadow-sm"
                                    value={uploadLevel}
                                    onChange={e => setUploadLevel(e.target.value)}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Inicial">Inicial</option>
                                    <option value="Primaria">Primaria</option>
                                    <option value="Secundaria">Secundaria</option>
                                    <option value="Academia">Academia</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Turno <span className="text-red-500">*</span></label>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-institutional-500 shadow-sm"
                                    value={uploadShift}
                                    onChange={e => setUploadShift(e.target.value)}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                    <option value="Noche">Noche</option>
                                    <option value="Único">Único</option>
                                </select>
                            </div>
                        </div>

                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center cursor-pointer text-center"
                        >
                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-10 h-10 text-institutional-500" />
                            </div>

                            {file ? (
                                <div className="flex flex-col items-center">
                                    <p className="font-semibold text-slate-700 flex items-center gap-2 mb-1">
                                        <FileSpreadsheet className="w-4 h-4" /> {file.name}
                                    </p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">Seleccione un archivo o arrástrelo aquí</h3>
                                    <p className="text-sm text-slate-500 mb-4">Solo formatos Excel (.xlsx, .xls) o CSV</p>
                                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-md shadow-sm text-sm font-medium text-slate-700">
                                        Explorar archivos
                                    </div>
                                </>
                            )}
                        </label>

                        {file && status !== 'uploading' && (
                            <div className="mt-8 pt-6 border-t border-slate-200 w-full flex justify-center fade-in">
                                <button 
                                    onClick={handleUpload} 
                                    className="px-8 py-2 bg-institutional-600 text-white font-medium rounded-md hover:bg-institutional-700 transition-colors"
                                >
                                    Iniciar Importación
                                </button>
                            </div>
                        )}

                        {status === 'uploading' && (
                            <div className="mt-8 pt-6 border-t border-slate-200 w-full flex justify-center items-center flex-col fade-in">
                                <Loader2 className="w-8 h-8 animate-spin text-institutional-600 mb-3" />
                                <p className="text-sm font-medium text-slate-600">Procesando registros, por favor espere...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
