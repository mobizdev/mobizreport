import React from 'react';
import { sidebarItems } from '../utils/menuData';
import { cn } from '../utils/utils';

interface SidebarProps {
    activeContentId?: string;
    onOpenCategory: (item: typeof sidebarItems[0]) => void;
}

export default function Sidebar({ activeContentId, onOpenCategory }: SidebarProps) {
    return (
        <aside className="w-48 bg-[#f0f4fa] border-r border-gray-200 flex flex-col z-20">
            <nav className="flex-1 overflow-y-auto py-2">
                {sidebarItems.map((item) => {
                    const isActive = activeContentId === item.id;
                    return (
                        <button key={item.id} onClick={() => onOpenCategory(item)} className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all group", isActive ? "bg-white text-[#5b89e9] border-r-4 border-[#5b89e9]" : "text-gray-500 hover:bg-gray-200")}>
                            <item.icon size={20} className={cn(isActive ? "text-[#5b89e9]" : "text-gray-400")} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}