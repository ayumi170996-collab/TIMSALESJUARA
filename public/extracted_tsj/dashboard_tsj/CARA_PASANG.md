# Integrasi Google Sheets → Dashboard TimSalesJuara

## Arsitektur singkat

```
Google Spreadsheet (data Anda)
        ↓
Google Apps Script (Web App)  ←  API JSON
        ↓
index.html + config.js        ←  Dashboard di browser
```

Tidak perlu server backend. Data diubah di Sheets → klik **Refresh** di dashboard (atau auto-refresh).

---

## Langkah 1 — Siapkan Spreadsheet

Buat Google Spreadsheet baru, lalu buat **8 sheet** dengan nama persis:

| Nama sheet   | Kolom header (baris 1) |
|--------------|------------------------|
| **Meta**     | `key` \| `value` |
| **KPI**      | `label` \| `value` \| `sub` |
| **Pilar**    | `nama` \| `target` \| `aktual` |
| **Klien**    | `nama` \| `stage` \| `leads` \| `meeting` \| `revenue_jt` \| `pct_target` \| `owner` \| `risiko` |
| **Pipeline** | `nama` \| `stage` \| `nilai_jt` \| `prob` \| `expected_jt` |
| **Ownership**| `klien` \| `session_bgm` |
| **Weekly**   | `minggu` \| `proposal` \| `discovery` \| `meeting` \| `leads` \| `revenue_jt` |
| **Issue**    | `issue` \| `area` \| `impact` \| `next_action` \| `owner` \| `deadline` \| `status` |

### Contoh isi Meta
| key | value |
|-----|-------|
| periode | Oktober 2026 |
| status_overall | On Track |

### Contoh isi Pilar
| nama | target | aktual |
|------|--------|--------|
| LEADS | 100 | 75 |
| MEETINGS | 20 | 14 |
| REVENUE | 150 | 95 |

> **REVENUE** dalam satuan **juta Rupiah** (150 = Rp 150 juta) agar skala grafik sebanding.

### Nilai status yang dikenali dashboard
- Stage klien: `Active`, `Onboarding`, `At Risk`, `Renewal`
- Risiko / Impact: `Low`, `Medium`, `High`
- Status issue: `Open`, `In Progress`, `Done`

---

## Langkah 2 — Pasang Apps Script

1. Di Spreadsheet → **Extensions** → **Apps Script**
2. Hapus kode default, paste isi file `google_apps_script.js`
3. Simpan (Ctrl+S)
4. **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (supaya dashboard bisa fetch tanpa login)
5. **Deploy** → salin **Web app URL** (berakhiran `/exec`)

---

## Langkah 3 — Hubungkan ke dashboard

1. Buka file `config.js`
2. Tempel URL:

```js
window.TSJ_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/XXXX/exec',
  API_ACTION: 'all',
  REFRESH_MS: 0,        // atau 300000 = auto refresh 5 menit
  SHOW_DATA_SOURCE: true
};
```

3. Buka `index.html` di browser
4. Badge harus berubah jadi **Live · Sheets**
5. Tombol **Refresh** memuat data terbaru dari Spreadsheet

Jika `API_URL` kosong, dashboard tetap jalan dengan **data demo**.

---

## Uji API manual

Buka URL Web App di browser:

```
https://script.google.com/macros/s/XXXX/exec?action=all
```

Harus muncul JSON. Jika error, cek nama sheet & header kolom.

---

## Tips operasional

| Ritme | Apa yang di-update di Sheets |
|-------|------------------------------|
| Setiap Senin | Weekly, Ownership, Issue, Klien |
| Setiap discovery / closing | Pipeline |
| Tanggal 1–3 | KPI, Pilar, Meta (periode) |

Satu orang (Anda / admin) isi Sheets → seluruh tim lihat dashboard yang sama.

---

## Keamanan

- Web App **Anyone** = siapa pun yang punya URL bisa baca data.
- Jangan taruh data sangat sensitif (gaji, kontrak rahasia) di sheet yang di-expose.
- Alternatif lebih aman: akses **Anyone with Google account** + host dashboard di domain internal, atau pakai service account + backend.

---

## File dalam paket

| File | Fungsi |
|------|--------|
| `index.html` | Dashboard website |
| `config.js` | URL API + pengaturan |
| `google_apps_script.js` | Kode untuk dipaste di Apps Script |
| `CARA_PASANG.md` | Panduan ini |
