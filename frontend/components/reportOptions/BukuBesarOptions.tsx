import React from 'react';
import ReportInput from '../ui/ReportInput';

interface BukuBesarOptionsProps {
    filters: any;
    onUpdateFilter: (key: string, value: string) => void;
    onLookup: (field: string) => void;
}

export default function BukuBesarOptions({ filters, onUpdateFilter, onLookup }: BukuBesarOptionsProps) {
    const handleAccountCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onUpdateFilter('accountSelectionType', value);
        if (value === 'Semua Akun') {
            onUpdateFilter('startAccountCode', '1');
            onUpdateFilter('endAccountCode', '999999999999');
        } else if (filters.startAccountCode === '1') {
            onUpdateFilter('startAccountCode', '');
            onUpdateFilter('endAccountCode', '');
        }
        else if (value === 'Sendiri') {
            onUpdateFilter('endAccountCode', filters.startAccountCode);
        } 
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-1">Kriteria Tanggal</h3>
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-900 uppercase">Jangka Waktu</label>
                        <select 
                            value={filters.dateRangeType}
                            onChange={(e) => onUpdateFilter('dateRangeType', e.target.value)}
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
                        <ReportInput label="Dari Tanggal" type="date" value={filters.startDate} onChange={(val) => onUpdateFilter('startDate', val)} disabled={filters.dateRangeType !== 'Custom'} required />
                        <ReportInput label="Sampai Tanggal" type="date" value={filters.endDate} onChange={(val) => onUpdateFilter('endDate', val)} disabled={filters.dateRangeType !== 'Custom'} required />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 border-b pb-1">Kriteria Lainnya</h3>
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-900 uppercase">Kode Akun</label>
                        <select 
                            value={filters.accountSelectionType}
                            onChange={handleAccountCriteriaChange}
                            className="w-full p-2 border rounded-md text-sm bg-white text-slate-500 font-bold"
                        >
                            <option>Semua Akun</option>
                            <option>Sendiri</option>
                            <option>Beberapa</option>
                        </select>
                    </div>
                    {
                        filters.accountSelectionType !== 'Semua Akun' && (
                            <div className="flex gap-2">
                                <ReportInput label="Dari Akun" value={filters.startAccountCode} onChange={(val) => onUpdateFilter('startAccountCode', val)} disabled={filters.accountSelectionType === 'Semua Akun'} placeholder="100000" onLookup={() => onLookup('startAccountCode')} required />
                                <ReportInput label="Sampai Akun" value={filters.endAccountCode} onChange={(val) => onUpdateFilter('endAccountCode', val)} disabled={filters.accountSelectionType === 'Semua Akun' || filters.accountSelectionType === 'Sendiri'} placeholder="710301" onLookup={() => onLookup('endAccountCode')} required />
                            </div>
                        )
                    }
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