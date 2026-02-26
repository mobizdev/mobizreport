'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, addTab } from '../store';
import MainLayout from '../components/MainLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
    const { token } = useSelector((state: RootState) => state.auth);
    const { tabs } = useSelector((state: RootState) => state.tabs);
    const dispatch = useDispatch();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Automatically open 'Akunting' category if no tabs open and authenticated
        if (token && tabs.length === 0) {
            dispatch(addTab({ id: 'akunting', contentId: 'akunting', title: 'Akunting', type: 'category' }));
        }
    }, [token, tabs.length, dispatch]);

    if (!isClient) return null;

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
                <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                    <div className="bg-red-50 text-red-500 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6 text-3xl font-black">
                        !
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Akses Ditolak</h1>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Harap buka laporan dari aplikasi utama Anda untuk mendapatkan token autentikasi yang valid.
                    </p>
                    <div className="p-4 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 uppercase tracking-widest">
                        Sesi Tidak Ditemukan
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            {/* The MainLayout handles the rendering of content based on activeTabId */}
            {/* If there were no tabs, this area would show the fallback from MainLayout */}
            {tabs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <LayoutDashboard size={80} strokeWidth={1} className="mb-4 opacity-10" />
                    <p className="text-xl font-black uppercase tracking-widest">Memuat Dashboard...</p>
                </div>
            )}
        </MainLayout>
    );
}
