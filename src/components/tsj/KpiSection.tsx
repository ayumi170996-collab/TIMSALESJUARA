import React from 'react';
import { KPIItem } from '../../types/tsj';

interface KpiSectionProps {
  kpis: KPIItem[];
}

export const KpiSection: React.FC<KpiSectionProps> = ({ kpis }) => {
  const KPI_COLORS = [
    { border: 'hover:border-[#5DADE2]', text: 'text-[#5DADE2]' },
    { border: 'hover:border-[#F5B041]', text: 'text-[#F5B041]' },
    { border: 'hover:border-[#FF6B81]', text: 'text-[#FF6B81]' },
    { border: 'hover:border-[#5CDB7A]', text: 'text-[#5CDB7A]' },
    { border: 'hover:border-[#5DADE2]', text: 'text-[#5DADE2]' },
    { border: 'hover:border-[#5CDB7A]', text: 'text-[#5CDB7A]' },
    { border: 'hover:border-[#F5B041]', text: 'text-[#F5B041]' },
    { border: 'hover:border-[#FF6B81]', text: 'text-[#FF6B81]' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {kpis.map((kpi, index) => {
        const color = KPI_COLORS[index % KPI_COLORS.length];
        return (
          <div
            key={index}
            className={`bg-[#1F2A44] border border-[#2A3A5C] ${color.border} rounded-xl p-3.5 transition-all shadow-md group flex flex-col justify-between`}
          >
            <div>
              <div className="text-[10px] text-[#8B9BB8] uppercase tracking-wider font-semibold">
                {kpi.label}
              </div>
              <div className={`text-xl sm:text-2xl font-black mt-1 font-mono tabular-nums ${color.text}`}>
                {kpi.value}
              </div>
            </div>
            {kpi.sub && (
              <div className="text-[11px] text-[#8B9BB8] mt-1.5 leading-snug line-clamp-1">
                {kpi.sub}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
