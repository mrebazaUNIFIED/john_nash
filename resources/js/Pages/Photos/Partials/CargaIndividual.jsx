import React, { useState, useRef } from 'react';
import { ImagePlus, Search, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function CargaIndividual() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedStudent, setSearchedStudent] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [individualFile, setIndividualFile] = useState(null);
    const [isUploadingIndividual, setIsUploadingIndividual] = useState(false);
    const [individualMessage, setIndividualMessage] = useState({ text: '', type: '' });
    const fileInputRef = useRef(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchedStudent(null);
        setIndividualMessage({ text: '', type: '' });
        try {
            const response = await axios.get(route('students.database'), {
                params: { search: searchQuery, limit: 1 }
            });
            if (response.data.data && response.data.data.length > 0) {
                setSearchedStudent(response.data.data[0]);
            } else {
                setIndividualMessage({ text: 'Alumno no encontrado', type: 'error' });
            }
        } catch (error) {
            setIndividualMessage({ text: 'Error al buscar alumno', type: 'error' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleIndividualFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setIndividualFile(e.target.files[0]);
            setIndividualMessage({ text: '', type: '' });
        }
    };

    const handleUploadIndividual = async () => {
        if (!searchedStudent || !individualFile) return;
        setIsUploadingIndividual(true);
        setIndividualMessage({ text: '', type: '' });
        
        const form = new FormData();
        form.append('photo', individualFile);

        try {
            const res = await axios.post(route('students.photo', searchedStudent.id), form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIndividualMessage({ text: 'Foto subida exitosamente', type: 'success' });
            setSearchedStudent({ ...searchedStudent, photo_url: res.data.photo_url });
            setIndividualFile(null);
        } catch (error) {
            setIndividualMessage({ text: error.response?.data?.message || error.message || 'Error al subir foto', type: 'error' });
        } finally {
            setIsUploadingIndividual(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-300">
            {/* Panel Izquierdo: Buscador */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Buscar Alumno</h3>
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Ingrese nombres o código de alumno"
                        className="flex-grow bg-white border border-slate-200 rounded-md text-sm px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-institutional-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                        onClick={handleSearch} 
                        disabled={isSearching}
                        className="px-4 py-2 bg-institutional-600 text-white rounded-md hover:bg-institutional-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[3rem]"
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                </div>

                {searchedStudent ? (
                    <div className="p-4 border border-institutional-200 rounded-lg bg-institutional-50 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200 shadow-sm">
                            <img src={searchedStudent.photo_url || '/images/default-avatar.png'} alt="Alumno" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">{searchedStudent.last_name_paternal} {searchedStudent.last_name_maternal}, {searchedStudent.first_name}</p>
                            <p className="text-sm text-slate-600">Código: {searchedStudent.student_code}</p>
                            <p className="text-sm text-slate-600">Nivel: {searchedStudent.level} | Turno: {searchedStudent.shift}</p>
                            <p className="text-sm text-slate-600">Grado: {searchedStudent.grade} | Secc: {searchedStudent.section}</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <p className="text-sm text-slate-500 text-center py-4">
                            {individualMessage.type === 'error' ? individualMessage.text : 'Realice una búsqueda para seleccionar al alumno por nombres o código'}
                        </p>
                    </div>
                )}
            </div>

            {/* Panel Derecho: Subida */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-6 h-auto min-h-[16rem] text-center">
                {!searchedStudent ? (
                    <>
                        <ImagePlus className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="font-medium text-slate-500">Seleccione un Alumno primero</p>
                    </>
                ) : (
                    <>
                        <UploadCloud className={`w-12 h-12 mb-3 ${individualFile ? 'text-institutional-500' : 'text-slate-400'}`} />
                        <p className="font-medium text-slate-700">
                            {individualFile ? individualFile.name : 'Seleccione la fotografía'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Formato JPG o PNG, máximo 2MB</p>

                        <input
                            type="file"
                            accept="image/jpeg, image/png"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleIndividualFileChange}
                        />

                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingIndividual}
                            >
                                {individualFile ? 'Cambiar Archivo' : 'Examinar'}
                            </button>

                            {individualFile && (
                                <button
                                    className="px-4 py-2 bg-institutional-600 text-white font-medium rounded-md hover:bg-institutional-700 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
                                    onClick={handleUploadIndividual}
                                    disabled={isUploadingIndividual}
                                >
                                    {isUploadingIndividual ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Subir Foto
                                </button>
                            )}
                        </div>

                        {individualMessage.text && individualMessage.type === 'success' && (
                            <p className="text-sm text-green-600 mt-4 flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> {individualMessage.text}
                            </p>
                        )}
                        {individualMessage.text && individualMessage.type === 'error' && (
                            <p className="text-sm text-red-600 mt-4 flex items-center justify-center gap-1">
                                <AlertCircle className="w-4 h-4" /> {individualMessage.text}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
