/**
 * Konfigurasi Dashboard TimSalesJuara
 * ------------------------------------
 * 1. Deploy Google Apps Script sebagai Web App
 * 2. Paste URL deployment di bawah (akhiran biasanya /exec)
 * 3. Simpan file ini di folder yang sama dengan index.html
 *
 * Contoh URL:
 * https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec
 *
 * Jika API_URL kosong, dashboard memakai data contoh (demo mode).
 */
window.TSJ_CONFIG = {
  // Ganti dengan URL Web App Google Apps Script Anda
  API_URL: '',

  // action query: 'all' mengambil semua sheet sekaligus
  API_ACTION: 'all',

  // Interval refresh otomatis (ms). 0 = nonaktif. Contoh: 5 menit = 300000
  REFRESH_MS: 0,

  // Tampilkan badge "Live" / "Demo"
  SHOW_DATA_SOURCE: true
};
