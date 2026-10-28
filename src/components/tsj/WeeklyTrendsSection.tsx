import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { WeeklyItem } from '../../types/tsj';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeeklyTrendsSectionProps {
  weekly: WeeklyItem[];
}

export const WeeklyTrendsSection: React.FC<WeeklyTrendsSectionProps> = ({ weekly }) => {
  const [activeTab, setActiveTab] = useState<'aktivitas' | 'revenue'>('aktivitas');

  // Aktivitas Multi-Line Chart
  const aktivitasData = {
    labels: weekly.map((w) => w.minggu),
    datasets: [
      {
        label: 'Proposal',
        data: weekly.map((w) => w.proposal),
        borderColor: '#C41E3A',
        backgroundColor: '#C41E3A',
        tension: 0.35,
        pointRadius: 4,
      },
      {
        label: 'Meeting',
        data: weekly.map((w) => w.meeting),
        borderColor: '#3498DB',
        backgroundColor: '#3498DB',
        tension: 0.35,
        pointRadius: 4,
      },
      {
        label: 'Leads',
        data: weekly.map((w) => w.leads),
        borderColor: '#28A745',
        backgroundColor: '#28A745',
        tension: 0.35,
        pointRadius: 4,
      },
      {
        label: 'Discovery',
        data: weekly.map((w) => w.discovery),
        borderColor: '#E6A817',
        backgroundColor: '#E6A817',
        tension: 0.35,
        pointRadius: 4,
      },
    ],
  };

  // Revenue Area Chart
  const revenueData = {
    labels: weekly.map((w) => w.minggu),
    datasets: [
      {
        label: 'Revenue (jt)',
        data: weekly.map((w) => w.revenue_jt),
        borderColor: '#C41E3A',
        backgroundColor: 'rgba(196, 30, 58, 0.18)',
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const commonOptions = {
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

  return (
    <div className="bg-[#1F2A44] border border-[#2A3A5C] rounded-2xl p-5 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#8B9BB8] flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#C41E3A] rounded-sm" />
          <span>Tren Mingguan</span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-black/25 rounded-xl border border-[#2A3A5C]">
          <button
            onClick={() => setActiveTab('aktivitas')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'aktivitas'
                ? 'bg-[#C41E3A] text-white shadow-sm'
                : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Aktivitas Operasional
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'revenue'
                ? 'bg-[#C41E3A] text-white shadow-sm'
                : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Revenue Mingguan
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 bg-black/15 rounded-xl p-3 border border-[#2A3A5C]/60">
        {activeTab === 'aktivitas' ? (
          <Line data={aktivitasData} options={commonOptions} />
        ) : (
          <Line data={revenueData} options={commonOptions} />
        )}
      </div>
    </div>
  );
};
