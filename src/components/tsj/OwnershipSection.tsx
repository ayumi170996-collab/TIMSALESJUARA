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
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { OwnershipItem } from '../../types/tsj';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OwnershipSectionProps {
  ownership: OwnershipItem[];
}

export const OwnershipSection: React.FC<OwnershipSectionProps> = ({ ownership }) => {
  const chartData = {
    labels: ownership.map((o) => o.klien),
    datasets: [
      {
        label: 'Session BGM',
        data: ownership.map((o) => o.session_bgm),
        backgroundColor: 'rgba(196, 30, 58, 0.85)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        ticks: { stepSize: 1, color: '#8B9BB8', font: { size: 10 } },
        grid: { color: '#2A3A5C' },
      },
      x: {
        ticks: { color: '#E8ECF4', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  const compliantCount = ownership.filter((o) => o.session_bgm >= 2).length;

  return (
    <div className="bg-[#1F2A44] border border-[#2A3A5C] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8B9BB8] flex items-center gap-2">
            <span className="w-1 h-3.5 bg-[#C41E3A] rounded-sm" />
            <span>Ownership Weekly Session</span>
          </div>

          <div className="text-xs text-[#8B9BB8] flex items-center gap-1.5">
            <span className="font-semibold text-emerald-400">{compliantCount} dari {ownership.length}</span>
            <span>klien on-track</span>
          </div>
        </div>

        <div className="h-44 bg-black/15 rounded-xl p-3 border border-[#2A3A5C]/60 mb-3">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="p-3 rounded-xl bg-black/20 border border-[#2A3A5C] text-xs text-[#8B9BB8] flex items-start gap-2.5">
          <div className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-200 font-semibold">Target Operational Leverage (OL):</span>{' '}
            Minimal <strong className="text-white">2 dari 3</strong> weekly session dipegang oleh BGM
            di akhir bulan ke-3 untuk menjamin skalabilitas tim.
          </div>
        </div>
      </div>
    </div>
  );
};
