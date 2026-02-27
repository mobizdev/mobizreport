import React, { useState } from 'react';
import { FileText, Settings, RefreshCw } from 'lucide-react';

import { cn } from '../utils/utils';
import { Tab } from '../../store';
import { ReportOptionsRegistry } from '../utils/registry';
import StimulsoftViewer from './StimulsoftViewer';

interface ReportViewProps {
    tab: Tab;
    reportState: {
        data: any[];
        loading: boolean;
        filters: any;
    } | undefined;
    onUpdateFilter: (key: string, value: string) => void;
    onRefresh: () => void;
}

export default function ReportView({ tab, reportState, onUpdateFilter, onRefresh }: ReportViewProps) {
    const [isOptionsExpanded, setIsOptionsExpanded] = useState(true);

    const renderOptions = () => {
        if (!reportState) return null;

        const OptionsComponent = ReportOptionsRegistry[tab.contentId];
        if (OptionsComponent) {
            return (
                <OptionsComponent 
                    filters={reportState.filters}
                    onUpdateFilter={onUpdateFilter}
                />
            );
        }
        return <div className="p-4 text-slate-400 italic text-sm text-center">Opsi kriteria belum tersedia untuk laporan ini.</div>;
    };

    return (
        <div className="p-8 h-full bg-white overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText size={20} className="text-blue-600" />{tab.title}</h1>
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
                        {renderOptions()}
                        <div className="flex justify-end mt-8 border-t pt-4">
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onRefresh();
                                }}
                                disabled={reportState?.loading}
                                className="px-10 py-2 bg-[#5b89e9] text-white font-bold rounded-lg shadow-md hover:bg-[#4a78d8] transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {reportState?.loading ? <RefreshCw className="animate-spin" size={16} /> : null}
                                Refresh
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {reportState?.data && reportState.data.length > 0 ? (
                <div className="mt-8 border-t pt-8">
                    <StimulsoftViewer reportName={tab.contentId} data={reportState.data} />
                </div>
            ) : (
                <div className="mt-8 border-t pt-8 flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="p-4 rounded-full bg-slate-50 mb-3"><FileText size={48} strokeWidth={1} /></div>
                    <p className="text-sm">Klik <span className="font-bold text-slate-600">Refresh</span> untuk menampilkan data laporan</p>
                </div>
            )}
        </div>
    );
}