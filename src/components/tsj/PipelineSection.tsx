import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PipelineItem } from '../../types/tsj';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PipelineSectionProps {
  pipeline: PipelineItem[];
}

export const PipelineSection: React.FC<PipelineSectionProps> = ({ pipeline }) => {
  const statusClass = (s: string) => {
    const v = String(s || '').toLowerCase();
    if (v === 'negotiation' || v === 'closing') {
      return 'bg-[#28A745]/20 text-[#5CDB7A] border border-[#28A745]/40';
    }
    if (v === 'proposal') {
      return 'bg-[#E6A817]/20 text-[#F5B041] border border-[#E6A817]/40';
    }
    return 'bg-[#3498DB]/20 text-[#5DADE2] border border-[#3498DB]/40';
  };

  const totalNilai = pipeline.reduce((acc, curr) => acc + (Number(curr.nilai_jt) || 0), 0);
  const totalExpected = pipeline.reduce((acc, curr) => acc + (Number(curr.expected_jt) || 0), 0);

  // Horizontal Bar Chart
  const chartData = {
    labels: pipeline.map((p) => p.nama),
    datasets: [
      {
        label: 'Expected Value (jt)',
        data: pipeline.map((p) => p.expected_jt),
        backgroundColor: ['#3498DB', '#28A745', '#E6A817', '#9B59B6'],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#16213E',
        titleColor: '#E8ECF4',
        bodyColor: '#8B9BB8',
        borderColor: '#2A3A5C',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => `Expected: Rp ${ctx.raw}jt`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#8B9BB8', font: { size: 10 } },
        grid: { color: '#2A3A5C' },
      },
      y: {
        ticks: { color: '#E8ECF4', font: { size: 11, weight: 'bold' as const } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-[#1F2A44] border border-[#2A3A5C] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8B9BB8] flex items-center gap-2">
            <span className="w-1 h-3.5 bg-[#C41E3A] rounded-sm" />
            <span>Pipeline Prospek & Expected Value</span>
          </div>

          <div className="text-xs text-[#8B9BB8] flex items-center gap-3">
            <span>
              Total Nilai: <strong className="text-white font-mono">Rp {totalNilai}jt</strong>
            </span>
            <span>·</span>
            <span>
              Expected: <strong className="text-emerald-400 font-mono">Rp {totalExpected.toFixed(1)}jt</strong>
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-44 bg-black/15 rounded-xl p-3 border border-[#2A3A5C]/60 mb-4">
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#C41E3A]/15 text-[#FF8A9A] uppercase text-[10px] font-bold border-b border-[#2A3A5C]">
                <th className="py-2 px-2.5">Prospek</th>
                <th className="py-2 px-2">Stage</th>
                <th className="py-2 px-2">Nilai Est.</th>
                <th className="py-2 px-2">Prob</th>
                <th className="py-2 px-2">Expected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3A5C]/60">
              {pipeline.map((p, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-2.5 font-bold text-white whitespace-nowrap">{p.nama}</td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass(p.stage)}`}>
                      {p.stage}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-mono tabular-nums text-slate-300">
                    Rp {p.nilai_jt}jt
                  </td>
                  <td className="py-2.5 px-2 font-mono tabular-nums font-semibold text-amber-400">
                    {p.prob}%
                  </td>
                  <td className="py-2.5 px-2 font-mono tabular-nums font-bold text-emerald-400">
                    Rp {p.expected_jt}jt
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
