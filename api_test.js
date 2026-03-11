// Fetch forecast and export to Excel hourly
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const cron = require('node-cron');

const url = 'https://api.open-meteo.com/v1/forecast'
  + '?latitude=11.218139426396124&longitude=123.77960983917383'
  + '&forecast_days=1&hourly=temperature_2m,wind_speed_10m';

async function fetchAndWriteExcel() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const times = data.hourly?.time || [];
    const temps = data.hourly?.temperature_2m || [];
    const winds = data.hourly?.wind_speed_10m || [];

    const workbook = new ExcelJS.Workbook();
    const sheetDate = (times[0]) ? (times[0].includes('T') ? times[0].split('T')[0] : new Date(times[0]).toISOString().slice(0,10)) : new Date().toISOString().slice(0,10);
    const sheetName = `forecast_${sheetDate}`; // e.g. forecast_2026-03-11
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = [
      { header: 'time', key: 'time', width: 25 },
      { header: 'temperature_2m', key: 'temp', width: 18 },
      { header: 'wind_speed_10m', key: 'wind', width: 18 }
    ];

    for (let i = 0; i < times.length; i++) {
      sheet.addRow({ time: times[i], temp: temps[i], wind: winds[i] });
    }

    const outDir = path.join(__dirname, '.dist');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    const fileDateUnderscore = sheetDate.replace(/-/g, '_');
    const filename = path.join(outDir, `forecast_${fileDateUnderscore}.xlsx`);
    const tmpFilename = filename + '.tmp';
    await workbook.xlsx.writeFile(tmpFilename);
    try {
      fs.renameSync(tmpFilename, filename);
    } catch (e) {
      // fallback: try unlink target then rename
      try {
        if (fs.existsSync(filename)) fs.unlinkSync(filename);
        fs.renameSync(tmpFilename, filename);
      } catch (err) {
        console.error('Failed to finalize file write:', err.message || err);
        // leave tmp file for inspection
      }
    }
    console.log('Wrote', filename);
  } catch (err) {
    console.error('Error fetching or writing Excel:', err.message || err);
  }
}

// Google Sheets integration removed; writing to local Excel only

if (require.main === module) {
  // run once immediately
  fetchAndWriteExcel();

  // schedule hourly at minute 0 (UTC)
  cron.schedule('0 * * * *', () => {
    console.log('Hourly job starting at', new Date().toISOString());
    fetchAndWriteExcel();
  }, { timezone: 'Etc/UTC' });
}

module.exports = { fetchAndWriteExcel };
