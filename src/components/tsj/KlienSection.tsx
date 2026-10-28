import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Search, Filter, Plus } from 'lucide-react';
import { KlienItem } from '../../types/tsj';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface KlienSectionProps {
  klien: KlienItem[];
  onAddKlien?: () => void;
}

export const KlienSection: React.FC<KlienSectionProps> = ({ klien, onAddKlien }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');

  const statusClass = (s: string) => {
    const v = String(s || '').toLowerCase();
    if (['active', 'ok', 'low', 'done', 'on track'].includes(v)) {
      return 'bg-[#28A745]/20 text-[#5CDB7A] border border-[#28A745]/40';
    }
    if (['medium', 'behind', 'in progress', 'negotiation', 'onboarding'].includes(v)) {
      return 'bg-[#E6A817]/20 text-[#F5B041] border border-[#E6A817]/40';
    }
    if (['high', 'at risk', 'open'].includes(v)) {
      return 'bg-[#C41E3A]/20 text-[#FF6B81] border border-[#C41E3A]/40';
    }
    return 'bg-[#3498DB]/20 text-[#5DADE2] border border-[#3498DB]/40';
  };

  const filteredKlien = klien.filter((k) => {
    const matchesSearch =
      k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'All' || k.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  // Combo Chart: Bar (Revenue) + Line (% Target)
  const chartData = {
    labels: klien.map((k) => k.nama),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Revenue (jt)',
        data: klien.map((k) => k.revenue_jt),
        backgroundColor: 'rgba(52, 152, 219, 0.75)',
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '% Target',
        data: klien.map((k) => k.pct_target),
        borderColor: '#C41E3A',
        backgroundColor: '#C41E3A',
        tension: 0.3,
        yAxisID: 'y1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#8B9BB8', font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#16213E',
        titleColor: '#E8ECF4',
        bodyColor: '#8B9BB8',
        borderColor: '#2A3A5C',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        position: 'left' as const,
        beginAtZero: true,
        ticks: { color: '#8B9BB8', font: { size: 10 } },
        grid: { color: '#2A3A5C' },
        title: { display: true, text: 'Revenue (Juta)', color: '#8B9BB8', font: { size: 10 } },
      },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        max: 120,
        ticks: { color: '#8B9BB8', font: { size: 10 } },
        grid: { display: false },
        title: { display: true, text: '% Target', color: '#8B9BB8', font: { size: 10 } },
      },
      x: {
        ticks: { color: '#8B9BB8', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      {/* Client Health Table Section */}
      <div className="bg-[#1F2A44] border border-[#2A3A5C] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8B9BB8] flex items-center gap-2">
              <span className="w-1 h-3.5 bg-[#C41E3A] rounded-sm" />
              <span>Kesehatan Klien Aktif</span>
            </div>

            {onAddKlien && (
              <button
                onClick={onAddKlien}
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#C41E3A] hover:bg-[#9B1830] rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Klien</span>
              </button>
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#8B9BB8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari klien atau PIC…"
                className="w-full bg-black/20 border border-[#2A3A5C] focus:border-[#C41E3A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8B9BB8] outline-none"
              />
            </div>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-black/20 border border-[#2A3A5C] text-[#8B9BB8] rounded-lg px-2.5 py-1.5 text-xs outline-none"
            >
              <option value="All">Semua Stage</option>
              <option value="Active">Active</option>
              <option value="Onboarding">Onboarding</option>
              <option value="At Risk">At Risk</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#C41E3A]/15 text-[#FF8A9A] uppercase text-[10px] font-bold border-b border-[#2A3A5C]">
                  <th className="py-2 px-2.5">Klien</th>
                  <th className="py-2 px-2">Stage</th>
                  <th className="py-2 px-2">Leads</th>
                  <th className="py-2 px-2">Meeting</th>
                  <th className="py-2 px-2">Revenue</th>
                  <th className="py-2 px-2">% Target</th>
                  <th className="py-2 px-2">Owner</th>
                  <th className="py-2 px-2">Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3A5C]/60">
                {filteredKlien.map((k, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 px-2.5 font-bold text-white whitespace-nowrap">{k.nama}</td>
                    <td className="py-2.5 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass(k.stage)}`}>
                        {k.stage}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono tabular-nums text-slate-300">{k.leads}</td>
                    <td className="py-2.5 px-2 font-mono tabular-nums text-slate-300">{k.meeting}</td>
                    <td className="py-2.5 px-2 font-mono tabular-nums font-semibold text-white whitespace-nowrap">
                      {k.revenue_jt ? `Rp ${k.revenue_jt}jt` : '—'}
                    </td>
                    <td className="py-2.5 px-2 font-mono tabular-nums font-bold text-emerald-400">
                      {k.pct_target}%
                    </td>
                    <td className="py-2.5 px-2 text-[#8B9BB8] whitespace-nowrap">{k.owner}</td>
                    <td className="py-2.5 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass(k.risiko)}`}>
                        {k.risiko}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1F2A44] border border-[#2A3A5C] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-[#8B9BB8] mb-3.5 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#C41E3A] rounded-sm" />
          <span>Revenue & Achievement per Klien</span>
        </div>

        <div className="h-64 sm:h-72 bg-black/15 rounded-xl p-3 border border-[#2A3A5C]/60">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
