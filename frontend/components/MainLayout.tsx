'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addTab, removeTab, setActiveTab, Tab } from '../store';
import StimulsoftDesigner from './reports/StimulsoftDesigner';
import COALookupModal from './ui/COALookupModal';
import axios from 'axios';
import Sidebar from './layout/Sidebar';
import TabHeader from './layout/TabHeader';
import CategoryView from './reports/CategoryView';
import ReportView from './reports/ReportView';
import { sidebarItems, reportItems } from './utils/menuData';
import { ReportDefaultFilters, ReportMandatoryFields, ReportEndpoints } from './utils/registry';
import { useToast } from './ui/ToastContext';

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

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const { tabs, activeTabId } = useSelector((state: RootState) => state.tabs);
    const { token } = useSelector((state: RootState) => state.auth);
    const [permissions, setPermissions] = useState<Record<number, boolean>>({});
    const { showToast } = useToast();

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
                    filters: ReportDefaultFilters[activeTab.contentId] || {}
                }
            }));
        }
    }, [activeTab, reportStates]);

    const handleRefresh = async (tabId: string) => {
        const state = reportStates[tabId];
        console.log("state", state);
        
        if (!state) return;

        const currentTab = tabs.find(t => t.id === tabId);
        if (!currentTab) return;

        if (ReportMandatoryFields[currentTab.contentId]) {
            const missing = ReportMandatoryFields[currentTab.contentId].filter(field => !state.filters[field.key]);
            if (missing.length > 0) {
                showToast(`${missing.map(m => m.label).join(', ')} harus diisi.`, 'error');
                return;
            }
        }

        const endpoint = ReportEndpoints[currentTab.contentId];
        if (!endpoint) {
            showToast("Endpoint laporan belum dikonfigurasi.", 'error');
            return;
        }

        setReportStates(prev => ({ ...prev, [tabId]: { ...prev[tabId], loading: true } }));

        try {
            const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
                params: state.filters,
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("response", response);

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

    const handleOpenCategory = (item: typeof sidebarItems[0]) => {
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

    const handleOpenReport = (report: any) => {
        // Check if a tab for this report is already open
        const existingTab = tabs.find(t => t.contentId === report.id && t.type === 'report');
        if (existingTab) {
            dispatch(setActiveTab(existingTab.id));
            return;
        }
        const uniqueId = `${report.id}-${Date.now()}`;
        dispatch(addTab({ id: uniqueId, contentId: report.id, title: report.title, type: 'report' }));
    };

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
            <header className="h-10 bg-[#5b89e9] flex items-center px-4 shadow-sm z-30">
                <h1 className="text-white font-bold text-sm tracking-wide">Mobiz Reporting</h1>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    activeContentId={activeTab?.contentId} 
                    onOpenCategory={handleOpenCategory} 
                />

                <main className="flex-1 flex flex-col min-w-0 bg-white">
                    <TabHeader 
                        tabs={tabs} 
                        activeTabId={activeTabId} 
                        onSetActive={(id) => dispatch(setActiveTab(id))} 
                        onRemove={(id) => dispatch(removeTab(id))} 
                    />

                    <div className="flex-1 overflow-auto relative bg-slate-50/50">
                        {activeTab?.contentId === 'designer' ? (
                            <div className="p-4 h-full"><StimulsoftDesigner /></div>
                        ) : activeTab?.type === 'category' ? (
                            <CategoryView 
                                categoryId={activeTab.contentId} 
                                permissions={permissions} 
                                onOpenReport={handleOpenReport} 
                            />
                        ) : activeTab?.type === 'report' ? (
                            <ReportView 
                                tab={activeTab}
                                reportState={reportStates[activeTab.id]}
                                onUpdateFilter={(key, value) => updateFilter(activeTab.id, key, value)}
                                onRefresh={() => handleRefresh(activeTab.id)}
                                onLookup={(field) => setLookupConfig({ isOpen: true, tabId: activeTab.id, targetField: field })}
                            />
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
            {/* {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )} */}
        </div>
    );
}
