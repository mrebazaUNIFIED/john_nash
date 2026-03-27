import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, History, User, CheckCircle2, AlertCircle, Calendar, Search } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';

export default function Resultado({ student, institution, todayRecord, history, banners }) {
    const [filterDate, setFilterDate] = useState('');
    const [filteredHistory, setFilteredHistory] = useState(history);

    useEffect(() => {
        if (!filterDate) {
            setFilteredHistory(history);
        } else {
            setFilteredHistory(
                history.filter(r => r.date === filterDate)
            );
        }
    }, [history, filterDate]);

    return (
        <PublicLayout banners={banners}>
            <Head title={`Resultado - ${student.first_name}`} />

            <div className="max-w-xl mx-auto w-full py-6 flex flex-col gap-6 animate-in fade-in duration-500">
                <Link
                    href={`/consulta?institution_id=${institution.id}`}
                    className="flex items-center text-sm font-black text-slate-500 hover:text-institutional-600 transition-colors self-start uppercase tracking-widest group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Nueva Consulta
                </Link>

                {/* Status Indicator Bar */}
                <div className={cn(
                    "w-full py-4 px-8 rounded-3xl shadow-lg flex items-center justify-between",
                    todayRecord?.status === 'PUNTUAL' ? "bg-green-600" :
                    todayRecord?.status === 'TARDANZA' ? "bg-amber-500" : "bg-slate-300"
                )}>
                    <div className="flex items-center gap-3">
                        {todayRecord ? (
                            todayRecord.status === 'PUNTUAL' 
                                ? <CheckCircle2 className="w-8 h-8 text-white" /> 
                                : <AlertCircle className="w-8 h-8 text-white" />
                        ) : <Search className="w-8 h-8 text-white opacity-50" />}
                        <span className="text-white font-black text-xl uppercase tracking-tighter">
                            {todayRecord ? (todayRecord.status === 'PUNTUAL' ? 'Presente' : 'Tardanza') : 'Sin Registro Hoy'}
                        </span>
                    </div>
                    {todayRecord && (
                        <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-white font-black text-sm border border-white/20">
                            {todayRecord.time}
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="bg-white overflow-hidden border border-slate-100 shadow-xl shadow-slate-200 rounded-[2.5rem]">
                    <div className="relative">
                        <div className="h-24 bg-slate-900"></div>
                        <div className="px-10 pb-10">
                            <div className="flex justify-between items-start -mt-12 mb-6">
                                <div className="relative">
                                    <img
                                        src={student.photo_url || '/images/default-avatar.png'}
                                        alt={student.first_name}
                                        className="w-32 h-32 rounded-3xl border-[6px] border-white shadow-xl bg-white object-cover transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-institutional-600 text-white p-2 rounded-xl shadow-lg">
                                        <User className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="pt-16 text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Institución</p>
                                    <p className="font-black text-slate-900 text-xs uppercase tracking-tight">{institution.name}</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                                        {student.first_name}
                                    </h1>
                                    <span className="text-xl font-bold text-slate-400 uppercase italic">{student.last_name_paternal}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-institutional-500"></span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{student.level}</span>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{student.grade} "{student.section}"</span>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{student.codigo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl text-white">
                                <History className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg italic">Historial Reciente</h3>
                        </div>
                        
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="date"
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-institutional-100 focus:border-institutional-400 transition-all"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map(record => (
                                <div key={record.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                                            record.status === 'PUNTUAL' ? "bg-green-50" : "bg-amber-50"
                                        )}>
                                            <Clock className={cn(
                                                "w-5 h-5",
                                                record.status === 'PUNTUAL' ? "text-green-600" : "text-amber-600"
                                            )} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tight text-xs">
                                                {new Date(record.date).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Registrado a las {record.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                        record.status === 'PUNTUAL' ? "bg-green-600 text-white" : "bg-amber-500 text-white"
                                    )}>
                                        {record.status}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-10 rounded-[2rem] border border-dashed border-slate-200 text-center">
                                <Search className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    No hay registros disponibles
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
