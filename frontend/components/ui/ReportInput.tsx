'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ReportInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'date';
    disabled?: boolean;
    onLookup?: () => void;
    className?: string;
    containerClassName?: string;
}

export default function ReportInput({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    disabled = false,
    onLookup,
    className,
    containerClassName
}: ReportInputProps) {
    return (
        <div className={cn("flex-1 flex flex-col gap-1", containerClassName)}>
            <label className="text-[10px] font-bold text-slate-900 uppercase">
                {label}
            </label>
            <div className="flex items-center gap-1">
                <input 
                    type={type} 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={cn(
                        "w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-slate-500 font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all",
                        "disabled:bg-slate-100 disabled:text-slate-500 disabled:border-gray-200",
                        className
                    )} 
                />
                {onLookup && (
                    <button 
                        type="button"
                        disabled={disabled}
                        onClick={onLookup}
                        className="p-2 border border-gray-300 rounded-md bg-white hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-0"
                    >
                        <Search size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
