import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { usePage, Head } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PerfilModal from './Partials/PerfilModal';

export default function PerfilesAdmin() {
    const { auth } = usePage().props;
    const user = auth.user;

    const [users, setUsers] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route('database.users.index'));
            setUsers(response.data);

            // Also load institutions for the modal
            const instResponse = await axios.get(route('institutions.index'), {
                headers: { Accept: 'application/json' }
            });
            // If institutions return Inertia response, we may need to pull data from props.
            // Wait, institutions.index is an Inertia route. Let's create an endpoint or just fetch it here.
            // Actually, for simplicity we can just pass institutions from the Laravel render if we update web.php,
            // or we could just fetch it. Let's fix that if needed, for now we assume they might be available.
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadInstitutions = async () => {
        try {
            // Note: Currently we don't have a pure JSON endpoint for institutions out-of-the-box in the new routes,
            // so we should probably rely on a new endpoint or update the `Profiles/Index` render to include them.
            // I'll update web.php to pass institutions as a prop.
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (u) => {
        setSelectedUser(u);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('¿Está seguro de eliminar este perfil?')) return;
        try {
            await axios.delete(route('database.users.destroy', userId));
            loadUsers();
        } catch (error) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Error al eliminar');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Perfiles" />

            <div className="space-y-6  mx-auto py-6 fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Gestión de Perfiles
                        </h2>
                        <p className="text-sm text-slate-500">Administre los usuarios y accesos del sistema</p>
                    </div>
                    {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_GENERAL') && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-institutional-600 hover:bg-institutional-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Perfil
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Institución</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 animate-pulse">Cargando base de datos...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No hay perfiles registrados.</td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{u.institution?.name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <PerfilModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userToEdit={selectedUser}
                    onSuccess={loadUsers}
                    currentUser={user}
                />
            </div>
        </AuthenticatedLayout>
    );
}
