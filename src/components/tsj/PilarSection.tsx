import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PilarItem } from '../../types/tsj';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PilarSectionProps {
  pilar: PilarItem[];
}

export const PilarSection: React.FC<PilarSectionProps> = ({ pilar }) => {
  const pctStatus = (pct: number) => {
    if (pct >= 100) return { text: 'Exceeded', color: '#5CDB7A', barClass: 'bg-[#28A745]' };
    if (pct >= 80) return { text: 'On Track', color: '#5CDB7A', barClass: 'bg-[#28A745]' };
    if (pct >= 50) return { text: 'Behind', color: '#F5B041', barClass: 'bg-[#E6A817]' };
    return { text: 'At Risk', color: '#FF6B81', barClass: 'bg-[#C41E3A]' };
  };

  // Bar Chart Configuration: Target vs Aktual
  const barData = {
    labels: pilar.map((p) => p.nama),
    datasets: [
      {
        label: 'Target',
        data: pilar.map((p) => p.target),
        backgroundColor: 'rgba(196, 30, 58, 0.75)',
        borderRadius: 4,
      },
      {
        label: 'Aktual',
        data: pilar.map((p) => p.aktual),
        backgroundColor: 'rgba(52, 152, 219, 0.75)',
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
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
        beginAtZero: true,
        ticks: { color: '#8B9BB8', font: { size: 10 } },
        grid: { color: '#2A3A5C' },
      },
      x: {
        ticks: { color: '#8B9BB8', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // Doughnut Chart Configuration: Achievement %
  const pcts = pilar.map((p) => (p.target ? Math.round((p.aktual / p.target) * 100) : 0));
  const doughnutData = {
    labels: pilar.map((p, i) => `${p.nama} (${pcts[i]}%)`),
    datasets: [
      {
        data: pcts,
        backgroundColor: ['#E6A817', '#E67E22', '#C41E3A'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: '#8B9BB8', font: { size: 11 } },
      },
      title: {
        display: true,
        text: 'Achievement %',
        color: '#8B9BB8',
        font: { size: 12, weight: 'bold' as const },
      },
      tooltip: {
        backgroundColor: '#16213E',
        titleColor: '#E8ECF4',
        bodyColor: '#8B9BB8',
        borderColor: '#2A3A5C',
        borderWidth: 1,
      },
    },
    cutout: '55%',
  };

  return (
    <div className="bg-[#1F2A44] border border-[#2A3A5C] rounded-2xl p-5 mb-6 shadow-lg">
      <div className="text-xs font-bold uppercase tracking-wider text-[#8B9BB8] mb-4 flex items-center gap-2">
        <span className="w-1 h-3.5 bg-[#C41E3A] rounded-sm" />
        <span>3 Pilar Layanan — Target vs Aktual</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {pilar.map((p, idx) => {
          const pct = p.target ? Math.round((p.aktual / p.target) * 100) : 0;
          const status = pctStatus(pct);
          const isRev = p.nama.toUpperCase().includes('REVENUE');

          return (
            <div
              key={idx}
              className="bg-black/25 rounded-xl p-4 border border-[#2A3A5C] flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xs font-semibold text-[#8B9BB8] tracking-wider uppercase mb-1">
                  {p.nama}
                </h3>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-2xl font-black text-white font-mono tabular-nums">
                    {isRev ? `Rp ${p.aktual}jt` : p.aktual}
                  </span>
                  <span className="text-xs text-[#8B9BB8] font-mono">
                    / {isRev ? `Rp ${p.target}jt` : p.target}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs font-bold" style={{ color: status.color }}>
                  <span>{pct}%</span>
                  <span>{status.text}</span>
                </div>
                <div className="h-1.5 bg-[#2A3A5C] rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${status.barClass}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-56 bg-black/15 rounded-xl p-3 border border-[#2A3A5C]/60">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="h-56 bg-black/15 rounded-xl p-3 border border-[#2A3A5C]/60 flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};
