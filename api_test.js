//simple api test for open meteo in bantayan island

const url = 'https://api.open-meteo.com/v1/forecast'
  + '?latitude=11.218139426396124&longitude=123.77960983917383'
  + '&forecast_days=1&hourly=temperature_2m,wind_speed_10m';

(async () => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Request failed:', err.message || err);
    process.exitCode = 1;
  }
})();
