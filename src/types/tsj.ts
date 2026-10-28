export interface Meta {
  periode: string;
  status_overall: string;
}

export interface KPIItem {
  label: string;
  value: string;
  sub?: string;
}

export interface PilarItem {
  nama: string;
  target: number;
  aktual: number;
}

export interface KlienItem {
  nama: string;
  stage: 'Active' | 'Onboarding' | 'At Risk' | 'Renewal' | string;
  leads: number;
  meeting: number;
  revenue_jt: number;
  pct_target: number;
  owner: string;
  risiko: 'Low' | 'Medium' | 'High' | string;
}

export interface PipelineItem {
  nama: string;
  stage: 'Discovery' | 'Proposal' | 'Negotiation' | 'Closing' | string;
  nilai_jt: number;
  prob: number;
  expected_jt: number;
}

export interface OwnershipItem {
  klien: string;
  session_bgm: number;
}

export interface WeeklyItem {
  minggu: string;
  proposal: number;
  discovery: number;
  meeting: number;
  leads: number;
  revenue_jt: number;
}

export interface IssueItem {
  issue: string;
  area: string;
  impact: 'Low' | 'Medium' | 'High' | string;
  next_action: string;
  owner: string;
  deadline: string;
  status: 'Open' | 'In Progress' | 'Done' | string;
}

export interface DashboardData {
  meta: Meta;
  kpi: KPIItem[];
  pilar: PilarItem[];
  klien: KlienItem[];
  pipeline: PipelineItem[];
  ownership: OwnershipItem[];
  weekly: WeeklyItem[];
  issue: IssueItem[];
  updated_at?: string;
}

export interface AIAdvisorResponse {
  executiveSummary: string;
  healthScore: number;
  statusOverall: string;
  urgentRisks: {
    clientOrArea: string;
    riskLevel: string;
    analysis: string;
    recommendedAction: string;
  }[];
  strategicNextSteps: {
    action: string;
    owner: string;
    priority: string;
    expectedImpact: string;
  }[];
  pipelineInsight: string;
}
