import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function fmtLabel(lbl) {
  if (!lbl && lbl !== 0) return "";
  if (lbl instanceof Date) {
    const mm = String(lbl.getMonth() + 1).padStart(2, "0");
    const dd = String(lbl.getDate()).padStart(2, "0");
    const hh = String(lbl.getHours()).padStart(2, "0");
    return `${mm}-${dd} ${hh}:00`;
  }
  if (typeof lbl === "string") {
    const digits = lbl.replace(/\D/g, "");
    if (/^\d{10}$/.test(digits) || /^\d{12}$/.test(digits)) {
      const year = digits.slice(0, 4);
      const month = digits.slice(4, 6);
      const day = digits.slice(6, 8);
      const hour = digits.length >= 10 ? digits.slice(8, 10) : "00";
      const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hour));
      if (!isNaN(d)) {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        return `${mm}-${dd} ${hh}:00`;
      }
    }
    const dt = new Date(lbl);
    if (!isNaN(dt)) {
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      const hh = String(dt.getHours()).padStart(2, "0");
      return `${mm}-${dd} ${hh}:00`;
    }
    return lbl;
  }
  return String(lbl);
}

export default function ChartCard({ title, labels = [], values = [], yLabel = "", headerColor = "bg-primary", icon = "" }) {
  const safeLabels = Array.isArray(labels) ? labels.map(fmtLabel) : [];
  const safeValues = Array.isArray(values) ? values.map(v => (v === null || v === undefined ? null : Number(v))) : [];

  const data = {
    labels: safeLabels,
    datasets: [
      {
        label: title,
        data: safeValues,
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 0,
        fill: yLabel.includes("W") ? true : false,
        backgroundColor: "rgba(0,123,255,0.12)",
        borderColor: "rgb(0,123,255)"
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
      y: { title: { display: !!yLabel, text: yLabel }, beginAtZero: true }
    }
  };

  return (
    <div className="card p-3 h-100">
      <div className={`metric-header ${headerColor} mb-2`} style={{ borderRadius: "8px 8px 0 0", padding: "0.6rem 1rem" }}>
        <div style={{ fontSize: 18, marginRight: 8 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{title}</div>
          {yLabel && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)" }}>{yLabel}</div>}
        </div>
      </div>

      <div style={{ height: 340 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
