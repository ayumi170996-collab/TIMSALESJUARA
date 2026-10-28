/**
 * ============================================================
 * TimSalesJuara — Google Apps Script API untuk Dashboard
 * ============================================================
 *
 * CARA PASANG:
 * 1. Buat Google Spreadsheet baru (atau pakai yang sudah ada)
 * 2. Buat sheet dengan nama sesuai di bawah (KPI, Pilar, Klien, Pipeline, dll)
 * 3. Extensions → Apps Script → paste seluruh kode ini
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (atau Anyone with Google account)
 * 5. Copy URL deployment → tempel di config.js dashboard
 *
 * Struktur sheet yang dibaca:
 * - KPI          : label | value | sub
 * - Pilar        : nama | target | aktual
 * - Klien        : nama | stage | leads | meeting | revenue_jt | pct_target | owner | risiko
 * - Pipeline     : nama | stage | nilai_jt | prob | expected_jt
 * - Ownership    : klien | session_bgm
 * - Weekly       : minggu | proposal | discovery | meeting | leads | revenue_jt
 * - Issue        : issue | area | impact | next_action | owner | deadline | status
 * - Meta         : key | value  (periode, status_overall)
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

    return jsonResponse_(payload);
  } catch (err) {
    return jsonResponse_({ error: String(err), stack: err.stack });
  }
}

/** Baca sheet: baris 1 = header, data mulai baris 2 */
function readSheetAsObjects_(ss, sheetName, fields) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(function (h) {
    return String(h).trim().toLowerCase().replace(/\s+/g, '_');
  });

  const rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row.every(function (c) { return c === '' || c === null; })) continue;

    var obj = {};
    fields.forEach(function (field) {
      var idx = headers.indexOf(field);
      if (idx === -1) {
        // coba cocokkan tanpa underscore
        idx = headers.indexOf(field.replace(/_/g, ' '));
      }
      var val = idx >= 0 ? row[idx] : '';
      // angka
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
  for (var i = 0; i < values.length; i++) {
    var key = String(values[i][0] || '').trim().toLowerCase().replace(/\s+/g, '_');
    var val = values[i][1];
    if (key) meta[key] = val === null || val === undefined ? '' : String(val);
  }
  return meta;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Optional: test di editor Apps Script */
function testDoGet() {
  const result = doGet({ parameter: { action: 'all' } });
  Logger.log(result.getContent());
}
