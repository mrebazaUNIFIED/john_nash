import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: true,
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        post(route('login'), {
            onFinish: () => {
                setLoading(false);
                reset('password');
            },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <Head title="Acceso Administrativo" />
            
            <div className="w-full max-w-md bg-white shadow-xl rounded-xl border-0 overflow-hidden">
                <div className="text-center bg-institutional-900 text-white py-8">
                    <GraduationCap className="h-12 w-12 mx-auto mb-2 text-institutional-300" />
                    <h2 className="text-2xl font-bold">Portal Administrativo</h2>
                    <p className="text-institutional-200 text-sm mt-1">Sistema ADEC</p>
                </div>
                
                <div className="pt-8 pb-8 px-8">
                    {status && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4 border border-green-200">
                            {status}
                        </div>
                    )}
                    
                    {errors.username && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-200">
                            {errors.username}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-slate-700">
                                Usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-institutional-500 focus:border-institutional-500 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="admin"
                                required
                                autoFocus
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-slate-700">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-institutional-500 focus:border-institutional-500 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={processing || loading}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none ring-offset-white bg-institutional-600 text-white hover:bg-institutional-700 w-full text-lg h-12 shadow-md"
                            >
                                {processing || loading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...</>
                                ) : (
                                    "Ingresar al Panel"
                                )}
                            </button>
                        </div>
                    </form>
                    
                    <div className="pt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-500 hover:text-institutional-600 transition-colors inline-flex items-center gap-1"
                        >
                            ← Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
