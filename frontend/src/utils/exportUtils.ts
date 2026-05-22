import L from 'leaflet';
import { DTIRecord, Pillar, Year, RegionId } from '../types';
import { REGION_META } from '../data/region-meta';
import { getDTIColor, getDTIColorLabel } from './colorScale';
import { getDTIForYear } from '../data/dti-data';
import i18n from '../i18n';
import regionsGeoJSON from '../data/geojson/vietnam-regions.geojson';

export function exportCSV(records: DTIRecord[], year: Year, pillar: Pillar): void {
  const header = [
    i18n.t('map.region_col'), 
    i18n.t('map.region_name_col'), 
    i18n.t('map.year_col'), 
    i18n.t('pillars.total'), 
    i18n.t('pillars.gov'), 
    i18n.t('pillars.econ'), 
    i18n.t('pillars.soc'), 
  ];
  const rows = records.map((r) => [
    r.regionId,
    i18n.t(`regions.${r.regionId}.name`, { defaultValue: REGION_META[r.regionId]?.name ?? r.regionId }),
    r.year,
    r.total,
    r.gov,
    r.econ,
    r.soc,
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

const VIETNAM_LEAFLET_BOUNDS = L.geoJSON(regionsGeoJSON as GeoJSON.FeatureCollection).getBounds();

function waitForMap(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForTileLayer(tileLayer: L.TileLayer, timeoutMs = 2200): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      tileLayer.off('load', finish);
      resolve();
    };

    tileLayer.on('load', finish);
    window.setTimeout(finish, timeoutMs);
  });
}

function getMapContentBounds(canvas: HTMLCanvasElement): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      if (a < 200) continue;

      const isChoroplethFill =
        (g > 90 && r > 80 && b < 95)
        || (r > 150 && g > 70 && b < 85)
        || (g > 125 && b < 170 && r < 95);
      const isWhiteBoundary = r > 210 && g > 210 && b > 210;

      if (isChoroplethFill || isWhiteBoundary) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0 || maxY < 0) return null;
  return { minX, minY, maxX, maxY };
}

function cropMapToContent(canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number, bg: string): HTMLCanvasElement {
  if (canvas.width <= targetWidth && canvas.height <= targetHeight) return canvas;

  const target = document.createElement('canvas');
  target.width = targetWidth;
  target.height = targetHeight;
  const ctx = target.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const bounds = getMapContentBounds(canvas);
  const cropX = bounds
    ? Math.min(
      Math.max(((bounds.minX + bounds.maxX) / 2) - targetWidth / 2, 0),
      Math.max(canvas.width - targetWidth, 0),
    )
    : Math.max((canvas.width - targetWidth) / 2, 0);
  const cropY = bounds
    ? Math.min(
      Math.max(((bounds.minY + bounds.maxY) / 2) - targetHeight / 2, 0),
      Math.max(canvas.height - targetHeight, 0),
    )
    : Math.max((canvas.height - targetHeight) / 2, 0);

  ctx.drawImage(
    canvas,
    cropX,
    cropY,
    Math.min(targetWidth, canvas.width),
    Math.min(targetHeight, canvas.height),
    0,
    0,
    Math.min(targetWidth, canvas.width),
    Math.min(targetHeight, canvas.height),
  );

  return target;
}

async function createExportMapCanvas(
  html2canvas: typeof import('html2canvas').default,
  sourceElement: HTMLElement,
  records: DTIRecord[],
  pillar: Pillar,
  selectedRegion: RegionId | null,
  bg: string,
): Promise<HTMLCanvasElement> {
  const sourceRect = sourceElement.getBoundingClientRect();
  const width = Math.max(320, Math.round(sourceRect.width || sourceElement.clientWidth || 1040));
  const height = Math.max(320, Math.round(sourceRect.height || sourceElement.clientHeight || 798));
  const renderWidth = Math.round(width * 1.75);
  const renderHeight = Math.round(height * 1.45);
  const tempElement = document.createElement('div');
  tempElement.style.position = 'fixed';
  tempElement.style.left = '0';
  tempElement.style.top = '0';
  tempElement.style.zIndex = '-1';
  tempElement.style.width = `${renderWidth}px`;
  tempElement.style.height = `${renderHeight}px`;
  tempElement.style.pointerEvents = 'none';
  tempElement.style.background = bg;
  document.body.appendChild(tempElement);

  const tempMap = L.map(tempElement, {
    attributionControl: false,
    center: [16.0, 105.8],
    fadeAnimation: false,
    markerZoomAnimation: false,
    minZoom: 0,
    preferCanvas: false,
    zoom: 6,
    zoomAnimation: false,
    zoomControl: false,
    zoomSnap: 0.1,
  });

  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    crossOrigin: true,
    opacity: 0.15,
  }).addTo(tempMap);

  L.geoJSON(regionsGeoJSON as GeoJSON.FeatureCollection, {
    style: (feature) => {
      const regionId = feature?.properties?.region_id as RegionId | undefined;
      const record = records.find((item) => item.regionId === regionId);
      const value = record?.[pillar] ?? 0;
      const isSelected = regionId === selectedRegion;

      return {
        color: '#ffffff',
        fillColor: getDTIColor(value),
        fillOpacity: isSelected ? 0.96 : 0.85,
        weight: isSelected ? 3.5 : 1.6,
      };
    },
  }).addTo(tempMap);

  tempMap.invalidateSize(false);
  tempMap.fitBounds(VIETNAM_LEAFLET_BOUNDS, { animate: false, padding: [80, 80] });
  tempMap.setZoom(Math.max(tempMap.getZoom() - 0.8, 0), { animate: false });
  await Promise.race([waitForTileLayer(tileLayer), waitForMap(2200)]);
  await waitForMap(250);

  try {
    const renderedCanvas = await html2canvas(tempElement, {
      backgroundColor: bg,
      useCORS: true,
      scale: 2,
      logging: false,
      removeContainer: true,
    });
    return cropMapToContent(renderedCanvas, width * 2, height * 2, bg);
  } finally {
    tempMap.remove();
    tempElement.remove();
  }
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

  // --- Prepare data ---
  const records = getDTIForYear(year);
  const sortedRecords = [...records].sort((a, b) => b[pillar] - a[pillar]);
  const regionOrder: RegionId[] = ['DBSH', 'DNB', 'BTB', 'DBSCL', 'TDMNPB', 'TN'];
  const displayRecords = selectedRegion
    ? sortedRecords
    : regionOrder.map((id) => records.find((r) => r.regionId === id)!).filter(Boolean);

  const mapCanvas = await createExportMapCanvas(
    html2canvas,
    mapElement,
    records,
    pillar,
    selectedRegion,
    bg,
  );

  // --- Compose final image ---
  const PANEL_WIDTH = 420;
  const HEADER_H = 64;
  const FOOTER_H = 36;
  const mapRect = mapElement.getBoundingClientRect();
  const mapW = mapCanvas.width || Math.max(1, Math.round(mapRect.width * 2));
  const mapH = mapCanvas.height || Math.max(1, Math.round(mapRect.height * 2));
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
  ctx.fillText(i18n.t('header.app_title'), 20 * s, 38 * s);

  ctx.fillStyle = muted;
  ctx.font = `${12 * s}px -apple-system, "Segoe UI", sans-serif`;
  const estText = year === 2025 ? ` (${i18n.t('map.estimate_col')})` : '';
  const subtitle = `${i18n.t(`pillars.${pillar}`)} — ${i18n.t('controls.year', { year })}${estText}`;
  ctx.fillText(subtitle, 200 * s, 38 * s);

  if (selectedRegion) {
    const meta = REGION_META[selectedRegion];
    ctx.fillStyle = accent;
    ctx.font = `${12 * s}px -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(`${i18n.t('map.region_prefix')}${i18n.t(`regions.${selectedRegion}.name`, { defaultValue: meta?.name ?? selectedRegion })}`, 200 * s, 54 * s);
  }

  // --- Map ---
  const mapY = HEADER_H * s;
  if (mapCanvas) {
    ctx.drawImage(mapCanvas, 0, mapY, mapW, mapH);
    ctx.fillStyle = darkMode ? 'rgba(7, 14, 28, 0.22)' : 'rgba(240, 244, 248, 0.16)';
    ctx.fillRect(0, mapY, mapW, mapH);
  } else {
    ctx.fillStyle = bg;
    ctx.fillRect(0, mapY, mapW, mapH);
  }

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
  ctx.fillText(i18n.t('map.region_data_title'), panelX + 16 * s, py);
  py += 8 * s;

  // Separator
  py += 8 * s;
  ctx.fillStyle = border;
  ctx.fillRect(panelX + 16 * s, py, panelW - 32 * s, 1);
  py += 16 * s;

  // Column headers
  ctx.fillStyle = muted;
  ctx.font = `${10 * s}px -apple-system, "Segoe UI", sans-serif`;
  ctx.fillText(i18n.t('map.region_col'), panelX + 16 * s, py);
  ctx.fillText(i18n.t('map.col_total'), panelX + 240 * s, py);
  ctx.fillText(i18n.t('map.col_gov'), panelX + 290 * s, py);
  ctx.fillText(i18n.t('map.col_econ'), panelX + 335 * s, py);
  ctx.fillText(i18n.t('map.col_soc'), panelX + 380 * s, py);
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
    ctx.fillText(i18n.t(`regions.${rec.regionId}.shortName`, { defaultValue: meta?.shortName ?? rec.regionId }), panelX + 28 * s, py + 4 * s);

    // Level label
    const levelLabelKey = getDTIColorLabel(rec[pillar]);
    const levelLabel = i18n.t(`color_labels.${levelLabelKey}`);
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
  ctx.fillText(i18n.t('panel.stats_title', { year: '', est: '' }).replace('—', '').trim(), panelX + 16 * s, py);
  py += 20 * s;

  const highestR = displayRecords.find((r) => r[pillar] === max)?.regionId;
  const lowestR = displayRecords.find((r) => r[pillar] === min)?.regionId;

  const stats = [
    { label: i18n.t('map.avg'), value: mean.toFixed(3) },
    { label: i18n.t('map.highest'), value: `${max.toFixed(3)} (${highestR ? i18n.t(`regions.${highestR}.shortName`) : ''})` },
    { label: i18n.t('map.lowest'), value: `${min.toFixed(3)} (${lowestR ? i18n.t(`regions.${lowestR}.shortName`) : ''})` },
    { label: i18n.t('map.range'), value: gap.toFixed(3) },
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
  ctx.fillText(i18n.t('map.legend_title'), panelX + 16 * s, py);
  py += 18 * s;

  const legendItems = [
    { color: '#00d4aa', label: `> 0.70 — ${i18n.t('color_labels.very_high')}` },
    { color: '#1ea06e', label: `0.60 – 0.70 — ${i18n.t('color_labels.high')}` },
    { color: '#c8b91e', label: `0.50 – 0.60 — ${i18n.t('color_labels.medium')}` },
    { color: '#c8641e', label: `0.40 – 0.50 — ${i18n.t('color_labels.low')}` },
    { color: '#8b2323', label: `< 0.40 — ${i18n.t('color_labels.very_low')}` },
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
    `${i18n.t('header.app_subtitle')} · ${i18n.t('header.department')}`,
    20 * s,
    footerY + 22 * s,
  );

  const lng = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const dateStr = new Date().toLocaleDateString(lng);
  ctx.fillText(`${i18n.t('map.exported_date')} ${dateStr}`, totalW - 180 * s, footerY + 22 * s);

  // --- Download ---
  const finalFilename = filename ?? `DTI_plus_${pillar}_${year}${selectedRegion ? '_' + selectedRegion : ''}.png`;
  const link = document.createElement('a');
  link.download = finalFilename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
