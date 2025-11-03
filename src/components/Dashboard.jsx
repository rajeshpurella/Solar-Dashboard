import React from "react";
import ChartCard from "./ChartCard.jsx";

export default function Dashboard({
  lat,
  setLat,
  lon,
  setLon,
  pastDays,
  setPastDays,
  onFetch,
  loading,
  mode,
  openMeteo,
  forecastData,
  nasaParsed,
  nasaRaw,
}) {
  return (
    <>
      <div className="card controls-card p-3 mb-4">
        <div className="row align-items-end g-2">
          <div className="col-12 col-md-3">
            <div className="field control-lat p-2 rounded">
              <label className="form-label mb-1">📍 Latitude</label>
              <input className="form-control" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="field control-lon p-2 rounded">
              <label className="form-label mb-1">🧭 Longitude</label>
              <input className="form-control" value={lon} onChange={(e) => setLon(Number(e.target.value))} />
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="field control-days p-2 rounded">
              <label className="form-label mb-1">📅 Days (past or forecast)</label>
              <select className="form-select" value={pastDays} onChange={(e) => setPastDays(Number(e.target.value))}>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={7}>7</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-4 d-grid">
            <div className="field p-2 rounded">
              <button className="btn btn-primary w-100" onClick={onFetch} disabled={loading}>
                {loading ? "Fetching…" : mode === "live" ? "Fetch Live Data" : "Fetch Forecast"}
              </button>
            </div>
          </div>
        </div>

        
      </div>

      <div id="report-area">
        {loading && <div className="card p-3 mb-3">Loading…</div>}

        {/* LIVE */}
        {mode === "live" && openMeteo && openMeteo.hourly && (
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <ChartCard title="Temperature (°C)" labels={openMeteo.hourly.time} values={openMeteo.hourly.temperature_2m} yLabel="°C" headerColor="bg-info" icon="🌡️" />
            </div>

            <div className="col-12 col-lg-6">
              <ChartCard title="Shortwave Radiation (W/m²)" labels={openMeteo.hourly.time} values={openMeteo.hourly.shortwave_radiation} yLabel="W/m²" headerColor="bg-primary" icon="☀️" />
            </div>

            <div className="col-12 col-lg-6">
              <ChartCard title="Direct Radiation (W/m²)" labels={openMeteo.hourly.time} values={openMeteo.hourly.direct_radiation} yLabel="W/m²" headerColor="bg-warning" icon="⚡" />
            </div>

            <div className="col-12 col-lg-6">
              <ChartCard title="Diffuse Radiation (W/m²)" labels={openMeteo.hourly.time} values={openMeteo.hourly.diffuse_radiation} yLabel="W/m²" headerColor="bg-success" icon="🌤️" />
            </div>
          </div>
        )}

        {/* FORECAST */}
        {mode === "forecast" && forecastData && forecastData.hourly && (
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <ChartCard title="Forecast — Temperature (°C)" labels={forecastData.hourly.time} values={forecastData.hourly.temperature_2m} yLabel="°C" headerColor="bg-info" icon="🌡️" />
            </div>
            <div className="col-12 col-lg-6">
              <ChartCard title="Forecast — Shortwave Radiation (W/m²)" labels={forecastData.hourly.time} values={forecastData.hourly.shortwave_radiation} yLabel="W/m²" headerColor="bg-primary" icon="☀️" />
            </div>
          </div>
        )}

        {/* NASA */}
        {mode === "live" && nasaParsed && nasaParsed.labels && (
          <div className="row g-3 mt-4">
            <div className="col-12 col-lg-6">
              <ChartCard title="NASA POWER — GHI (W/m²)" labels={nasaParsed.labels} values={nasaParsed.ghi} yLabel="W/m²" headerColor="bg-secondary" icon="🔆" />
            </div>
            <div className="col-12 col-lg-6">
              <ChartCard title="NASA POWER — Temp (°C)" labels={nasaParsed.labels} values={nasaParsed.temp} yLabel="°C" headerColor="bg-dark" icon="🌡️" />
            </div>
          </div>
        )}

        {mode === "live" && !nasaParsed && nasaRaw && (
          <div className="card p-3 mt-4">
            <h6>NASA POWER raw response (couldn't parse)</h6>
            <pre style={{ maxHeight: 240, overflow: "auto" }}>{JSON.stringify(nasaRaw, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  );
}
