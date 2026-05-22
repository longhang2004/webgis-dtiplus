import L from 'leaflet';
import { DTIRecord, Pillar, Year, RegionId } from '../types';
import { REGION_META } from '../data/region-meta';
import { getDTIColor, getDTIColorLabel } from './colorScale';
import { getDTIForYear } from '../data/dti-data';
import { getMapInstance } from '../store/appStore';
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

type Coordinate = [number, number];
type Bounds = { minLng: number; minLat: number; maxLng: number; maxLat: number };
const VIETNAM_LEAFLET_BOUNDS = L.geoJSON(regionsGeoJSON as GeoJSON.FeatureCollection).getBounds();

function waitForMap(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hideMapOverlays(mapElement: HTMLElement): () => void {
  const selectors = [
    '.leaflet-overlay-pane',
    '.leaflet-marker-pane',
    '.leaflet-tooltip-pane',
    '.leaflet-popup-pane',
    '.leaflet-control-container',
  ];
  const elements = selectors.flatMap((selector) => Array.from(mapElement.querySelectorAll<HTMLElement>(selector)));
  const previous = elements.map((element) => ({
    element,
    visibility: element.style.visibility,
  }));

  elements.forEach(({ style }) => {
    style.visibility = 'hidden';
  });

  return () => {
    previous.forEach(({ element, visibility }) => {
      element.style.visibility = visibility;
    });
  };
}

function extendBounds(bounds: Bounds, coords: GeoJSON.Position | GeoJSON.Position[][] | GeoJSON.Position[][][]): void {
  if (typeof coords[0] === 'number') {
    const [lng, lat] = coords as GeoJSON.Position;
    bounds.minLng = Math.min(bounds.minLng, lng);
    bounds.maxLng = Math.max(bounds.maxLng, lng);
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    return;
  }

  (coords as Array<GeoJSON.Position | GeoJSON.Position[][]>).forEach((child) => {
    extendBounds(bounds, child as GeoJSON.Position | GeoJSON.Position[][] | GeoJSON.Position[][][]);
  });
}

function getVietnamBounds(): Bounds {
  const bounds: Bounds = {
    minLng: Infinity,
    minLat: Infinity,
    maxLng: -Infinity,
    maxLat: -Infinity,
  };

  (regionsGeoJSON as GeoJSON.FeatureCollection).features.forEach((feature) => {
    if (feature.geometry?.type === 'MultiPolygon' || feature.geometry?.type === 'Polygon') {
      extendBounds(bounds, feature.geometry.coordinates);
    }
  });

  return bounds;
}

function getFeaturePolygons(feature: GeoJSON.Feature): Coordinate[][][] {
  if (feature.geometry?.type === 'Polygon') {
    return [feature.geometry.coordinates as Coordinate[][]];
  }
  if (feature.geometry?.type === 'MultiPolygon') {
    return feature.geometry.coordinates as Coordinate[][][];
  }
  return [];
}

function drawVietnamMap(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  records: DTIRecord[],
  pillar: Pillar,
  selectedRegion: RegionId | null,
  colors: { stroke: string; accent: string },
): void {
  const bounds = getVietnamBounds();
  const lngSpan = bounds.maxLng - bounds.minLng;
  const latSpan = bounds.maxLat - bounds.minLat;
  const padding = Math.min(rect.width * 0.08, rect.height * 0.045, 72);
  const scale = Math.min(
    (rect.width - padding * 2) / lngSpan,
    (rect.height - padding * 2) / latSpan,
  );
  const mapWidth = lngSpan * scale;
  const mapHeight = latSpan * scale;
  const offsetX = rect.x + (rect.width - mapWidth) / 2;
  const offsetY = rect.y + (rect.height - mapHeight) / 2;

  const project = ([lng, lat]: Coordinate) => ({
    x: offsetX + (lng - bounds.minLng) * scale,
    y: offsetY + (bounds.maxLat - lat) * scale,
  });

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  (regionsGeoJSON as GeoJSON.FeatureCollection).features.forEach((feature) => {
    const regionId = feature.properties?.region_id as RegionId | undefined;
    if (!regionId) return;

    const record = records.find((item) => item.regionId === regionId);
    const value = record?.[pillar] ?? 0;
    const isSelected = regionId === selectedRegion;

    ctx.beginPath();
    getFeaturePolygons(feature).forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach((point, index) => {
          const projected = project(point);
          if (index === 0) ctx.moveTo(projected.x, projected.y);
          else ctx.lineTo(projected.x, projected.y);
        });
        ctx.closePath();
      });
    });

    ctx.fillStyle = getDTIColor(value);
    ctx.globalAlpha = isSelected ? 1 : 0.94;
    ctx.fill('evenodd');
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = isSelected ? 3.5 : 2.4;
    ctx.stroke();
  });

  if (selectedRegion) {
    const selectedFeature = (regionsGeoJSON as GeoJSON.FeatureCollection).features.find(
      (feature) => feature.properties?.region_id === selectedRegion,
    );

    if (selectedFeature) {
      ctx.beginPath();
      getFeaturePolygons(selectedFeature).forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach((point, index) => {
            const projected = project(point);
            if (index === 0) ctx.moveTo(projected.x, projected.y);
            else ctx.lineTo(projected.x, projected.y);
          });
          ctx.closePath();
        });
      });
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
  }

  ctx.restore();
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

  const map = getMapInstance();
  let savedCenter: L.LatLng | null = null;
  let savedZoom: number | null = null;

  if (map) {
    savedCenter = map.getCenter();
    savedZoom = map.getZoom();
    map.fitBounds(VIETNAM_LEAFLET_BOUNDS, { animate: false, padding: [48, 48] });
    await waitForMap(1000);
  }

  let mapCanvas: HTMLCanvasElement | null = null;
  const restoreOverlays = hideMapOverlays(mapElement);
  try {
    mapCanvas = await html2canvas(mapElement, {
      backgroundColor: bg,
      useCORS: true,
      scale: 2,
      logging: false,
      removeContainer: true,
    });
  } finally {
    restoreOverlays();
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
  const mapRect = mapElement.getBoundingClientRect();
  const mapW = mapCanvas?.width ?? Math.max(1, Math.round(mapRect.width * 2));
  const mapH = mapCanvas?.height ?? Math.max(1, Math.round(mapRect.height * 2));
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

  drawVietnamMap(
    ctx,
    { x: 0, y: mapY, width: mapW, height: mapH },
    records,
    pillar,
    selectedRegion,
    { stroke: '#ffffff', accent },
  );

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
