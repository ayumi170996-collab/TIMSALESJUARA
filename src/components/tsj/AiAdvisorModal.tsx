import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { DashboardData, AIAdvisorResponse } from '../../types/tsj';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardData;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  dashboardData,
}) => {
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<AIAdvisorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !advisorData && !loading) {
      fetchAnalysis();
    }
  }, [isOpen]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboardData),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: AIAdvisorResponse = await res.json();
      setAdvisorData(data);
    } catch (e: any) {
      console.error(e);
      setError('Gagal memuat analisis AI. Pastikan server terhubung.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-[#2A3A5C] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-[#2A3A5C] flex items-center justify-between bg-[#16213E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                AI Business Advisor — TimSalesJuara
              </h2>
              <p className="text-xs text-[#8B9BB8]">
                Analisis strategis & rekomendasi eksekutif berbasis model Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8B9BB8] hover:text-white rounded-lg hover:bg-[#1F2A44] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm font-semibold text-white">
                Menganalisis performa 3 pilar, kesehatan klien, dan pipeline…
              </p>
              <p className="text-xs text-[#8B9BB8] mt-1 max-w-sm">
                Gemini mengevaluasi rasio konversi MTD, resiko churn, dan prioritas tindakan taktis mingguan.
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs">
              <p className="text-[#FF6B81] font-semibold mb-3">{error}</p>
              <button
                onClick={fetchAnalysis}
                className="px-4 py-2 bg-[#C41E3A] text-white rounded-xl font-bold"
              >
                Coba Lagi
              </button>
            </div>
          ) : advisorData ? (
            <div className="space-y-5">
              {/* Top Banner: Score & Executive Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#1F2A44] border border-[#2A3A5C] text-center flex flex-col items-center justify-center">
                  <div className="text-[10px] text-[#8B9BB8] uppercase tracking-wider font-semibold">
                    Skor Kesehatan Bisnis
                  </div>
                  <div className="text-4xl font-black text-emerald-400 mt-1 font-mono">
                    {advisorData.healthScore}
                    <span className="text-xs text-[#8B9BB8]">/100</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 mt-1">
                    Status: {advisorData.statusOverall}
                  </div>
                </div>

                <div className="sm:col-span-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs leading-relaxed text-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      <span>Ringkasan Eksekutif Operasional</span>
                    </div>
                    <p className="text-slate-300">{advisorData.executiveSummary}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-300">
                    💡 <em>Prospek Pipeline: {advisorData.pipelineInsight}</em>
                  </div>
                </div>
              </div>

              {/* Urgent Risks Section */}
              {advisorData.urgentRisks && advisorData.urgentRisks.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#FF6B81] mb-2.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Area & Klien Berisiko Tinggi (Perlu Intervensi)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {advisorData.urgentRisks.map((risk, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#C41E3A]/10 border border-[#C41E3A]/30 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-white mb-1">
                          <span>{risk.clientOrArea}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C41E3A]/30 text-[#FF6B81]">
                            {risk.riskLevel}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-2 leading-relaxed">{risk.analysis}</p>
                        <div className="p-2 rounded-lg bg-black/25 text-[11px] text-emerald-300 border border-[#2A3A5C]">
                          <strong>Solusi:</strong> {risk.recommendedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Next Steps (7-day tactical actions) */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Rencana Tindakan Taktis 7 Hari ke Depan</span>
                </div>
                <div className="space-y-2">
                  {advisorData.strategicNextSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#1F2A44] border border-[#2A3A5C] text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#C41E3A]/20 text-[#FF8A9A] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{step.action}</div>
                          <div className="text-[11px] text-[#8B9BB8] mt-0.5">
                            Dampak: <strong className="text-slate-200">{step.expectedImpact}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-black/30 border border-[#2A3A5C] text-[11px] font-semibold text-white">
                          PIC: {step.owner}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A3A5C] bg-[#16213E] flex items-center justify-between">
          <button
            onClick={fetchAnalysis}
            className="text-xs text-[#8B9BB8] hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Ulang Analisis</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C41E3A] hover:bg-[#9B1830] text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
