import { DashboardData } from '../types/tsj';

export const TSJ_DEMO_DATA: DashboardData = {
  meta: {
    periode: 'Oktober 2026',
    status_overall: 'On Track',
  },
  kpi: [
    { label: 'Klien Aktif', value: '5', sub: '+1 vs bulan lalu' },
    { label: 'Prospek Pipeline', value: '8', sub: 'Expected value aktif' },
    { label: 'Proposal MTD', value: '4', sub: '≤3 hari kerja' },
    { label: 'Win Rate', value: '50%', sub: '2 dari 4 proposal' },
    { label: 'Meeting MTD', value: '14', sub: 'Target 20' },
    { label: 'Revenue MTD', value: 'Rp 95jt', sub: 'Target Rp 150jt' },
    { label: 'Retention', value: '100%', sub: 'Target ≥80%' },
    { label: 'Churn QTD', value: '0', sub: 'Maks 1 / kuartal' },
  ],
  pilar: [
    { nama: 'LEADS', target: 100, aktual: 75 },
    { nama: 'MEETINGS', target: 20, aktual: 14 },
    { nama: 'REVENUE', target: 150, aktual: 95 },
  ],
  klien: [
    { nama: 'Klien A', stage: 'Active', leads: 20, meeting: 5, revenue_jt: 35, pct_target: 90, owner: 'Ayumi', risiko: 'Low' },
    { nama: 'Klien B', stage: 'Active', leads: 12, meeting: 3, revenue_jt: 18, pct_target: 55, owner: 'Ayumi', risiko: 'Medium' },
    { nama: 'Klien C', stage: 'Onboarding', leads: 8, meeting: 2, revenue_jt: 0, pct_target: 40, owner: 'Shared', risiko: 'Low' },
    { nama: 'Klien D', stage: 'At Risk', leads: 5, meeting: 1, revenue_jt: 5, pct_target: 25, owner: 'Ayumi', risiko: 'High' },
    { nama: 'Klien E', stage: 'Active', leads: 25, meeting: 4, revenue_jt: 40, pct_target: 105, owner: 'Direktur', risiko: 'Low' },
  ],
  pipeline: [
    { nama: 'Prospek X', stage: 'Proposal', nilai_jt: 50, prob: 40, expected_jt: 20 },
    { nama: 'Prospek Y', stage: 'Negotiation', nilai_jt: 80, prob: 60, expected_jt: 48 },
    { nama: 'Prospek Z', stage: 'Discovery', nilai_jt: 30, prob: 20, expected_jt: 6 },
    { nama: 'Prospek W', stage: 'Proposal', nilai_jt: 45, prob: 35, expected_jt: 15.8 },
  ],
  ownership: [
    { klien: 'Klien A', session_bgm: 3 },
    { klien: 'Klien B', session_bgm: 2 },
    { klien: 'Klien C', session_bgm: 0 },
    { klien: 'Klien D', session_bgm: 4 },
    { klien: 'Klien E', session_bgm: 0 },
  ],
  weekly: [
    { minggu: 'W1', proposal: 1, discovery: 2, meeting: 3, leads: 15, revenue_jt: 10 },
    { minggu: 'W2', proposal: 2, discovery: 1, meeting: 4, leads: 22, revenue_jt: 25 },
    { minggu: 'W3', proposal: 0, discovery: 3, meeting: 3, leads: 18, revenue_jt: 20 },
    { minggu: 'W4', proposal: 1, discovery: 2, meeting: 4, leads: 20, revenue_jt: 40 },
  ],
  issue: [
    { issue: 'Leads Klien D jauh di bawah target', area: 'Klien D', impact: 'High', next_action: 'Audit channel + ganti ICP', owner: 'Ayumi', deadline: '05/11/2026', status: 'Open' },
    { issue: 'Report Klien B sempat revisi data', area: 'QC / Report', impact: 'Medium', next_action: 'Perketat checklist QC', owner: 'Ayumi', deadline: 'Ongoing', status: 'In Progress' },
  ],
};

export const GAS_SCRIPT_CODE = `/**
 * TimSalesJuara — Google Apps Script API untuk Dashboard
 * Paste di Extensions → Apps Script pada Spreadsheet Anda
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'all';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let payload = {};

    if (action === 'all' || action === 'kpi') {
      payload.kpi = readSheetAsObjects_(ss, 'KPI', ['label', 'value', 'sub']);
    }
    if (action === 'all' || action === 'pilar') {
      payload.pilar = readSheetAsObjects_(ss, 'Pilar', ['nama', 'target', 'aktual']);
    }
    if (action === 'all' || action === 'klien') {
      payload.klien = readSheetAsObjects_(ss, 'Klien', [
        'nama', 'stage', 'leads', 'meeting', 'revenue_jt', 'pct_target', 'owner', 'risiko'
      ]);
    }
    if (action === 'all' || action === 'pipeline') {
      payload.pipeline = readSheetAsObjects_(ss, 'Pipeline', [
        'nama', 'stage', 'nilai_jt', 'prob', 'expected_jt'
      ]);
    }
    if (action === 'all' || action === 'ownership') {
      payload.ownership = readSheetAsObjects_(ss, 'Ownership', ['klien', 'session_bgm']);
    }
    if (action === 'all' || action === 'weekly') {
      payload.weekly = readSheetAsObjects_(ss, 'Weekly', [
        'minggu', 'proposal', 'discovery', 'meeting', 'leads', 'revenue_jt'
      ]);
    }
    if (action === 'all' || action === 'issue') {
      payload.issue = readSheetAsObjects_(ss, 'Issue', [
        'issue', 'area', 'impact', 'next_action', 'owner', 'deadline', 'status'
      ]);
    }
    if (action === 'all' || action === 'meta') {
      payload.meta = readMeta_(ss);
    }

    payload.updated_at = new Date().toISOString();
    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: String(err), stack: err.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function readSheetAsObjects_(ss, sheetName, fields) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim().toLowerCase().replace(/\\s+/g, '_'));
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(c => c === '' || c === null)) continue;
    const obj = {};
    fields.forEach(field => {
      let idx = headers.indexOf(field);
      if (idx === -1) idx = headers.indexOf(field.replace(/_/g, ' '));
      const val = idx >= 0 ? row[idx] : '';
      if (typeof val === 'number') {
        obj[field] = val;
      } else if (val !== '' && !isNaN(Number(String(val).replace(/,/g, '')))) {
        obj[field] = Number(String(val).replace(/,/g, ''));
      } else {
        obj[field] = val === null || val === undefined ? '' : String(val);
      }
    });
    rows.push(obj);
  }
  return rows;
}

function readMeta_(ss) {
  const sheet = ss.getSheetByName('Meta');
  if (!sheet) return { periode: '', status_overall: 'On Track' };
  const values = sheet.getDataRange().getValues();
  const meta = {};
  for (let i = 0; i < values.length; i++) {
    const key = String(values[i][0] || '').trim().toLowerCase().replace(/\\s+/g, '_');
    const val = values[i][1];
    if (key) meta[key] = val === null || val === undefined ? '' : String(val);
  }
  return meta;
}`;
