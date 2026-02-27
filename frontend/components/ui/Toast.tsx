import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export interface ToastProps {
    message: string;
    type: 'error' | 'success';
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    return (
        <div 
            style={{ zIndex: 999999 }}
            className={`fixed bottom-10 right-10 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 border border-white/20 min-w-[320px] max-w-md ${
                type === 'error' ? 'bg-red-600' : 'bg-green-600'
            } text-white`}
        >
            <div className="flex-shrink-0">
                {type === 'error' ? <AlertCircle size={28} /> : <CheckCircle size={28} />}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">
                    {type === 'error' ? 'AKSES DITOLAK' : 'BERHASIL'}
                </span>
                <p className="text-sm font-bold leading-tight break-words m-0">
                    {message}
                </p>
            </div>
            <button 
                onClick={onClose} 
                className="flex-shrink-0 ml-4 p-2 hover:bg-black/10 rounded-full transition-colors self-center"
            >
                <X size={20} />
            </button>
        </div>
    );
}