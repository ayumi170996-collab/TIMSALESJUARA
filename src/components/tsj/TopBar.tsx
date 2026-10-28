import React from 'react';
import {
  RotateCw,
  FileSpreadsheet,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Meta } from '../../types/tsj';

interface TopBarProps {
  meta: Meta;
  isLive: boolean;
  isLoading: boolean;
  lastUpdated?: string;
  onRefresh: () => void;
  onOpenSheetsConfig: () => void;
  onOpenAiAdvisor: () => void;
  onOpenEditModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  meta,
  isLive,
  isLoading,
  lastUpdated,
  onRefresh,
  onOpenSheetsConfig,
  onOpenAiAdvisor,
  onOpenEditModal,
}) => {
  const statusClass =
    meta.status_overall?.toLowerCase() === 'on track'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
      : 'border-amber-500/40 bg-amber-500/10 text-amber-400';

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#16213E] to-[#1A1A2E] border-b-2 border-[#C41E3A] px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl text-white">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C41E3A] rounded-xl flex items-center justify-center font-black text-base text-white shadow-md shadow-[#C41E3A]/30">
            TSJ
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight font-['Outfit']">
              TimSalesJuara — Dashboard Operasional
            </h1>
            <p className="text-[11px] text-[#8B9BB8] font-medium hidden sm:block">
              Business Growth · Klien · Pipeline · 3 Pilar · Tim
            </p>
          </div>
        </div>

        {/* Metadata Badges & Live Status */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          <div className="px-2.5 py-1 rounded-md bg-[#1F2A44] border border-[#2A3A5C] text-[#8B9BB8] flex items-center gap-1.5">
            <span>Periode:</span>
            <strong className="text-slate-100 font-semibold">{meta.periode || '—'}</strong>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${statusClass}`}
          >
            {meta.status_overall || 'On Track'}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              isLive
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                : 'border-[#E6A817] bg-[#E6A817]/15 text-[#F5B041]'
            }`}
          >
            {isLive ? 'Live · Sheets' : 'Demo Mode'}
          </div>

          {lastUpdated && (
            <span className="text-[11px] text-[#8B9BB8] hidden lg:inline">
              Update: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-[#C41E3A] hover:bg-[#9B1830] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh Data from Sheets"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenSheetsConfig}
            className="px-3 py-1.5 rounded-lg bg-[#1F2A44] hover:bg-[#2A3A5C] border border-[#2A3A5C] text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Konfigurasi Google Sheets API"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Google Sheets</span>
          </button>

          <button
            onClick={onOpenAiAdvisor}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            title="Analisis Eksekutif AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Advisor</span>
          </button>

          <button
            onClick={onOpenEditModal}
            className="p-1.5 rounded-lg bg-[#1F2A44] hover:bg-[#2A3A5C] border border-[#2A3A5C] text-slate-300 transition-colors"
            title="Edit / Tambah Data Manual"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
