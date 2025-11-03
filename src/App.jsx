import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import ExportButtons from "./components/ExportButtons.jsx";
import { fetchOpenMeteo, fetchNasaPower, fetchForecast } from "./services/api.js";

export default function App() {
  const [lat, setLat] = useState(17.4346);
  const [lon, setLon] = useState(78.6552);
  const [pastDays, setPastDays] = useState(7);
  const [mode, setMode] = useState("live"); // "live" or "forecast"
  const [loading, setLoading] = useState(false);

  const [openMeteo, setOpenMeteo] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [nasaParsed, setNasaParsed] = useState(null);
  const [nasaRaw, setNasaRaw] = useState(null);

  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function formatYYYYMMDD(d) {
    return d.toISOString().split("T")[0].replace(/-/g, "");
  }

  async function loadLive(latitude = lat, longitude = lon, pd = pastDays) {
    setLoading(true);
    try {
      const open = await fetchOpenMeteo(latitude, longitude, pd);
      setOpenMeteo(open);

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - pd);
      const startStr = formatYYYYMMDD(start);
      const endStr = formatYYYYMMDD(end);

      const nasa = await fetchNasaPower(latitude, longitude, startStr, endStr, "LST");
      setNasaParsed(nasa);
      // keep raw only if you want to inspect
      // setNasaRaw(nasaRawResponse);
    } catch (err) {
      console.error("LoadLive error:", err);
      
    } finally {
      setLoading(false);
    }
  }

  async function loadForecast(latitude = lat, longitude = lon, days = pastDays) {
    setLoading(true);
    try {
      const forecast = await fetchForecast(latitude, longitude, days);
      setForecastData(forecast);
    } catch (err) {
      console.error("loadForecast err:", err);
      alert("Error fetching forecast data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <header className="app-header d-flex justify-content-between align-items-start">
        <div>
          <h1 className="app-title">☀️ Solar & Weather Live Dashboard</h1>
          <div className="app-subtitle">Real-time Solar & Weather monitoring</div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div>
            <div className="btn-group" role="group" aria-label="mode">
              <button
                className={`btn ${mode === "live" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setMode("live")}
              >
                Live
              </button>
              <button
                className={`btn ${mode === "forecast" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setMode("forecast")}
              >
                Forecast
              </button>
            </div>
          </div>

          <div>
            <button className="btn btn-outline-secondary" onClick={() => setDark(!dark)}>
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          <div>
            <ExportButtons
              openMeteo={openMeteo}
              forecastData={forecastData}
              nasaParsed={nasaParsed}
            />
          </div>
        </div>
      </header>

      <Dashboard
        lat={lat}
        setLat={setLat}
        lon={lon}
        setLon={setLon}
        pastDays={pastDays}
        setPastDays={setPastDays}
        onFetch={() => (mode === "live" ? loadLive() : loadForecast())}
        loading={loading}
        mode={mode}
        openMeteo={openMeteo}
        forecastData={forecastData}
        nasaParsed={nasaParsed}
        nasaRaw={nasaRaw}
      />
    </div>
  );
}
