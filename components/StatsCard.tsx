import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: string;
    trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, colorClass, trend }) => {
    return (
        <div className="bg-brand-charcoal border border-brand-light/5 p-6 rounded-2xl relative overflow-hidden group hover:border-brand-teal/30 transition-all">
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-brand-light/50 text-sm font-medium uppercase tracking-wider mb-2">{title}</p>
                    <h3 className="text-4xl font-bold font-pixel">{value}</h3>
                    {trend && <p className="text-xs mt-2 text-brand-teal">{trend}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-brand-light/5 ${colorClass} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${colorClass.replace('text-', 'bg-')} blur-2xl`}></div>
        </div>
    );
};

export default StatsCard;