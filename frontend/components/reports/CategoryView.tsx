import React from 'react';
import { Lock } from 'lucide-react';
import { reportItems } from '../utils/menuData';
import { cn } from '../utils/utils';

interface CategoryViewProps {
    categoryId: string;
    permissions: Record<number, boolean>;
    onOpenReport: (report: any) => void;
}

export default function CategoryView({ categoryId, permissions, onOpenReport }: CategoryViewProps) {
    const items = reportItems[categoryId] || [];

    return (
        <div className="p-10">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {items.map((report) => {
                    const isAllowed = report.formId ? permissions[report.formId] !== false : true;
                    
                    return (
                        <div 
                            key={report.id} 
                            onClick={() => isAllowed && onOpenReport(report)} 
                            className={cn(
                                "aspect-square rounded-lg border flex flex-col items-center justify-center p-2 text-center transition-all shadow-sm relative",
                                isAllowed 
                                    ? "cursor-pointer hover:shadow-md bg-[#f0f4fa] border-[#d1d9e6] hover:border-blue-400 text-gray-800" 
                                    : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed grayscale"
                            )}
                        >
                            {!isAllowed && <div className="absolute top-1 right-1"><div className="bg-slate-200 rounded-full p-1 shadow-sm"><Lock size={10} className="text-slate-500" /></div></div>}
                            <div className={cn("mb-2 p-1 rounded-md", isAllowed ? "text-[#5b89e9]" : "text-slate-300")}>
                                <report.icon size={32} strokeWidth={2} />
                            </div>
                            <h3 className="font-bold text-[10px] leading-tight px-1 line-clamp-2">{report.title}</h3>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}