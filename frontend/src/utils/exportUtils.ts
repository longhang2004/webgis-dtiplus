import { DTIRecord, Pillar, Year, RegionId } from '../types';
import { REGION_META } from '../data/region-meta';
import { getDTIColor, getDTIColorLabel } from './colorScale';
import { getDTIForYear } from '../data/dti-data';
import i18n from '../i18n';
import regionsGeoJSON from '../data/geojson/vietnam-regions.geojson';
import islandsGeoJSON from '../data/geojson/vietnam-islands.geojson';

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

const TILE_SIZE = 256;
type Point = { x: number; y: number };
type GeoBounds = { minLng: number; minLat: number; maxLng: number; maxLat: number };

function project(lng: number, lat: number, zoom: number): Point {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const worldSize = TILE_SIZE * 2 ** zoom;
  return {
    x: ((lng + 180) / 360) * worldSize,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * worldSize,
  };
}

function extendGeoBounds(bounds: GeoBounds, coords: GeoJSON.Position | GeoJSON.Position[][] | GeoJSON.Position[][][]): void {
  if (typeof coords[0] === 'number') {
    const [lng, lat] = coords as GeoJSON.Position;
    bounds.minLng = Math.min(bounds.minLng, lng);
    bounds.maxLng = Math.max(bounds.maxLng, lng);
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    return;
  }

  (coords as Array<GeoJSON.Position | GeoJSON.Position[][]>).forEach((child) => {
    extendGeoBounds(bounds, child as GeoJSON.Position | GeoJSON.Position[][] | GeoJSON.Position[][][]);
  });
}

function getVietnamGeoBounds(): GeoBounds {
  const bounds: GeoBounds = {
    minLng: Infinity,
    minLat: Infinity,
    maxLng: -Infinity,
    maxLat: -Infinity,
  };

  (regionsGeoJSON as GeoJSON.FeatureCollection).features.forEach((feature) => {
    if (feature.geometry?.type === 'MultiPolygon' || feature.geometry?.type === 'Polygon') {
      extendGeoBounds(bounds, feature.geometry.coordinates);
    }
  });

  return bounds;
}

function getFeaturePolygons(feature: GeoJSON.Feature): GeoJSON.Position[][][] {
  if (feature.geometry?.type === 'Polygon') {
    return [feature.geometry.coordinates as GeoJSON.Position[][]];
  }
  if (feature.geometry?.type === 'MultiPolygon') {
    return feature.geometry.coordinates as GeoJSON.Position[][][];
  }
  return [];
}

function getExportViewport(width: number, height: number): { zoom: number; center: Point } {
  const bounds = getVietnamGeoBounds();
  const sw0 = project(bounds.minLng, bounds.minLat, 0);
  const ne0 = project(bounds.maxLng, bounds.maxLat, 0);
  const boundsWidth0 = Math.abs(ne0.x - sw0.x);
  const boundsHeight0 = Math.abs(sw0.y - ne0.y);
  const paddingX = width * 0.30;
  const paddingY = height * 0.08;
  const zoom = Math.min(
    Math.log2((width - paddingX * 2) / boundsWidth0),
    Math.log2((height - paddingY * 2) / boundsHeight0),
  );

  const sw = project(bounds.minLng, bounds.minLat, zoom);
  const ne = project(bounds.maxLng, bounds.maxLat, zoom);
  return {
    zoom,
    center: {
      x: (sw.x + ne.x) / 2,
      y: (sw.y + ne.y) / 2,
    },
  };
}

function loadTile(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function drawOSMTiles(ctx: CanvasRenderingContext2D, width: number, height: number, zoom: number, center: Point): Promise<void> {
  const tileZoom = Math.max(0, Math.floor(zoom));
  const scale = 2 ** (zoom - tileZoom);
  const tileDisplaySize = TILE_SIZE * scale;
  const centerAtTileZoom = {
    x: center.x / 2 ** (zoom - tileZoom),
    y: center.y / 2 ** (zoom - tileZoom),
  };
  const topLeft = {
    x: centerAtTileZoom.x - width / (2 * scale),
    y: centerAtTileZoom.y - height / (2 * scale),
  };
  const minTileX = Math.floor(topLeft.x / TILE_SIZE) - 1;
  const maxTileX = Math.ceil((topLeft.x + width / scale) / TILE_SIZE) + 1;
  const minTileY = Math.floor(topLeft.y / TILE_SIZE) - 1;
  const maxTileY = Math.ceil((topLeft.y + height / scale) / TILE_SIZE) + 1;
  const tileCount = 2 ** tileZoom;
  const tasks: Promise<void>[] = [];

  for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      if (tileY < 0 || tileY >= tileCount) continue;
      const wrappedX = ((tileX % tileCount) + tileCount) % tileCount;
      const url = `https://tile.openstreetmap.org/${tileZoom}/${wrappedX}/${tileY}.png`;
      tasks.push(loadTile(url).then((image) => {
        if (!image) return;
        const x = (tileX * TILE_SIZE - topLeft.x) * scale;
        const y = (tileY * TILE_SIZE - topLeft.y) * scale;
        ctx.drawImage(image, x, y, tileDisplaySize, tileDisplaySize);
      }));
    }
  }

  await Promise.all(tasks);
}

function drawRegionPath(
  ctx: CanvasRenderingContext2D,
  feature: GeoJSON.Feature,
  zoom: number,
  center: Point,
  width: number,
  height: number,
): void {
  const toCanvas = ([lng, lat]: GeoJSON.Position): Point => {
    const projected = project(lng, lat, zoom);
    return {
      x: width / 2 + (projected.x - center.x),
      y: height / 2 + (projected.y - center.y),
    };
  };

  getFeaturePolygons(feature).forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach((position, index) => {
        const point = toCanvas(position);
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
    });
  });
}

async function createIslandInsetCanvas(darkMode: boolean): Promise<HTMLCanvasElement> {
  const width = 460;
  const height = 320;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const bg = darkMode ? '#070e1c' : '#e8edf2';
  const panelBg = darkMode ? '#0c1628' : '#ffffff';
  const border = darkMode ? '#1a2d4d' : '#d1d9e6';
  const text = darkMode ? '#e2eaff' : '#1a2436';
  const accent = darkMode ? '#00d4aa' : '#00997a';
  const insetZoom = 4.25;
  const center = project(113.15, 13.55, insetZoom);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.32;
  await drawOSMTiles(ctx, width, height, insetZoom, center);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  ctx.fillStyle = panelBg;
  ctx.globalAlpha = 0.9;
  roundRect(ctx, 16, height - 46, 222, 30, 8);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.font = 'bold 22px -apple-system, "Segoe UI", sans-serif';
  ctx.fillText('Hoàng Sa · Trường Sa', 28, height - 24);

  const features = (islandsGeoJSON as GeoJSON.FeatureCollection).features;
  features.forEach((feature) => {
    if (feature.geometry?.type !== 'Point') return;
    const [lng, lat] = feature.geometry.coordinates;
    const point = project(lng, lat, insetZoom);
    const x = width / 2 + (point.x - center.x);
    const y = height / 2 + (point.y - center.y);
    const label = i18n.language === 'en'
      ? String(feature.properties?.name_en ?? feature.properties?.name ?? '')
      : String(feature.properties?.name ?? '');

    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = 'bold 20px -apple-system, "Segoe UI", sans-serif';
    const labelWidth = ctx.measureText(label).width;
    roundRect(ctx, x + 15, y - 18, labelWidth + 18, 28, 7);
    ctx.fillStyle = panelBg;
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = text;
    ctx.fillText(label, x + 24, y + 3);
  });

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

async function createExportMapCanvas(
  sourceElement: HTMLElement,
  records: DTIRecord[],
  pillar: Pillar,
  selectedRegion: RegionId | null,
  bg: string,
): Promise<HTMLCanvasElement> {
  const sourceRect = sourceElement.getBoundingClientRect();
  const width = Math.max(320, Math.round((sourceRect.width || sourceElement.clientWidth || 1040) * 2));
  const height = Math.max(320, Math.round((sourceRect.height || sourceElement.clientHeight || 798) * 2));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const viewport = getExportViewport(width, height);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.15;
  await drawOSMTiles(ctx, width, height, viewport.zoom, viewport.center);
  ctx.globalAlpha = 1;

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
    drawRegionPath(ctx, feature, viewport.zoom, viewport.center, width, height);
    ctx.fillStyle = getDTIColor(value);
    ctx.globalAlpha = isSelected ? 0.96 : 0.85;
    ctx.fill('evenodd');
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = isSelected ? 7 : 3.2;
    ctx.stroke();
  });

  ctx.restore();

  const inset = await createIslandInsetCanvas(bg === '#070e1c');
  const insetX = 32;
  const insetY = 32;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 8;
  ctx.drawImage(inset, insetX, insetY);
  ctx.restore();

  return canvas;
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
