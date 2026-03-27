import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Lock, GraduationCap } from 'lucide-react';

function BannerSkeleton() {
    return (
        <div className="w-[85%] h-[55%] rounded-xl animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]" />
    );
}

function BannerColumn({ banners, side, loading, show }) {
    const filtered = banners.filter((b) => b.position === side);
    if (!show) return null;

    return (
        <div 
            className="hidden lg:flex flex-shrink-0 justify-center items-center sticky top-0" 
            style={{ width: 'clamp(450px, 20vw, 650px)', height: 'calc(100vh - 90px)' }}
        >
            {loading ? (
                <BannerSkeleton />
            ) : (
                filtered.map((banner) => (
                    <div key={banner.id} className="flex justify-center items-center w-full h-full">
                        {banner.target_url ? (
                            <a href={banner.target_url} target="_blank" rel="noopener noreferrer" className="w-full flex justify-center">
                                <img src={banner.image_url} alt={banner.title} className="w-[90%] h-auto max-h-[90%] object-contain rounded-xl shadow-lg" />
                            </a>
                        ) : (
                            <img src={banner.image_url} alt={banner.title} className="w-[90%] h-auto max-h-[90%] object-contain rounded-xl shadow-lg" />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default function PublicLayout({ children, banners = [], loading = false }) {
    const showColumns = loading || (banners && banners.length > 0);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>

            <header className="bg-institutional-900 text-white p-4 shadow-md z-20">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <img src="/images/logo.jpeg" alt="Academia John Nash" className="h-12 object-contain" />
                        <span className="text-lg font-bold text-white hidden sm:inline leading-tight">ADEC - Academia Preuniversitaria</span>
                    </Link>
                    <Link
                        href={route('login')}
                        className="flex items-center gap-1.5 text-sm font-medium bg-institutional-800 hover:bg-institutional-700 px-3 py-1.5 rounded-md transition-colors border border-institutional-700 hover:border-institutional-600"
                    >
                        <Lock className="w-4 h-4" />
                        <span className="hidden sm:inline">Acceso Administrativo</span>
                    </Link>
                </div>
            </header>

            <main className="flex-grow flex flex-row w-full">
                <BannerColumn banners={banners} side="left" loading={loading} show={showColumns} />
                
                <div className="flex-grow flex flex-col min-w-0 px-4 py-4 min-w-[340px]">
                    {children}
                </div>

                <BannerColumn banners={banners} side="right" loading={loading} show={showColumns} />
            </main>

            <footer className="bg-slate-100 p-4 text-center text-slate-500 text-sm mt-auto border-t border-slate-200">
                &copy; {new Date().getFullYear()} Academia John Nash. Todos los derechos reservados.
            </footer>
        </div>
    );
}
