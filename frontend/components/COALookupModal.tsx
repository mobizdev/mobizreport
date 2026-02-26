'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface COA {
    AccountCode: string;
    Name: string;
    CurrencyId: string;
    CategoryId: string;
    TypeString: string;
}

interface COALookupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (coa: COA) => void;
}

export default function COALookupModal({ isOpen, onClose, onSelect }: COALookupModalProps) {
    const { token } = useSelector((state: RootState) => state.auth);
    const [coas, setCoas] = useState<COA[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (isOpen) {
            fetchCOA();
            setCurrentPage(1);
        }
    }, [isOpen]);

    const fetchCOA = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/reports/coa-lookup`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoas(response.data);
        } catch (err) {
            console.error("Failed to fetch COA:", err);
            alert("Gagal mengambil data Chart of Accounts.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCoas = coas.filter(coa => 
        coa.AccountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coa.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCoas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCoas = filteredCoas.slice(startIndex, startIndex + itemsPerPage);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 font-sans">
            <div className="bg-white rounded shadow-2xl w-800 max-w-3xl flex flex-col overflow-hidden border border-slate-300">
                {/* Header */}
                <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-white">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lookup Chart of Accounts</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 bg-white border-b border-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Cari kode atau nama akun..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-[11px] focus:border-blue-500 outline-none placeholder:text-slate-400 text-slate-950 font-medium"
                                autoFocus
                            />
                        </div>
                        <div className="p-1.5 border border-slate-300 rounded bg-slate-50 text-slate-400">
                            <Search size={14} />
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 min-h-[450px] overflow-hidden flex flex-col bg-white">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-2.5 w-[150px] text-center border-r border-slate-100">Kode Akun</th>
                                <th className="px-6 py-2.5">Nama Akun</th>
                                <th className="px-4 py-2.5 w-[60px] text-center border-l border-slate-100">Curr</th>
                                <th className="px-4 py-2.5 w-[80px] text-center border-l border-slate-100">Category</th>
                                <th className="px-4 py-2.5 w-[100px] text-center border-l border-slate-100">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-slate-400" size={20} />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedCoas.length > 0 ? (
                                paginatedCoas.map((coa) => (
                                    <tr 
                                        key={coa.AccountCode} 
                                        onClick={() => onSelect(coa)}
                                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-2 text-[10px] font-medium text-slate-900 border-r border-slate-50">{coa.AccountCode}</td>
                                        <td className="px-6 py-2 text-[10px] font-medium text-slate-900 group-hover:text-blue-700 transition-colors">{coa.Name}</td>
                                        <td className="px-4 py-2 text-[10px] text-center text-slate-900 font-medium border-l border-slate-50">{coa.CurrencyId}</td>
                                        <td className="px-4 py-2 text-[10px] text-center text-slate-900 font-medium border-l border-slate-50">{coa.CategoryId}</td>
                                        <td className="px-4 py-2 text-center border-l border-slate-50">
                                            <span className="text-[10px] font-medium text-slate-900 uppercase tracking-tighter">
                                                {coa.TypeString}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-20 text-center text-slate-400 font-medium text-[11px] uppercase tracking-widest">
                                        Data tidak ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {!loading && totalPages > 0 && (
                        <div className="mt-auto p-4 bg-white flex items-center justify-between border-t border-slate-100">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-[11px] font-bold border border-slate-300 rounded disabled:opacity-30 text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-tighter"
                            >
                                PREV
                            </button>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                HALAMAN {currentPage} DARI {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-[11px] font-bold border border-slate-300 rounded disabled:opacity-30 text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-tighter"
                            >
                                NEXT
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}