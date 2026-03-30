import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function ManualEntryModal({ isOpen, onClose, onSelect, institutionId }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Clear state when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    // Live search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2) {
                handleSearch();
            } else if (query.trim().length === 0) {
                setResults([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const searchTerm = query.trim();
        if (!searchTerm) return;

        setLoading(true);
        try {
            const response = await axios.get(route('students.database'), {
                params: {
                    search: searchTerm,
                    institution_id: institutionId,
                    limit: 15
                }
            });
            // index returns paginated { data: [...] } or plain array
            const payload = response.data;
            setResults(Array.isArray(payload) ? payload : (payload.data ?? []));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Ingreso Manual de Asistencia</h2>
                
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por Nombre, Apellido o Código"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-grow border-slate-300 focus:border-institutional-500 focus:ring-institutional-500 rounded-md shadow-sm text-sm"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !query.trim()} 
                        className="bg-institutional-600 hover:bg-institutional-700 text-white p-2 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                </form>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {results.length === 0 && query && !loading && (
                        <p className="text-center text-slate-500 py-4 italic">No se encontraron alumnos.</p>
                    )}

                    {results.map(student => (
                        <div
                            key={student.id}
                            onClick={() => onSelect(student.student_code, student.institution_id)}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-institutional-500 hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                            <img src={student.photo_url || '/images/default-avatar.png'} alt="Foto" className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200" />
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-900 leading-tight group-hover:text-institutional-700">
                                    {student.last_name_paternal} {student.last_name_maternal}, {student.first_name}
                                </p>
                                <p className="text-xs text-slate-500">{student.level} - {student.grade} "{student.section}"</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Código</p>
                                <p className="text-sm font-mono font-bold text-slate-700">{student.student_code}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-sm font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
