import React, { useState } from 'react';
import { X, Plus, Edit2, Check } from 'lucide-react';
import { DashboardData, KlienItem, PipelineItem, IssueItem } from '../../types/tsj';

interface EditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashboardData;
  onSaveData: (newData: DashboardData) => void;
}

export const EditDataModal: React.FC<EditDataModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaveData,
}) => {
  const [activeTab, setActiveTab] = useState<'klien' | 'pipeline' | 'issue'>('klien');

  // Form states for new items
  const [klienNama, setKlienNama] = useState('');
  const [klienStage, setKlienStage] = useState('Active');
  const [klienLeads, setKlienLeads] = useState(10);
  const [klienMeeting, setKlienMeeting] = useState(3);
  const [klienRev, setKlienRev] = useState(20);
  const [klienPct, setKlienPct] = useState(80);
  const [klienOwner, setKlienOwner] = useState('Ayumi');
  const [klienRisiko, setKlienRisiko] = useState('Low');

  const [pipeNama, setPipeNama] = useState('');
  const [pipeStage, setPipeStage] = useState('Proposal');
  const [pipeNilai, setPipeNilai] = useState(50);
  const [pipeProb, setPipeProb] = useState(40);

  const [issueText, setIssueText] = useState('');
  const [issueArea, setIssueArea] = useState('Operasional');
  const [issueImpact, setIssueImpact] = useState('Medium');
  const [issueAction, setIssueAction] = useState('');
  const [issueOwner, setIssueOwner] = useState('Ayumi');
  const [issueDeadline, setIssueDeadline] = useState('Ongoing');

  if (!isOpen) return null;

  const handleAddKlien = (e: React.FormEvent) => {
    e.preventDefault();
    if (!klienNama.trim()) return;

    const newKlien: KlienItem = {
      nama: klienNama.trim(),
      stage: klienStage,
      leads: Number(klienLeads),
      meeting: Number(klienMeeting),
      revenue_jt: Number(klienRev),
      pct_target: Number(klienPct),
      owner: klienOwner,
      risiko: klienRisiko,
    };

    const updated = {
      ...data,
      klien: [...data.klien, newKlien],
    };
    onSaveData(updated);
    setKlienNama('');
  };

  const handleAddPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipeNama.trim()) return;

    const expected = (Number(pipeNilai) * Number(pipeProb)) / 100;
    const newDeal: PipelineItem = {
      nama: pipeNama.trim(),
      stage: pipeStage,
      nilai_jt: Number(pipeNilai),
      prob: Number(pipeProb),
      expected_jt: Number(expected.toFixed(1)),
    };

    const updated = {
      ...data,
      pipeline: [...data.pipeline, newDeal],
    };
    onSaveData(updated);
    setPipeNama('');
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    const newIssue: IssueItem = {
      issue: issueText.trim(),
      area: issueArea,
      impact: issueImpact,
      next_action: issueAction.trim() || 'Follow up tim terkait',
      owner: issueOwner,
      deadline: issueDeadline,
      status: 'Open',
    };

    const updated = {
      ...data,
      issue: [...data.issue, newIssue],
    };
    onSaveData(updated);
    setIssueText('');
    setIssueAction('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-[#2A3A5C] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-[#2A3A5C] flex items-center justify-between bg-[#16213E]">
          <div className="flex items-center gap-2.5">
            <Edit2 className="w-5 h-5 text-[#C41E3A]" />
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Tambah Data Cepat (Lokal / Manual)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8B9BB8] hover:text-white rounded-lg hover:bg-[#1F2A44] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-5 py-2.5 bg-[#1F2A44]/80 border-b border-[#2A3A5C] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('klien')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'klien' ? 'bg-[#C41E3A] text-white' : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Tambah Klien
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'pipeline' ? 'bg-[#C41E3A] text-white' : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Tambah Pipeline Deal
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'issue' ? 'bg-[#C41E3A] text-white' : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Tambah Issue Bisnis
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs space-y-4">
          {activeTab === 'klien' && (
            <form onSubmit={handleAddKlien} className="space-y-3">
              <div>
                <label className="block text-[#8B9BB8] mb-1 font-semibold">Nama Klien</label>
                <input
                  type="text"
                  value={klienNama}
                  onChange={(e) => setKlienNama(e.target.value)}
                  placeholder="Contoh: Klien F (Retail)"
                  className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none focus:border-[#C41E3A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Stage</label>
                  <select
                    value={klienStage}
                    onChange={(e) => setKlienStage(e.target.value)}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Renewal">Renewal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Owner (PIC)</label>
                  <input
                    type="text"
                    value={klienOwner}
                    onChange={(e) => setKlienOwner(e.target.value)}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Leads MTD</label>
                  <input
                    type="number"
                    value={klienLeads}
                    onChange={(e) => setKlienLeads(Number(e.target.value))}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Meeting</label>
                  <input
                    type="number"
                    value={klienMeeting}
                    onChange={(e) => setKlienMeeting(Number(e.target.value))}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Revenue (jt)</label>
                  <input
                    type="number"
                    value={klienRev}
                    onChange={(e) => setKlienRev(Number(e.target.value))}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">% Target</label>
                  <input
                    type="number"
                    value={klienPct}
                    onChange={(e) => setKlienPct(Number(e.target.value))}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Tingkat Risiko</label>
                  <select
                    value={klienRisiko}
                    onChange={(e) => setKlienRisiko(e.target.value)}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#9B1830] text-white font-bold transition-colors mt-2"
              >
                Simpan Klien Baru
              </button>
            </form>
          )}

          {activeTab === 'pipeline' && (
            <form onSubmit={handleAddPipeline} className="space-y-3">
              <div>
                <label className="block text-[#8B9BB8] mb-1 font-semibold">Nama Prospek</label>
                <input
                  type="text"
                  value={pipeNama}
                  onChange={(e) => setPipeNama(e.target.value)}
                  placeholder="Contoh: PT Sinar Abadi"
                  className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none focus:border-[#C41E3A]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Stage</label>
                  <select
                    value={pipeStage}
                    onChange={(e) => setPipeStage(e.target.value)}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="Discovery">Discovery</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closing">Closing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Nilai Est (jt)</label>
                  <input
                    type="number"
                    value={pipeNilai}
                    onChange={(e) => setPipeNilai(Number(e.target.value))}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Probabilitas (%)</label>
                  <input
                    type="number"
                    value={pipeProb}
                    onChange={(e) => setPipeProb(Number(e.target.value))}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-black/20 rounded-xl text-[#8B9BB8]">
                Expected Value Otomatis:{' '}
                <strong className="text-emerald-400">
                  Rp {((pipeNilai * pipeProb) / 100).toFixed(1)}jt
                </strong>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#9B1830] text-white font-bold transition-colors mt-2"
              >
                Simpan Deal Pipeline
              </button>
            </form>
          )}

          {activeTab === 'issue' && (
            <form onSubmit={handleAddIssue} className="space-y-3">
              <div>
                <label className="block text-[#8B9BB8] mb-1 font-semibold">Deskripsi Issue</label>
                <input
                  type="text"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Contoh: Leads Klien X belum terkirim"
                  className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none focus:border-[#C41E3A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Area / Klien</label>
                  <input
                    type="text"
                    value={issueArea}
                    onChange={(e) => setIssueArea(e.target.value)}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Impact</label>
                  <select
                    value={issueImpact}
                    onChange={(e) => setIssueImpact(e.target.value)}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8B9BB8] mb-1 font-semibold">Next Action Solusi</label>
                <input
                  type="text"
                  value={issueAction}
                  onChange={(e) => setIssueAction(e.target.value)}
                  placeholder="Langkah penyelesaian masalah"
                  className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Owner (PIC)</label>
                  <input
                    type="text"
                    value={issueOwner}
                    onChange={(e) => setIssueOwner(e.target.value)}
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9BB8] mb-1 font-semibold">Deadline</label>
                  <input
                    type="text"
                    value={issueDeadline}
                    onChange={(e) => setIssueDeadline(e.target.value)}
                    placeholder="Contoh: 05/11/2026 atau Ongoing"
                    className="w-full bg-black/30 border border-[#2A3A5C] rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#C41E3A] hover:bg-[#9B1830] text-white font-bold transition-colors mt-2"
              >
                Simpan Issue Baru
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
