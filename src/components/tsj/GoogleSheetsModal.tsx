import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { GAS_SCRIPT_CODE } from '../../data/tsjDemo';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSaveConfig: (url: string, refreshInterval: number) => void;
  refreshInterval: number;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSaveConfig,
  refreshInterval,
}) => {
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [intervalInput, setIntervalInput] = useState(refreshInterval);
  const [activeTab, setActiveTab] = useState<'config' | 'guide' | 'script'>('config');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestStatus('error');
      setTestMessage('Masukkan URL Web App terlebih dahulu.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Menghubungkan ke Google Sheets…');

    try {
      const proxyUrl = `/api/sheets-proxy?url=${encodeURIComponent(urlInput.trim())}&action=all`;
      const res = await fetch(proxyUrl);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setTestStatus('success');
      setTestMessage(
        `Berhasil terhubung! Mendapatkan data: ${data.klien?.length || 0} klien, ${
          data.pipeline?.length || 0
        } pipeline deal.`
      );
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(
        `Gagal terhubung: ${e.message}. Pastikan Web App di-deploy dengan akses 'Anyone'.`
      );
    }
  };

  const handleSave = () => {
    onSaveConfig(urlInput.trim(), Number(intervalInput));
    onClose();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1A1A2E] border border-[#2A3A5C] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2A3A5C] flex items-center justify-between bg-[#16213E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Integrasi Google Sheets API
              </h2>
              <p className="text-xs text-[#8B9BB8]">
                Sinkronkan spreadsheet operasional langsung ke dashboard TimSalesJuara
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

        {/* Tab Switcher */}
        <div className="px-5 py-2.5 bg-[#1F2A44]/80 border-b border-[#2A3A5C] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'config'
                ? 'bg-[#C41E3A] text-white shadow-sm'
                : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Pengaturan API
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'guide'
                ? 'bg-[#C41E3A] text-white shadow-sm'
                : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Panduan Pasang (8 Sheet)
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'script'
                ? 'bg-[#C41E3A] text-white shadow-sm'
                : 'text-[#8B9BB8] hover:text-white'
            }`}
          >
            Kode Apps Script
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full bg-black/30 border border-[#2A3A5C] focus:border-[#C41E3A] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8B9BB8] outline-none font-mono"
                />
                <p className="text-[11px] text-[#8B9BB8] mt-1.5">
                  Kosongkan URL jika ingin menjalankan dashboard dalam mode <strong>Demo Data</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Interval Auto-Refresh Data
                </label>
                <select
                  value={intervalInput}
                  onChange={(e) => setIntervalInput(Number(e.target.value))}
                  className="w-full bg-black/30 border border-[#2A3A5C] text-white rounded-xl px-4 py-2.5 text-xs outline-none"
                >
                  <option value={0}>Nonaktif (Refresh Manual)</option>
                  <option value={60000}>Setiap 1 Menit</option>
                  <option value={300000}>Setiap 5 Menit (Direkomendasikan)</option>
                  <option value={900000}>Setiap 15 Menit</option>
                </select>
              </div>

              {/* Test Button & Result */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="px-4 py-2 bg-[#1F2A44] hover:bg-[#2A3A5C] border border-[#2A3A5C] text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi Google Sheets</span>
                </button>

                {testStatus !== 'idle' && (
                  <div
                    className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      testStatus === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : testStatus === 'error'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                    }`}
                  >
                    {testStatus === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>{testMessage}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-black/30 border border-[#2A3A5C] leading-relaxed">
                <strong className="text-white block mb-1">Struktur 8 Sheet di Google Spreadsheet:</strong>
                Pastikan nama tab sheet dan header kolom baris 1 persis sesuai tabel berikut:
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[#2A3A5C]">
                  <thead>
                    <tr className="bg-[#C41E3A]/20 text-[#FF8A9A]">
                      <th className="p-2 border border-[#2A3A5C]">Nama Sheet</th>
                      <th className="p-2 border border-[#2A3A5C]">Kolom Header (Baris 1)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A5C]">
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">Meta</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">key | value</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">KPI</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">label | value | sub</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">Pilar</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">nama | target | aktual</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">Klien</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">
                        nama | stage | leads | meeting | revenue_jt | pct_target | owner | risiko
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">Pipeline</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">
                        nama | stage | nilai_jt | prob | expected_jt
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">Ownership</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">klien | session_bgm</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">Weekly</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">
                        minggu | proposal | discovery | meeting | leads | revenue_jt
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white border border-[#2A3A5C]">Issue</td>
                      <td className="p-2 font-mono text-[#8B9BB8] border border-[#2A3A5C]">
                        issue | area | impact | next_action | owner | deadline | status
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-[#C41E3A]/10 border border-[#C41E3A]/30 text-[#FF8A9A]">
                <strong>Catatan Deploy:</strong> Di Google Apps Script, pilih <em>Deploy → New Deployment → Type: Web App</em>.
                Set <em>Who has access</em> ke <strong>Anyone</strong> agar API dapat dibaca oleh dashboard tanpa login.
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8B9BB8]">
                  Salin seluruh kode di bawah dan tempel di editor Apps Script Spreadsheet Anda:
                </span>
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-[#C41E3A] hover:bg-[#9B1830] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-black/50 border border-[#2A3A5C] text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-96">
                {GAS_SCRIPT_CODE}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2A3A5C] bg-[#16213E] flex items-center justify-between">
          <button
            onClick={() => {
              setUrlInput('');
              onSaveConfig('', 0);
              onClose();
            }}
            className="text-xs text-[#8B9BB8] hover:text-white"
          >
            Reset ke Demo Data
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#1F2A44]"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C41E3A] hover:bg-[#9B1830] text-white shadow-md transition-colors"
            >
              Simpan & Muat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
