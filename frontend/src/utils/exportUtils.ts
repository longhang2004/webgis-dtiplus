import L from 'leaflet';
import { DTIRecord, Pillar, Year, RegionId } from '../types';
import { REGION_META } from '../data/region-meta';
import { PILLAR_LABELS, getDTIColor, getDTIColorLabel } from './colorScale';
import { getDTIForYear } from '../data/dti-data';
import { getMapInstance } from '../store/appStore';

export function exportCSV(records: DTIRecord[], year: Year, pillar: Pillar): void {
  const header = ['Vùng', 'Tên vùng', 'Năm', 'DTI+ Tổng hợp', 'Chính quyền số', 'Kinh tế số', 'Xã hội số', 'Ước tính'];
  const rows = records.map((r) => [
    r.regionId,
    REGION_META[r.regionId]?.name ?? r.regionId,
    r.year,
    r.total,
    r.gov,
    r.econ,
    r.soc,
    r.isEstimate ? 'Có' : 'Không',
  ]);
  const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DTI_plus_${pillar}_${year}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ─── PNG Export ─────────────────────────────────────────────────── */

const VIETNAM_BOUNDS: [[number, number], [number, number]] = [[8.2, 101.5], [23.5, 110.5]];

/** Wait for the map to settle and tiles to render */
function waitForMap(_map: L.Map, ms = 1200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ExportOptions {
  year: Year;
  pillar: Pillar;
  selectedRegion: RegionId | null;
  darkMode: boolean;
}

export async function exportMapPNG(
  elementId: string,
  options: ExportOptions,
  filename?: string,
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const mapElement = document.getElementById(elementId);
  if (!mapElement) return;

  const { year, pillar, selectedRegion, darkMode } = options;

  // --- Theme colors ---
  const bg = darkMode ? '#070e1c' : '#f0f4f8';
  const panelBg = darkMode ? '#0c1628' : '#ffffff';
  const border = darkMode ? '#1a2d4d' : '#d1d9e6';
  const accent = darkMode ? '#00d4aa' : '#00997a';
  const text = darkMode ? '#e2eaff' : '#1a2436';
  const muted = darkMode ? '#6b80a8' : '#5c6b82';

  // --- Fit map to Vietnam bounds ---
  const map = getMapInstance();
  let savedCenter: L.LatLng | null = null;
  let savedZoom: number | null = null;

  if (map) {
    savedCenter = map.getCenter();
    savedZoom = map.getZoom();
    map.fitBounds(VIETNAM_BOUNDS, { animate: false, padding: [20, 20] });
    await waitForMap(map, 1000);
  }

  // --- Capture map ---
  let mapCanvas: HTMLCanvasElement;
  try {
    mapCanvas = await html2canvas(mapElement, {
      backgroundColor: bg,
      useCORS: true,
      scale: 2,
      logging: false,
      removeContainer: true,
    });
  } finally {
    // Restore original view
    if (map && savedCenter && savedZoom !== null) {
      map.setView(savedCenter, savedZoom, { animate: false });
    }
  }

  // --- Prepare data ---
  const records = getDTIForYear(year);
  const sortedRecords = [...records].sort((a, b) => b[pillar] - a[pillar]);
  const regionOrder: RegionId[] = ['DBSH', 'DNB', 'BTB', 'DBSCL', 'TDMNPB', 'TN'];
  const displayRecords = selectedRegion
    ? sortedRecords
    : regionOrder.map((id) => records.find((r) => r.regionId === id)!).filter(Boolean);

  // --- Compose final image ---
  const PANEL_WIDTH = 420;
  const HEADER_H = 64;
  const FOOTER_H = 36;
  const mapW = mapCanvas.width;
  const mapH = mapCanvas.height;
  const totalW = mapW + PANEL_WIDTH * 2; // Scale panel to match map DPI (scale: 2)
  const totalH = mapH + (HEADER_H + FOOTER_H) * 2;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;
  const s = 2; // retina scale factor

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, totalW, totalH);

  // --- Header ---
  ctx.fillStyle = panelBg;
  ctx.fillRect(0, 0, totalW, HEADER_H * s);
  ctx.fillStyle = border;
  ctx.fillRect(0, HEADER_H * s - 1, totalW, 1);

  ctx.fillStyle = accent;
  ctx.font = `bold ${20 * s}px -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText('WebGIS DTI+', 20 * s, 38 * s);

  ctx.fillStyle = muted;
  ctx.font = `${12 * s}px -apple-system, "Segoe UI", sans-serif`;
  const subtitle = `${PILLAR_LABELS[pillar]} — Năm ${year}${year === 2025 ? ' (ước tính)' : ''}`;
  ctx.fillText(subtitle, 200 * s, 38 * s);

  if (selectedRegion) {
    const meta = REGION_META[selectedRegion];
    ctx.fillStyle = accent;
    ctx.font = `${12 * s}px -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(`Vùng: ${meta?.name ?? selectedRegion}`, 200 * s, 54 * s);
  }

  // --- Map ---
  const mapY = HEADER_H * s;
  ctx.drawImage(mapCanvas, 0, mapY, mapW, mapH);

  // --- Side panel ---
  const panelX = mapW;
  const panelW = PANEL_WIDTH * s;
  ctx.fillStyle = panelBg;
  ctx.fillRect(panelX, mapY, panelW, mapH);
  ctx.fillStyle = border;
  ctx.fillRect(panelX, mapY, 1, mapH);

  // Panel title
  let py = mapY + 24 * s;
  ctx.fillStyle = accent;
  ctx.font = `bold ${14 * s}px -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText('Số liệu vùng kinh tế', panelX + 16 * s, py);
  py += 8 * s;

  // Separator
  py += 8 * s;
  ctx.fillStyle = border;
  ctx.fillRect(panelX + 16 * s, py, panelW - 32 * s, 1);
  py += 16 * s;

  // Column headers
  ctx.fillStyle = muted;
  ctx.font = `${10 * s}px -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText('Vùng', panelX + 16 * s, py);
  ctx.fillText('Tổng', panelX + 240 * s, py);
  ctx.fillText('CQS', panelX + 290 * s, py);
  ctx.fillText('KTS', panelX + 335 * s, py);
  ctx.fillText('XHS', panelX + 380 * s, py);
  py += 6 * s;

  ctx.fillStyle = border;
  ctx.fillRect(panelX + 16 * s, py, panelW - 32 * s, 1);
  py += 14 * s;

  // Region rows
  for (const rec of displayRecords) {
    const meta = REGION_META[rec.regionId];
    const isSelected = rec.regionId === selectedRegion;
    const color = getDTIColor(rec[pillar]);

    // Color indicator bar
    ctx.fillStyle = color;
    ctx.fillRect(panelX + 16 * s, py - 10 * s, 4 * s, 20 * s);

    // Region name
    ctx.fillStyle = isSelected ? accent : text;
    ctx.font = `${isSelected ? 'bold ' : ''}${11 * s}px -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(meta?.shortName ?? rec.regionId, panelX + 28 * s, py + 4 * s);

    // Level label
    const levelLabel = getDTIColorLabel(rec[pillar]);
    ctx.fillStyle = color;
    ctx.font = `${9 * s}px -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(levelLabel, panelX + 28 * s, py + 18 * s);

    // Values
    ctx.font = `${11 * s}px "SF Mono", "Fira Code", monospace`;
    ctx.fillStyle = isSelected ? accent : text;
    ctx.fillText(rec.total.toFixed(3), panelX + 236 * s, py + 4 * s);
    ctx.fillStyle = muted;
    ctx.fillText(rec.gov.toFixed(3), panelX + 286 * s, py + 4 * s);
    ctx.fillText(rec.econ.toFixed(3), panelX + 331 * s, py + 4 * s);
    ctx.fillText(rec.soc.toFixed(3), panelX + 376 * s, py + 4 * s);

    py += 40 * s;
  }

  // Separator after table
  py += 4 * s;
  ctx.fillStyle = border;
  ctx.fillRect(panelX + 16 * s, py, panelW - 32 * s, 1);
  py += 20 * s;

  // Summary stats
  const values = displayRecords.map((r) => r[pillar]);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const gap = max - min;

  ctx.fillStyle = muted;
  ctx.font = `${10 * s}px -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText('Thống kê tổng hợp', panelX + 16 * s, py);
  py += 20 * s;

  const stats = [
    { label: 'Trung bình', value: mean.toFixed(3) },
    { label: 'Cao nhất', value: `${max.toFixed(3)} (${REGION_META[displayRecords.find((r) => r[pillar] === max)?.regionId ?? '']?.shortName ?? ''})` },
    { label: 'Thấp nhất', value: `${min.toFixed(3)} (${REGION_META[displayRecords.find((r) => r[pillar] === min)?.regionId ?? '']?.shortName ?? ''})` },
    { label: 'Khoảng cách', value: gap.toFixed(3) },
  ];

  for (const stat of stats) {
    ctx.fillStyle = text;
    ctx.font = `${11 * s}px -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(stat.label, panelX + 24 * s, py);
    ctx.fillStyle = accent;
    ctx.font = `bold ${11 * s}px "SF Mono", "Fira Code", monospace`;
    ctx.fillText(stat.value, panelX + 140 * s, py);
    py += 22 * s;
  }

  // --- Legend at bottom of panel ---
  py += 16 * s;
  ctx.fillStyle = border;
  ctx.fillRect(panelX + 16 * s, py, panelW - 32 * s, 1);
  py += 20 * s;

  ctx.fillStyle = accent;
  ctx.font = `bold ${11 * s}px -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText('Chú giải', panelX + 16 * s, py);
  py += 18 * s;

  const legendItems = [
    { color: '#00d4aa', label: '> 0.70 — Rất cao' },
    { color: '#1ea06e', label: '0.60 – 0.70 — Cao' },
    { color: '#c8b91e', label: '0.50 – 0.60 — Trung bình' },
    { color: '#c8641e', label: '0.40 – 0.50 — Thấp' },
    { color: '#8b2323', label: '< 0.40 — Rất thấp' },
  ];

  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.fillRect(panelX + 20 * s, py - 8 * s, 14 * s, 14 * s);

    ctx.fillStyle = text;
    ctx.font = `${11 * s}px -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(item.label, panelX + 42 * s, py + 2 * s);
    py += 22 * s;
  }

  // --- Footer ---
  const footerY = mapY + mapH;
  ctx.fillStyle = panelBg;
  ctx.fillRect(0, footerY, totalW, FOOTER_H * s);
  ctx.fillStyle = border;
  ctx.fillRect(0, footerY, totalW, 1);

  ctx.fillStyle = muted;
  ctx.font = `${10 * s}px -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText(
    'WebGIS DTI+ — Phân hóa không gian phát triển số Việt Nam · Khoa Địa Lý - Đô Thị · ĐHKHXH&NV · ĐHQG TP.HCM',
    20 * s,
    footerY + 22 * s,
  );

  const dateStr = new Date().toLocaleDateString('vi-VN');
  ctx.fillText(`Xuất ngày: ${dateStr}`, totalW - 180 * s, footerY + 22 * s);

  // --- Download ---
  const finalFilename = filename ?? `DTI_plus_${pillar}_${year}${selectedRegion ? '_' + selectedRegion : ''}.png`;
  const link = document.createElement('a');
  link.download = finalFilename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
