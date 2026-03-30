import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, Search, Settings, User, Clock, BookOpen } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ManualEntryModal from './Partials/ManualEntryModal';
import ScannerLayout from '@/Layouts/ScannerLayout';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Index({ institution, statsToday }) {
    const { auth } = usePage().props;
    const user = auth.user;
    
    const inputRef = useRef(null);
    const [inputVal, setInputVal] = useState('');
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [lastStudent, setLastStudent] = useState(null);
    const [lastAttendance, setLastAttendance] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [registryCount, setRegistryCount] = useState(statsToday || 0);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    useEffect(() => {
        // Auto-focus mechanism to keep the barcode scanner input active
        const focusInterval = setInterval(() => {
            if (!isManualModalOpen && document.activeElement !== inputRef.current) {
                inputRef.current?.focus();
            }
        }, 1000);

        return () => clearInterval(focusInterval);
    }, [isManualModalOpen]);

    const handleScan = async (code) => {
        if (!code) return;

        try {
            const response = await axios.post(route('attendance.register'), { 
                student_code: code,
                institution_id: institution?.id
            });

            const result = response.data;

            if (result.success) {
                setLastStudent(result.data.student);
                setLastAttendance(result.data.attendance);
                setStatus('success');
                setRegistryCount(prev => prev + 1);
            } else {
                setStatus('error');
                setErrorMessage(result.message || 'Acceso denegado');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Error de servidor. Intente de nuevo.');
        }

        // Reset UI after 4 seconds
        setTimeout(() => {
            setStatus('idle');
            setLastStudent(null);
            setLastAttendance(null);
            setErrorMessage('');
        }, 4000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const code = inputVal.trim();
            setInputVal('');
            if (code) {
                handleScan(code);
            }
        }
    };

    const containerColors = {
        idle: 'bg-slate-900 border-slate-800',
        success: 'bg-green-600 border-green-500',
        error: 'bg-red-600 border-red-500'
    };

    return (
        <ScannerLayout>
            <div className={cn('absolute inset-0 transition-colors duration-300 flex overflow-hidden', containerColors[status])}>
                <Head title="Escáner de Asistencia" />

                {/* Hidden Input for Barcode Scanner */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="fixed top-[-100px] left-[-100px] opacity-0"
                    autoFocus
                />

                {/* Main Panel */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative">

                    {/* Header Info */}
                    <div className="absolute top-6 left-6 bg-slate-950/50 rounded-xl px-5 py-3 border border-white/10 backdrop-blur-md flex items-center gap-4 shadow-2xl z-10">
                        <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-inner">
                            <img src={institution?.logo_url || '/images/logo.jpeg'} className="w-full h-full object-contain" alt="logo" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white uppercase tracking-tight">{institution?.name || 'Academia'}</p>
                            <p className="text-xs text-slate-400 font-medium">Registros hoy: <span className="text-institutional-400 font-bold ml-1">{registryCount}</span></p>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 flex gap-3 z-10">
                        <button
                            onClick={() => setIsManualModalOpen(true)}
                            className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-xl border border-white/10 shadow-xl backdrop-blur-md transition-all active:scale-95"
                            title="Ingreso Manual"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_GENERAL') && (
                            <button
                                className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-xl border border-white/10 shadow-xl backdrop-blur-md transition-all active:scale-95"
                                title="Configuración"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* IDLE State */}
                    {status === 'idle' && (
                        <div className="text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-40 h-40 mx-auto rounded-full bg-slate-800/50 border-4 border-slate-800 flex items-center justify-center mb-8 shadow-2xl relative">
                                <Search className="w-16 h-16 text-slate-600 animate-pulse" />
                                <div className="absolute inset-0 rounded-full border-2 border-slate-700 animate-ping opacity-20"></div>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight uppercase">Esperando Código...</h2>
                            <p className="text-slate-500 mt-4 text-xl font-medium">Acerca el carnet al lector de barras</p>
                        </div>
                    )}

                    {/* SUCCESS State */}
                    {status === 'success' && lastStudent && (
                        <div className="text-center animate-in zoom-in duration-300">
                            <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-[10px] border-white shadow-2xl bg-white mb-8 relative group">
                                {lastStudent.photo_url
                                    ? <img src={lastStudent.photo_url} alt="Alumno" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center bg-green-50"><User className="w-24 h-24 text-green-200" /></div>
                                }
                            </div>
                            <div className="bg-white/20 backdrop-blur-lg inline-flex items-center gap-3 px-8 py-3 rounded-full mb-6 shadow-xl border border-white/20">
                                <CheckCircle className="w-8 h-8 text-white" />
                                <span className="text-white font-black tracking-widest text-2xl uppercase">¡Ingreso Registrado!</span>
                            </div>
                            <h2 className="text-5xl font-black text-white leading-tight drop-shadow-2xl uppercase tracking-tighter">
                                {lastStudent.full_name || `${lastStudent.first_name} ${lastStudent.last_name_paternal}`}
                            </h2>
                            <p className="text-green-100 text-2xl mt-4 font-bold drop-shadow-md bg-green-900/30 px-6 py-2 rounded-xl inline-block">
                                 {lastStudent.grade} - {lastStudent.section}
                            </p>
                        </div>
                    )}

                    {/* ERROR State */}
                    {status === 'error' && (
                        <div className="text-center animate-in shake duration-300">
                            <div className="w-40 h-40 mx-auto rounded-full bg-red-700 border-[8px] border-white/20 flex items-center justify-center mb-8 shadow-2xl">
                                <XCircle className="w-20 h-20 text-white" />
                            </div>
                            <h2 className="text-5xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter uppercase">Acceso Denegado</h2>
                            <div className="bg-red-800/40 backdrop-blur-md px-10 py-5 rounded-2xl border border-white/10 inline-block shadow-2xl">
                                <p className="text-white text-2xl font-bold uppercase italic">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar with scanned student details */}
                {status === 'success' && lastStudent && lastAttendance && (
                    <div className="w-96 bg-slate-950/80 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-center p-10 gap-8 animate-in slide-in-from-right duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
                        <div>
                             <p className="text-institutional-400 text-xs uppercase tracking-[0.3em] font-black mb-6">Detalles del Registro</p>
                             
                             <div className="flex justify-center mb-8">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-green-500 bg-white shadow-2xl transform rotate-3">
                                    {lastStudent.photo_url
                                        ? <img src={lastStudent.photo_url} alt="foto" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center bg-green-50"><User className="w-12 h-12 text-green-200" /></div>
                                    }
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-white text-2xl font-black leading-tight uppercase tracking-tight">{lastStudent.first_name}</h3>
                                <p className="text-slate-400 font-bold uppercase text-sm mt-1">{lastStudent.last_name_paternal}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-2xl px-5 py-4 border border-white/5 flex items-center gap-4">
                                <div className="p-3 bg-institutional-500/20 rounded-xl">
                                    <BookOpen className="w-5 h-5 text-institutional-400" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Nivel / Grado</p>
                                    <p className="text-white text-base font-bold">{lastStudent.level} - {lastStudent.grade}</p>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-2xl px-5 py-4 border border-white/5 flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hora de Ingreso</p>
                                    <p className="text-white text-base font-bold">{lastAttendance.time}</p>
                                </div>
                            </div>

                            <div className={cn(
                                "rounded-2xl px-5 py-4 border flex items-center gap-4 shadow-lg",
                                lastAttendance.status === 'PUNTUAL' 
                                    ? "bg-green-500/10 border-green-500/20" 
                                    : "bg-amber-500/10 border-amber-500/20"
                            )}>
                                <div className={cn(
                                    "p-3 rounded-xl",
                                    lastAttendance.status === 'PUNTUAL' ? "bg-green-500/20" : "bg-amber-500/20"
                                )}>
                                    <CheckCircle className={cn(
                                        "w-5 h-5",
                                        lastAttendance.status === 'PUNTUAL' ? "text-green-400" : "text-amber-400"
                                    )} />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Estado</p>
                                    <p className={cn(
                                        "text-lg font-black italic uppercase",
                                        lastAttendance.status === 'PUNTUAL' ? "text-green-400" : "text-amber-400"
                                    )}>
                                        {lastAttendance.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto text-center py-4">
                             <p className="text-slate-600 text-xs font-mono">{lastAttendance.date}</p>
                        </div>
                    </div>
                )}

                <ManualEntryModal
                    isOpen={isManualModalOpen}
                    onClose={() => setIsManualModalOpen(false)}
                    onSelect={(codigo, instId) => {
                        setIsManualModalOpen(false);
                        handleScan(codigo, instId);
                    }}
                    institutionId={institution?.id}
                />
            </div>
        </ScannerLayout>
    );
}
