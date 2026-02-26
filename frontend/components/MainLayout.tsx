'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addTab, removeTab, setActiveTab, Tab } from '../store';
import { 
    LayoutDashboard, FileText, Settings, X, Search, 
    LineChart, Wallet, Briefcase, Package, ShoppingCart, 
    TrendingUp, UserCheck, Calculator, Landmark, BookOpen, Scale, Palette,
    Filter, RefreshCw, Lock
} from 'lucide-react';
import StimulsoftViewer from './StimulsoftViewer';
import StimulsoftDesigner from './StimulsoftDesigner';
import COALookupModal from './COALookupModal';
import ReportInput from './ReportInput';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

declare var Stimulsoft: any;

const applyLicense = () => {
    if (typeof Stimulsoft !== 'undefined' && Stimulsoft.Base) {
        Stimulsoft.Base.StiLicense.Key =
          '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkCHOndDMGcaz4hq3BqQ8ZAG9tkrDjUtDcD7ZE6KFqmx8dAWd' +
          'kdcXnPKxraZiw+UTvTEyvXeViQmIkepCw+OxFDSlI7FfqE8giSZjTv8SXY4Zsl4hxBr3tQJrn4BDvR7f6irJdta9Sc' +
          'd+oSTR4bzZ0vber87GdVhJlUsyI6ZMYsXpQ8ZyGEDquwoP+MyLOsunpBgortlUfiQQ0eCBlWKmvYnuuApPa6+E2BPH' +
          'FrJ59zjgQH8Io7bvvRVTdLFCpV8n1iwdR8anxYut/RwhvM504chrOdbppBI90KIXRtCi/K+vvhwicoRLerYpNttZME' +
          '0CYQMX8v2tinIh7+S75vTrxV7PZLPCPE4+mtKtV+wvgopakQrFR9FJ107CqVIRguopAdGJ5qL4hPLC5G3sC9kz0muY' +
          'X1yOxeWDE6y3VoGCQL/zCsaZZqHdoRSNVrWhlymVRo0OFqTK/dgyAm2Lr/NXwS0LvEiwf+hiNmWh/SrCt+Zl6ZttuP' +
          '3sJhl28e3eWZ5lTLF6FWM5HTETVpegOmQtMi';
    } else {
        setTimeout(applyLicense, 1000); 
    }
};

if (typeof window !== 'undefined') {
    applyLicense();
}

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const sidebarItems = [
    { id: 'akunting', label: 'Akunting', icon: LineChart },
    { id: 'kas-bank', label: 'Kas Bank', icon: Wallet },
    { id: 'aktiva-tetap', label: 'Aktiva Tetap', icon: Briefcase },
    { id: 'umum', label: 'Umum', icon: LayoutDashboard },
    { id: 'persediaan', label: 'Persediaan', icon: Package },
    { id: 'pembelian', label: 'Pembelian', icon: ShoppingCart },
    { id: 'penjualan', label: 'Penjualan', icon: TrendingUp },
    { id: 'penjual', label: 'Penjual', icon: UserCheck },
    { id: 'designer', label: 'Desain Laporan', icon: Palette },
];

const reportItems: Record<string, any[]> = {
    'akunting': [
        { id: 'buku-besar', title: 'Buku Besar', icon: BookOpen, formId: 41001, desc: 'Laporan ini berisi jurnal-jurnal dari transaksi yang ada di dalam jangka waktu yang dipilih.' },
        { id: 'laba-rugi-jw', title: 'Laba Rugi - Jangka Waktu', icon: TrendingUp },
        { id: 'laba-rugi-mp', title: 'Laba Rugi - Multi Periode', icon: LineChart },
        { id: 'laba-rugi-mt', title: 'Laba Rugi - Multi Tahun', icon: LineChart },
        { id: 'neraca-ht', title: 'Neraca - Hingga Tanggal', icon: Scale },
        { id: 'neraca-mp', title: 'Neraca - Multi Periode', icon: Scale },
        { id: 'neraca-mt', title: 'Neraca - Multi Tahun', icon: Scale },
    ],
    'kas-bank': [
        { id: 'mutasi-bank', title: 'Mutasi Bank', icon: Landmark },
        { id: 'rekonsiliasi', title: 'Rekonsiliasi Bank', icon: Calculator },
    ]
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const { tabs, activeTabId } = useSelector((state: RootState) => state.tabs);
    const { user, company, token } = useSelector((state: RootState) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOptionsExpanded, setIsOptionsExpanded] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
    const [permissions, setPermissions] = useState<Record<number, boolean>>({});

    const showToast = (message: string, type: 'error' | 'success' = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Fetch permissions
    useEffect(() => {
        if (token) {
            const fetchPermissions = async () => {
                try {
                    // Extract all formIds from reportItems
                    const allFormIds = Object.values(reportItems)
                        .flat()
                        .filter(item => item.formId)
                        .map(item => item.formId);
                    
                    if (allFormIds.length === 0) return;

                    const response = await axios.get(`${BACKEND_URL}/reports/check-permissions`, {
                        params: { formIds: allFormIds.join(',') },
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPermissions(response.data);
                } catch (err) {
                    console.error("Failed to fetch permissions:", err);
                }
            };
            fetchPermissions();
        }
    }, [token]);
    
    // Per-tab state for reports
    const [reportStates, setReportStates] = useState<Record<string, {
        data: any[],
        loading: boolean,
        filters: any
    }>>({});

    const [lookupConfig, setLookupConfig] = useState<{
        isOpen: boolean;
        tabId: string;
        targetField: 'startAccountCode' | 'endAccountCode';
    }>({
        isOpen: false,
        tabId: '',
        targetField: 'startAccountCode'
    });

    const activeTab = tabs.find(t => t.id === activeTabId);

    // Initialize state when a report tab is opened
    useEffect(() => {
        if (activeTab?.type === 'report' && !reportStates[activeTab.id]) {
            setReportStates(prev => ({
                ...prev,
                [activeTab.id]: {
                    data: [],
                    loading: false,
                    filters: activeTab.contentId === 'buku-besar' ? {
                        dateRangeType: 'Periode Sekarang',
                        startDate: '2026-02-01',
                        endDate: '2026-02-28',
                        accountSelectionType: 'Semua Akun',
                        startAccountCode: '100000000000',
                        endAccountCode: '711104010000'
                    } : {}
                }
            }));
        }
    }, [activeTab, reportStates]);

    const handleRefresh = async (tabId: string) => {
        const state = reportStates[tabId];
        if (!state || !activeTab) return;

        setReportStates(prev => ({ ...prev, [tabId]: { ...prev[tabId], loading: true } }));

        try {
            const response = await axios.get(`${BACKEND_URL}/reports/ledger-list`, {
                params: state.filters,
                headers: { Authorization: `Bearer ${token}` }
            });

            setReportStates(prev => ({
                ...prev,
                [tabId]: { ...prev[tabId], data: response.data, loading: false }
            }));
        } catch (err: any) {
            console.error("Refresh failed:", err);
            const errorMessage = err.response?.data?.error || "Gagal mengambil data dari server.";
            
            setReportStates(prev => ({
                ...prev,
                [tabId]: { ...prev[tabId], data: [], loading: false }
            }));

            showToast(errorMessage, 'error');
        }
    };

    const updateFilter = (tabId: string, key: string, value: string) => {
        setReportStates(prev => {
            const currentState = prev[tabId];
            if (!currentState) return prev;

            let newFilters = { ...currentState.filters, [key]: value };

            if (key === 'dateRangeType') {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();

                const formatLocal = (d: Date) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };

                switch (value) {
                    case 'Periode Sekarang':
                        newFilters.startDate = formatLocal(new Date(year, month, 1));
                        newFilters.endDate = formatLocal(new Date(year, month + 1, 0));
                        break;
                    case 'Periode Lalu':
                        newFilters.startDate = formatLocal(new Date(year, month - 1, 1));
                        newFilters.endDate = formatLocal(new Date(year, month, 0));
                        break;
                    case 'Tahun Sekarang':
                        newFilters.startDate = `${year}-01-01`;
                        newFilters.endDate = `${year}-12-31`;
                        break;
                    case 'Tahun Lalu':
                        newFilters.startDate = `${year - 1}-01-01`;
                        newFilters.endDate = `${year - 1}-12-31`;
                        break;
                }
            }

            if (key === 'accountSelectionType') {
                if (value === 'Sendiri') {
                    newFilters.endAccountCode = newFilters.startAccountCode;
                }
            }

            if (key === 'startAccountCode' && newFilters.accountSelectionType === 'Sendiri') {
                newFilters.endAccountCode = value;
            }

            return {
                ...prev,
                [tabId]: {
                    ...currentState,
                    filters: newFilters
                }
            };
        });
    };

    const openCategory = (item: typeof sidebarItems[0]) => {
        if (item.id === 'designer') {
            const existingDesigner = tabs.find(t => t.contentId === 'designer');
            if (existingDesigner) {
                dispatch(setActiveTab(existingDesigner.id));
                return;
            }
        } else {
            const existingCat = tabs.find(t => t.contentId === item.id);
            if (existingCat) {
                dispatch(setActiveTab(existingCat.id));
                return;
            }
        }

        const uniqueId = `${item.id}-${Date.now()}`;
        dispatch(addTab({ id: uniqueId, contentId: item.id, title: item.label, type: 'category' }));
    };

    const openReport = (report: any) => {
        const uniqueId = `${report.id}-${Date.now()}`;
        dispatch(addTab({ id: uniqueId, contentId: report.id, title: report.title, type: 'report' }));
    };

    const renderReportOptions = (tab: Tab) => {
        const state = reportStates[tab.id];
        if (!state) return null;

        if (tab.contentId === 'buku-besar') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 border-b pb-1">Kriteria Tanggal</h3>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-900 uppercase">Jangka Waktu</label>
                                <select 
                                    value={state.filters.dateRangeType}
                                    onChange={(e) => updateFilter(tab.id, 'dateRangeType', e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm bg-white text-slate-500 font-bold"
                                >
                                    <option>Periode Sekarang</option>
                                    <option>Periode Lalu</option>
                                    <option>Tahun Sekarang</option>
                                    <option>Tahun Lalu</option>
                                    <option>Custom</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <ReportInput 
                                    label="Dari Tanggal"
                                    type="date"
                                    value={state.filters.startDate}
                                    onChange={(val) => updateFilter(tab.id, 'startDate', val)}
                                    disabled={state.filters.dateRangeType !== 'Custom'}
                                />
                                <ReportInput 
                                    label="Sampai Tanggal"
                                    type="date"
                                    value={state.filters.endDate}
                                    onChange={(val) => updateFilter(tab.id, 'endDate', val)}
                                    disabled={state.filters.dateRangeType !== 'Custom'}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 border-b pb-1">Kriteria Lainnya</h3>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-900 uppercase">Kode Akun</label>
                                <select 
                                    value={state.filters.accountSelectionType}
                                    onChange={(e) => updateFilter(tab.id, 'accountSelectionType', e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm bg-white text-slate-500 font-bold"
                                >
                                    <option>Semua Akun</option>
                                    <option>Sendiri</option>
                                    <option>Beberapa</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <ReportInput 
                                    label="Dari Akun"
                                    value={state.filters.startAccountCode}
                                    onChange={(val) => updateFilter(tab.id, 'startAccountCode', val)}
                                    disabled={state.filters.accountSelectionType === 'Semua Akun'}
                                    placeholder="100000"
                                    onLookup={() => setLookupConfig({ isOpen: true, tabId: tab.id, targetField: 'startAccountCode' })}
                                />
                                <ReportInput 
                                    label="Sampai Akun"
                                    value={state.filters.endAccountCode}
                                    onChange={(val) => updateFilter(tab.id, 'endAccountCode', val)}
                                    disabled={state.filters.accountSelectionType === 'Semua Akun' || state.filters.accountSelectionType === 'Sendiri'}
                                    placeholder="710301"
                                    onLookup={() => setLookupConfig({ isOpen: true, tabId: tab.id, targetField: 'endAccountCode' })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 border-b pb-1">Urutan</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-900 uppercase">Urutan Header 1</label><select className="p-2 border rounded-md text-sm bg-white text-slate-500 font-medium"><option>Kode Akun</option></select></div>
                                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-900 uppercase">Urutan Detail 1</label><select className="p-2 border rounded-md text-sm bg-white text-slate-500 font-medium"><option>Tanggal Transaksi</option></select></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-900 uppercase">Urutan Header 2</label><select className="p-2 border rounded-md text-sm bg-white text-slate-500 font-medium"><option>Nama Akun</option></select></div>
                                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-slate-900 uppercase">Urutan Detail 2</label><select className="p-2 border rounded-md text-sm bg-white text-slate-500 font-medium"><option>No. Dokumen</option></select></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        return <div className="p-4 text-slate-400 italic text-sm text-center">Opsi kriteria belum tersedia untuk laporan ini.</div>;
    };

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
            <header className="h-10 bg-[#5b89e9] flex items-center px-4 shadow-sm z-30">
                <h1 className="text-white font-bold text-sm tracking-wide">Mobiz Reporting</h1>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-48 bg-[#f0f4fa] border-r border-gray-200 flex flex-col z-20">
                    <nav className="flex-1 overflow-y-auto py-2">
                        {sidebarItems.map((item) => {
                            const isActive = activeTab?.contentId === item.id;
                            return (
                                <button key={item.id} onClick={() => openCategory(item)} className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all group", isActive ? "bg-white text-[#5b89e9] border-r-4 border-[#5b89e9]" : "text-gray-500 hover:bg-gray-200")}>
                                    <item.icon size={20} className={cn(isActive ? "text-[#5b89e9]" : "text-gray-400")} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 bg-white">
                    <div className="bg-[#f0f4fa] flex items-end px-2 gap-1 h-10 border-b border-gray-300">
                        {tabs.map((tab) => (
                            <div key={tab.id} className={cn("flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-t-lg transition-all cursor-pointer truncate max-w-[200px] relative h-8", activeTabId === tab.id ? "bg-[#9dbdf1] text-white shadow-sm" : "bg-[#d1d9e6] text-white hover:bg-[#c4cedd]")} onClick={() => dispatch(setActiveTab(tab.id))}>
                                <span className="truncate">{tab.title}</span>
                                <button onClick={(e) => { e.stopPropagation(); dispatch(removeTab(tab.id)); }} className="p-0.5 rounded-sm hover:bg-black/10 transition-colors"><X size={14} strokeWidth={3} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 overflow-auto relative bg-slate-50/50">
                        {activeTab?.contentId === 'designer' ? (
                            <div className="p-4 h-full"><StimulsoftDesigner /></div>
                        ) : activeTab?.type === 'category' ? (
                            <div className="p-10">
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                                    {(reportItems[activeTab.contentId] || []).map((report) => {
                                        const isAllowed = report.formId ? permissions[report.formId] !== false : true;
                                        
                                        return (
                                            <div 
                                                key={report.id} 
                                                onClick={() => isAllowed && openReport(report)} 
                                                className={cn(
                                                    "aspect-square rounded-lg border flex flex-col items-center justify-center p-2 text-center transition-all shadow-sm relative",
                                                    isAllowed 
                                                        ? "cursor-pointer hover:shadow-md bg-[#f0f4fa] border-[#d1d9e6] hover:border-blue-400 text-gray-800" 
                                                        : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed grayscale"
                                                )}
                                            >
                                                {!isAllowed && (
                                                    <div className="absolute top-1 right-1">
                                                        <div className="bg-slate-200 rounded-full p-1 shadow-sm">
                                                            <Lock size={10} className="text-slate-500" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className={cn("mb-2 p-1 rounded-md", isAllowed ? "text-[#5b89e9]" : "text-slate-300")}>
                                                    <report.icon size={32} strokeWidth={2} />
                                                </div>
                                                <h3 className="font-bold text-[10px] leading-tight px-1 line-clamp-2">{report.title}</h3>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : activeTab?.type === 'report' ? (
                            <div className="p-8 h-full bg-white overflow-y-auto">
                                <div className="flex justify-between items-center mb-4 border-b pb-4">
                                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText size={20} className="text-blue-600" />{activeTab.title}</h1>
                                </div>

                                <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8 transition-all">
                                    <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-b cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}>
                                        <div className="flex items-center gap-2">
                                            <Settings size={18} className={cn("text-gray-500 transition-transform", !isOptionsExpanded && "rotate-90")} />
                                            <h2 className="font-bold text-gray-700 text-sm">Opsi Laporan</h2>
                                        </div>
                                        <button className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{isOptionsExpanded ? 'Sembunyikan' : 'Tampilkan'}</button>
                                    </div>
                                    {isOptionsExpanded && (
                                        <div className="p-6">
                                            {renderReportOptions(activeTab)}
                                            <div className="flex justify-end mt-8 border-t pt-4">
                                                <button 
                                                    onClick={() => handleRefresh(activeTab.id)}
                                                    disabled={reportStates[activeTab.id]?.loading}
                                                    className="px-10 py-2 bg-[#5b89e9] text-white font-bold rounded-lg shadow-md hover:bg-[#4a78d8] transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {reportStates[activeTab.id]?.loading ? <RefreshCw className="animate-spin" size={16} /> : null}
                                                    Refresh
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {reportStates[activeTab.id]?.data && reportStates[activeTab.id].data.length > 0 ? (
                                    <div className="mt-8 border-t pt-8">
                                        <StimulsoftViewer 
                                            reportName={activeTab.contentId} 
                                            data={reportStates[activeTab.id].data} 
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-8 border-t pt-8 flex flex-col items-center justify-center py-20 text-slate-400">
                                        <div className="p-4 rounded-full bg-slate-50 mb-3">
                                            <FileText size={48} strokeWidth={1} />
                                        </div>
                                        <p className="text-sm">Klik <span className="font-bold text-slate-600">Refresh</span> untuk menampilkan data laporan</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </main>
            </div>

            <COALookupModal 
                isOpen={lookupConfig.isOpen}
                onClose={() => setLookupConfig(prev => ({ ...prev, isOpen: false }))}
                onSelect={(coa) => {
                    updateFilter(lookupConfig.tabId, lookupConfig.targetField, coa.AccountCode);
                    setLookupConfig(prev => ({ ...prev, isOpen: false }));
                }}
            />

            {/* Global Toast - High Contrast and Fixed to Viewport Bottom-Right */}
            {toast && (
                <div 
                    style={{ zIndex: 999999 }}
                    className={`fixed bottom-10 right-10 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 border border-white/20 min-w-[320px] max-w-md ${
                        toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                    } text-white`}
                >
                    <div className="flex-shrink-0">
                        {toast.type === 'error' ? <AlertCircle size={28} /> : <CheckCircle size={28} />}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">
                            {toast.type === 'error' ? 'AKSES DITOLAK' : 'BERHASIL'}
                        </span>
                        <p className="text-sm font-bold leading-tight break-words m-0">
                            {toast.message}
                        </p>
                    </div>
                    <button 
                        onClick={() => setToast(null)} 
                        className="flex-shrink-0 ml-4 p-2 hover:bg-black/10 rounded-full transition-colors self-center"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
