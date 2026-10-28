import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/tsj/TopBar';
import { KpiSection } from './components/tsj/KpiSection';
import { PilarSection } from './components/tsj/PilarSection';
import { KlienSection } from './components/tsj/KlienSection';
import { PipelineSection } from './components/tsj/PipelineSection';
import { OwnershipSection } from './components/tsj/OwnershipSection';
import { WeeklyTrendsSection } from './components/tsj/WeeklyTrendsSection';
import { IssueSection } from './components/tsj/IssueSection';
import { GoogleSheetsModal } from './components/tsj/GoogleSheetsModal';
import { AiAdvisorModal } from './components/tsj/AiAdvisorModal';
import { EditDataModal } from './components/tsj/EditDataModal';
import { DashboardData } from './types/tsj';
import { TSJ_DEMO_DATA } from './data/tsjDemo';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<DashboardData>(() => {
    try {
      const saved = localStorage.getItem('tsj_dashboard_data');
      return saved ? JSON.parse(saved) : TSJ_DEMO_DATA;
    } catch {
      return TSJ_DEMO_DATA;
    }
  });

  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('tsj_api_url') || '';
  });

  const [refreshInterval, setRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem('tsj_refresh_interval');
    return saved ? Number(saved) : 0;
  });

  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(data.updated_at);

  // Modals
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch data from Google Sheets API via server proxy
  const loadData = useCallback(async (targetUrl?: string) => {
    const url = targetUrl !== undefined ? targetUrl : apiUrl;

    if (!url || !url.trim()) {
      setIsLive(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const proxyUrl = `/api/sheets-proxy?url=${encodeURIComponent(url.trim())}&action=all`;
      const res = await fetch(proxyUrl);
      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      // Merge payload safely
      const updatedData: DashboardData = {
        meta: json.meta || data.meta,
        kpi: json.kpi?.length ? json.kpi : data.kpi,
        pilar: json.pilar?.length ? json.pilar : data.pilar,
        klien: json.klien?.length ? json.klien : data.klien,
        pipeline: json.pipeline?.length ? json.pipeline : data.pipeline,
        ownership: json.ownership?.length ? json.ownership : data.ownership,
        weekly: json.weekly?.length ? json.weekly : data.weekly,
        issue: json.issue?.length ? json.issue : data.issue,
        updated_at: json.updated_at || new Date().toISOString(),
      };

      setData(updatedData);
      setIsLive(true);
      setLastUpdated(updatedData.updated_at);
      localStorage.setItem('tsj_dashboard_data', JSON.stringify(updatedData));
    } catch (err: any) {
      console.warn('Gagal memuat Google Sheets:', err);
      setIsLive(false);
      setErrorMessage(
        `Gagal memuat data dari Google Sheets: ${err.message}. Menampilkan data demo/tersimpan.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, data]);

  // Initial load
  useEffect(() => {
    if (apiUrl && apiUrl.trim()) {
      loadData(apiUrl);
    }
  }, [apiUrl]);

  // Auto refresh timer
  useEffect(() => {
    let intervalId: any;
    if (refreshInterval > 0 && apiUrl) {
      intervalId = setInterval(() => {
        loadData(apiUrl);
      }, refreshInterval);
    }
    return () => clearInterval(intervalId);
  }, [refreshInterval, apiUrl, loadData]);

  // Save Config handler
  const handleSaveConfig = (newUrl: string, newInterval: number) => {
    setApiUrl(newUrl);
    setRefreshInterval(newInterval);
    localStorage.setItem('tsj_api_url', newUrl);
    localStorage.setItem('tsj_refresh_interval', String(newInterval));
    loadData(newUrl);
  };

  // Save local data edits
  const handleSaveData = (newData: DashboardData) => {
    setData(newData);
    localStorage.setItem('tsj_dashboard_data', JSON.stringify(newData));
  };

  // Update issue status inline
  const handleUpdateIssueStatus = (index: number, newStatus: string) => {
    const updatedIssues = [...data.issue];
    if (updatedIssues[index]) {
      updatedIssues[index] = { ...updatedIssues[index], status: newStatus };
      handleSaveData({ ...data, issue: updatedIssues });
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-[#E8ECF4] flex flex-col font-['Segoe_UI',system-ui,sans-serif]">
      {/* Top Bar */}
      <TopBar
        meta={data.meta}
        isLive={isLive}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onRefresh={() => loadData()}
        onOpenSheetsConfig={() => setIsSheetsModalOpen(true)}
        onOpenAiAdvisor={() => setIsAiModalOpen(true)}
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Error Notice Banner */}
        {errorMessage && (
          <div className="bg-[#E74C3C]/15 border border-[#E74C3C] text-[#FF6B81] p-3 rounded-xl mb-4 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="underline hover:text-white font-semibold ml-2 shrink-0"
            >
              Cek URL
            </button>
          </div>
        )}

        {/* 1. 8 Core KPI Cards */}
        <KpiSection kpis={data.kpi} />

        {/* 2. 3 Pilar Layanan (Target vs Aktual & Charts) */}
        <PilarSection pilar={data.pilar} />

        {/* 3. Kesehatan Klien Aktif & Revenue per Klien */}
        <KlienSection klien={data.klien} onAddKlien={() => setIsEditModalOpen(true)} />

        {/* 4. Split Grid: Pipeline Prospek & Ownership Weekly Session */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <PipelineSection pipeline={data.pipeline} />
          <OwnershipSection ownership={data.ownership} />
        </div>

        {/* 5. Tren Mingguan (Aktivitas & Revenue) */}
        <WeeklyTrendsSection weekly={data.weekly} />

        {/* 6. Issue Bisnis & Next Action */}
        <IssueSection
          issues={data.issue}
          onAddIssue={() => setIsEditModalOpen(true)}
          onUpdateStatus={handleUpdateIssueStatus}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A3A5C] py-4 text-center text-xs text-[#8B9BB8] bg-[#16213E]/50">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TimSalesJuara · PT Sinergi Unggul Indonesia</span>
          <span>Google Sheets API Integrator · AI Business Advisor</span>
        </div>
      </footer>

      {/* Modals */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        apiUrl={apiUrl}
        refreshInterval={refreshInterval}
        onSaveConfig={handleSaveConfig}
      />

      <AiAdvisorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        dashboardData={data}
      />

      <EditDataModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={data}
        onSaveData={handleSaveData}
      />
    </div>
  );
}
