const API_BASE = import.meta.env.VITE_API_BASE || "https://solar-backend-0wcy.onrender.com";

/** Open-Meteo via server proxy */
export async function fetchOpenMeteo(lat = 17.4346, lon = 78.6552, past_days = 7) {
  const url = `${API_BASE}/api/openmeteo?lat=${lat}&lon=${lon}&past_days=${past_days}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Open-Meteo fetch failed: " + resp.status);
  return await resp.json();
}

/** Forecast via proxy (server handles forecast_days) */
export async function fetchForecast(lat = 17.4346, lon = 78.6552, days = 7) {
  const url = `${API_BASE}/api/forecast?lat=${lat}&lon=${lon}&days=${days}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Forecast fetch failed: " + resp.status);
  return await resp.json();
}

/** NASA POWER parser (robust) */
export async function fetchNasaPower(lat = 17.4346, lon = 78.6552, start, end, timeStandard = "LST") {
  if (!start || !end) throw new Error("start and end required for NASA POWER (YYYYMMDD)");
  const params = new URLSearchParams({ lat, lon, start, end, "time-standard": timeStandard });
  const url = `${API_BASE}/api/nasapower?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("NASA POWER fetch failed: " + resp.status);
  const json = await resp.json();

  try {
    if (json.outputs && json.outputs.hourly) {
      const h = json.outputs.hourly;
      const labels = h.time || h.datetime || Object.keys(h.ALLSKY_SFC_SW_DWN || {});
      const ghi = h.ALLSKY_SFC_SW_DWN || h.ALLSKY_SFC_SW || [];
      const temp = h.T2M || h.TEMP2M || [];
      return { labels, ghi, temp };
    }

    if (json.properties && json.properties.parameter) {
      const p = json.properties.parameter;
      const ghiObj = p.ALLSKY_SFC_SW_DWN || p.ALLSKY_SFC_SW || null;
      const tObj = p.T2M || p.TEMP2M || null;
      if (ghiObj && typeof ghiObj === "object") {
        const labels = Object.keys(ghiObj).sort();
        const ghi = labels.map(k => (ghiObj[k] !== undefined ? ghiObj[k] : null));
        const temp = labels.map(k => (tObj && tObj[k] !== undefined ? tObj[k] : null));
        return { labels, ghi, temp };
      }
    }

    if (json.parameters && json.parameters.ALLSKY_SFC_SW_DWN) {
      const p = json.parameters;
      const labels = Object.keys(p.ALLSKY_SFC_SW_DWN).sort();
      const ghi = labels.map(k => p.ALLSKY_SFC_SW_DWN[k]);
      const temp = p.T2M ? labels.map(k => p.T2M[k]) : labels.map(() => null);
      return { labels, ghi, temp };
    }
  } catch (e) {
    console.warn("NASA parse error:", e);
  }

  return { labels: [], ghi: [], temp: [] };
}
