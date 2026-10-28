import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Plus, Search } from 'lucide-react';
import { IssueItem } from '../../types/tsj';

interface IssueSectionProps {
  issues: IssueItem[];
  onAddIssue?: () => void;
  onUpdateStatus?: (index: number, newStatus: string) => void;
}

export const IssueSection: React.FC<IssueSectionProps> = ({
  issues,
  onAddIssue,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const statusClass = (s: string) => {
    const v = String(s || '').toLowerCase();
    if (v === 'done') {
      return 'bg-[#28A745]/20 text-[#5CDB7A] border border-[#28A745]/40';
    }
    if (v === 'in progress') {
      return 'bg-[#E6A817]/20 text-[#F5B041] border border-[#E6A817]/40';
    }
    return 'bg-[#C41E3A]/20 text-[#FF6B81] border border-[#C41E3A]/40';
  };

  const impactClass = (imp: string) => {
    const v = String(imp || '').toLowerCase();
    if (v === 'high') return 'text-[#FF6B81] font-bold';
    if (v === 'medium') return 'text-[#F5B041] font-semibold';
    return 'text-[#5CDB7A]';
  };

  const filteredIssues = issues.filter((item) => {
    const matchesSearch =
      item.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#1F2A44] border border-[#2A3A5C] rounded-2xl p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#8B9BB8] flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#C41E3A] rounded-sm" />
          <span>Issue Bisnis & Next Action</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8B9BB8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari issue atau PIC…"
              className="bg-black/20 border border-[#2A3A5C] focus:border-[#C41E3A] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8B9BB8] outline-none"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/20 border border-[#2A3A5C] text-[#8B9BB8] rounded-lg px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="All">Semua Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {onAddIssue && (
            <button
              onClick={onAddIssue}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#C41E3A] hover:bg-[#9B1830] rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Issue</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#C41E3A]/15 text-[#FF8A9A] uppercase text-[10px] font-bold border-b border-[#2A3A5C]">
              <th className="py-2.5 px-3">Issue</th>
              <th className="py-2.5 px-2.5">Area</th>
              <th className="py-2.5 px-2.5">Impact</th>
              <th className="py-2.5 px-3">Next Action</th>
              <th className="py-2.5 px-2.5">Owner</th>
              <th className="py-2.5 px-2.5">Deadline</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3A5C]/60">
            {filteredIssues.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-3 px-3 font-semibold text-slate-100 max-w-xs">{item.issue}</td>
                <td className="py-3 px-2.5 text-slate-300 whitespace-nowrap">{item.area}</td>
                <td className={`py-3 px-2.5 whitespace-nowrap ${impactClass(item.impact)}`}>
                  {item.impact}
                </td>
                <td className="py-3 px-3 text-[#8B9BB8] max-w-sm leading-relaxed">
                  {item.next_action}
                </td>
                <td className="py-3 px-2.5 text-slate-200 whitespace-nowrap font-medium">
                  {item.owner}
                </td>
                <td className="py-3 px-2.5 text-[#8B9BB8] font-mono tabular-nums whitespace-nowrap">
                  {item.deadline}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {onUpdateStatus ? (
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(idx, e.target.value)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold outline-none cursor-pointer ${statusClass(
                        item.status
                      )}`}
                    >
                      <option value="Open" className="bg-[#1A1A2E] text-white">Open</option>
                      <option value="In Progress" className="bg-[#1A1A2E] text-white">In Progress</option>
                      <option value="Done" className="bg-[#1A1A2E] text-white">Done</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
