import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/utils';
import { Tab } from '@/store';

interface TabHeaderProps {
    tabs: Tab[];
    activeTabId: string | null;
    onSetActive: (id: string) => void;
    onRemove: (id: string) => void;
}

export default function TabHeader({ tabs, activeTabId, onSetActive, onRemove }: TabHeaderProps) {
    return (
        <div className="bg-[#f0f4fa] flex items-end px-2 gap-1 h-10 border-b border-gray-300">
            {tabs.map((tab) => (
                <div key={tab.id} className={cn("flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-t-lg transition-all cursor-pointer truncate max-w-[200px] relative h-8", activeTabId === tab.id ? "bg-[#9dbdf1] text-white shadow-sm" : "bg-[#d1d9e6] text-white hover:bg-[#c4cedd]")} onClick={() => onSetActive(tab.id)}>
                    <span className="truncate">{tab.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(tab.id); }} className="p-0.5 rounded-sm hover:bg-black/10 transition-colors"><X size={14} strokeWidth={3} /></button>
                </div>
            ))}
        </div>
    );
}