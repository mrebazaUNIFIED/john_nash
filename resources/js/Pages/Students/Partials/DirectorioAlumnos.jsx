import React, { useState, useEffect } from 'react';
import { Card } from '@/Components/ui/Card';
import { Search, Loader2, Edit2, Trash2, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import ModalEdicionAlumno from './ModalEdicionAlumno';

export default function DirectorioAlumnos({ institutions }) {
    const { auth } = usePage().props;
    const user = auth.user;
    
    const [students, setStudents] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [filterInst, setFilterInst] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterShift, setFilterShift] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 50;

    // Modals
    const [editingStudent, setEditingStudent] = useState(null);
    const [deletingStudent, setDeletingStudent] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            loadStudents();
        }, 300);
        return () => clearTimeout(handler);
    }, [currentPage, searchQuery, filterInst, filterLevel, filterShift]);

    const loadStudents = async () => {
        setLoadingData(true);
        try {
            const response = await axios.get(route('students.database'), {
                params: {
                    page: currentPage,
                    limit: limit,
                    search: searchQuery,
                    institution_id: filterInst,
                    level: filterLevel,
                    shift: filterShift
                }
            });
            const result = response.data;
            setStudents(result.data);
            setTotalPages(result.pagination?.total_pages || result.last_page);
            setTotalRecords(result.pagination?.total_records || result.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingData(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingStudent) return;
        setIsDeleting(true);
        try {
            await axios.delete(route('students.database.destroy', deletingStudent.id));
            setDeletingStudent(null);
            loadStudents();
        } catch (error) {
            alert('Error al eliminar: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card>
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
                <div className="relative flex-grow w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombres o código de alumno"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-institutional-500 shadow-sm"
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                    <select
                        className="bg-white border border-slate-200 rounded-md text-sm px-3 py-2 min-w-[120px] shadow-sm"
                        value={filterLevel}
                        onChange={e => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Todos los Niveles</option>
                        <option value="Inicial">Inicial</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Academia">Academia</option>
                    </select>

                    <select
                        className="bg-white border border-slate-200 rounded-md text-sm px-3 py-2 min-w-[120px] shadow-sm"
                        value={filterShift}
                        onChange={e => { setFilterShift(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Todos los Turnos</option>
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noche">Noche</option>
                        <option value="Único">Único</option>
                    </select>

                    {(user?.role === 'ADMIN_GENERAL' || user?.role === 'SUPER_ADMIN') && (
                        <select
                            className="bg-white border border-slate-200 rounded-md text-sm px-3 py-2 min-w-[150px] shadow-sm"
                            value={filterInst}
                            onChange={e => { setFilterInst(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">Todas las Instituciones</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Alumno</th>
                            <th className="px-6 py-4">Código</th>
                            <th className="px-6 py-4">Nivel / Turno</th>
                            <th className="px-6 py-4 text-center">Grado / Secc</th>
                            {(user?.role === 'ADMIN_GENERAL' || user?.role === 'SUPER_ADMIN') && <th className="px-6 py-4">Institución</th>}
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingData ? (
                            <tr>
                                <td colSpan={(user?.role === 'ADMIN_GENERAL' || user?.role === 'SUPER_ADMIN') ? "6" : "5"} className="text-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-institutional-400 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">Cargando base de datos...</p>
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan={(user?.role === 'ADMIN_GENERAL' || user?.role === 'SUPER_ADMIN') ? "6" : "5"} className="text-center py-8 text-slate-500">
                                    No se encontraron registros.
                                </td>
                            </tr>
                        ) : students.map((student) => {
                            const isInactive = student.is_active === 0 || student.is_active === false;
                            
                            return (
                                <tr key={student.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${isInactive ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                        <img src={student.photo_url || '/images/default-avatar.png'} alt="Foto" className={`w-10 h-10 rounded-full border border-slate-200 shadow-sm object-cover bg-white ${isInactive ? 'grayscale' : ''}`} />
                                        <div>
                                            <p className="flex items-center gap-2">
                                                {student.last_name_paternal} {student.last_name_maternal}
                                                {isInactive && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-normal uppercase">Inactivo</span>}
                                            </p>
                                            <p className="font-normal text-slate-500">{student.first_name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-slate-700">{student.student_code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-700">{student.level || '-'}</span>
                                        <span className="block text-xs text-slate-500">{student.shift || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-700">
                                        {student.grade} - "{student.section}"
                                    </td>
                                    {(user?.role === 'ADMIN_GENERAL' || user?.role === 'SUPER_ADMIN') && (
                                        <td className="px-6 py-4 text-slate-600">
                                            {student.institution?.name || 'Sin institución'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingStudent(student)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingStudent(student)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    isInactive 
                                                        ? 'text-slate-300 cursor-not-allowed' 
                                                        : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                }`}
                                                disabled={isInactive}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 text-sm">
                <div className="text-slate-500">
                    Mostrando {totalRecords > 0 ? (currentPage - 1) * limit + 1 : 0} a {Math.min(currentPage * limit, totalRecords)} de <span className="font-medium text-slate-700">{totalRecords}</span> alumnos
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loadingData}
                        className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-3 py-1 font-medium text-slate-700">Pág {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || loadingData || totalPages === 0}
                        className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Modals */}
            <ModalEdicionAlumno
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                student={editingStudent}
                user={user}
                institutions={institutions}
                onSuccess={loadStudents}
            />

            {deletingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Desactivar Alumno</h3>
                            <p className="text-slate-500">
                                ¿Estás seguro de que deseas desactivar a <b>{deletingStudent.first_name} {deletingStudent.last_name_paternal}</b>? 
                                <br />El registro no será borrado, pero ya no estará activo en el sistema base de asistencias.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingStudent(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all disabled:opacity-50"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Sí, desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
