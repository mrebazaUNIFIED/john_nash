import React, { useState, useRef } from 'react';
import { Images, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function CargaMasiva() {
    const [massiveFiles, setMassiveFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [isUploadingMassive, setIsUploadingMassive] = useState(false);
    const [massiveResults, setMassiveResults] = useState([]);
    const massiveFileInputRef = useRef(null);

    const handleMassiveFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setMassiveFiles(Array.from(e.target.files));
            setMassiveResults([]);
            setUploadProgress(null);
        }
    };

    const handleUploadMassive = async () => {
        if (massiveFiles.length === 0) return;
        setIsUploadingMassive(true);
        setUploadProgress({ current: 0, total: massiveFiles.length });

        const results = [];

        for (let i = 0; i < massiveFiles.length; i++) {
            const file = massiveFiles[i];
            const dniMatch = file.name.match(/^(\d+)/); // Extracts numbers at the beginning

            if (!dniMatch) {
                results.push({ file: file.name, status: 'error', message: 'No inicia con números' });
            } else {
                const dni = dniMatch[1];
                const form = new FormData();
                form.append('photo', file);

                try {
                    await axios.post(route('students.photo.dni', dni), form, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    results.push({ file: file.name, status: 'success', dni });
                } catch (error) {
                    results.push({ 
                        file: file.name, 
                        status: 'error', 
                        message: error.response?.data?.message || 'Error del servidor', 
                        dni 
                    });
                }
            }

            setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setMassiveResults(results);
        setIsUploadingMassive(false);
        setMassiveFiles([]);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-12 text-center group transition-colors hover:border-institutional-400">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                    <Images className="w-10 h-10 text-institutional-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Seleccione múltiples imágenes</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    Los archivos deben tener como nombre el Código del Alumno (Ej: <b>72481923.jpg</b>) para que el sistema las asigne automáticamente.
                </p>

                <input
                    type="file"
                    accept="image/jpeg, image/png"
                    multiple
                    className="hidden"
                    ref={massiveFileInputRef}
                    onChange={handleMassiveFileChange}
                />

                {massiveFiles.length === 0 ? (
                    <button 
                        className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                        onClick={() => massiveFileInputRef.current?.click()}
                    >
                        Seleccionar Archivos
                    </button>
                ) : (
                    <div className="space-y-4 w-full">
                        <p className="font-medium text-slate-700">{massiveFiles.length} archivos seleccionados</p>
                        <div className="flex gap-2 justify-center">
                            <button 
                                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
                                onClick={() => setMassiveFiles([])} 
                                disabled={isUploadingMassive}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="px-4 py-2 bg-institutional-600 text-white font-medium rounded-md hover:bg-institutional-700 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
                                onClick={handleUploadMassive} 
                                disabled={isUploadingMassive}
                            >
                                {isUploadingMassive ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : 'Subir Archivos'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Progreso y Resultados */}
            {(uploadProgress || massiveResults.length > 0) && (
                <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                        <h4 className="font-semibold text-slate-800">
                            Resultados de Carga Múltiple
                        </h4>
                        {uploadProgress && (
                            <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                                {uploadProgress.current} de {uploadProgress.total} procesados
                            </span>
                        )}
                    </div>

                    <div className="max-h-64 overflow-y-auto p-0">
                        {massiveResults.length === 0 && uploadProgress && (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-institutional-500" />
                                <p>Subiendo {uploadProgress.total} imágenes, por favor espere...</p>
                            </div>
                        )}

                        {massiveResults.length > 0 && (
                            <ul className="divide-y divide-slate-100">
                                {massiveResults.map((result, idx) => (
                                    <li key={idx} className="p-3 flex items-center justify-between text-sm hover:bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            {result.status === 'success' ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            <span className="font-medium text-slate-700">{result.file}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${result.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {result.status === 'success' ? 'Éxito' : result.message}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
