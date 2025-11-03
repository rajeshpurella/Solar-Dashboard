import React from "react";
import * as XLSX from "xlsx";

export default function ExportButtons({ openMeteo, forecastData, nasaParsed }) {
  async function exportExcel() {
    const wb = XLSX.utils.book_new();

    if (openMeteo && openMeteo.hourly) {
      const time = openMeteo.hourly.time || [];
      const temp = openMeteo.hourly.temperature_2m || [];
      const sw = openMeteo.hourly.shortwave_radiation || [];
      const dr = openMeteo.hourly.direct_radiation || [];
      const df = openMeteo.hourly.diffuse_radiation || [];
      const rows = [["time", "temperature_2m", "shortwave_radiation", "direct_radiation", "diffuse_radiation"]];
      for (let i = 0; i < time.length; i++) {
        rows.push([time[i], temp[i] ?? null, sw[i] ?? null, dr[i] ?? null, df[i] ?? null]);
      }
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "OpenMeteo");
    }

    if (nasaParsed && nasaParsed.labels) {
      const rows = [["time", "GHI", "Temp"]];
      for (let i = 0; i < nasaParsed.labels.length; i++) {
        rows.push([nasaParsed.labels[i], nasaParsed.ghi[i] ?? null, nasaParsed.temp[i] ?? null]);
      }
      const ws2 = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws2, "NASA_POWER");
    }

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solar_report.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    // dynamic import to avoid bundler issues
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const el = document.getElementById("report-area");
    if (!el) return alert("Report area not found on page.");

    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const ratio = canvas.width / canvas.height;
    const height = pageWidth / ratio;
    doc.addImage(imgData, "PNG", 20, 20, pageWidth - 40, height);
    doc.save("solar_report.pdf");
  }

  return (
    <div className="footer-export d-flex align-items-center">
      <button className="btn btn-success me-2" onClick={exportExcel}>Export Excel</button>
      <button className="btn btn-danger" onClick={exportPDF}>Export PDF</button>
    </div>
  );
}
