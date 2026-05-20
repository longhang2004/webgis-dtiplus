import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { PathOptions, GeoJSON as LGeoJSON } from 'leaflet';
import { RegionId, Year, Pillar } from '../../types';
import { DTI_DATA, getDTIValue } from '../../data/dti-data';
import { getDTIColor } from '../../utils/colorScale';
import { REGION_META } from '../../data/region-meta';
import { getRanking } from '../../utils/statistics';
import regionsGeoJSON from '../../data/geojson/vietnam-regions.geojson';
import i18n from '../../i18n';

interface Props {
  year: Year;
  pillar: Pillar;
  selectedRegion: RegionId | null;
  onRegionClick: (id: RegionId | null) => void;
}

export default function ChoroplethLayer({ year, pillar, selectedRegion, onRegionClick }: Props) {
  const map = useMap();
  const layerRef = useRef<LGeoJSON | null>(null);
  const propsRef = useRef({ year, pillar, selectedRegion, onRegionClick });

  useEffect(() => {
    propsRef.current = { year, pillar, selectedRegion, onRegionClick };
  });

  const getStyle = (regionId: string, isSelected: boolean): PathOptions => {
    const value = getDTIValue(regionId as RegionId, propsRef.current.year, propsRef.current.pillar);
    return {
      fillColor: getDTIColor(value),
      weight: isSelected ? 3.5 : 1.6,
      color: '#ffffff',
      fillOpacity: isSelected ? 0.96 : 0.85,
    };
  };

  const buildMiniChart = (regionId: RegionId, activePillar: Pillar): string => {
    const series = DTI_DATA
      .filter((d) => d.regionId === regionId)
      .sort((a, b) => a.year - b.year)
      .map((d) => ({ year: d.year, value: d[activePillar] }));

    const width = 216;
    const height = 58;
    const padX = 8;
    const padY = 8;
    const values = series.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const points = series.map((d, idx) => {
      const x = padX + (idx / (series.length - 1)) * (width - padX * 2);
      const y = height - padY - ((d.value - min) / span) * (height - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend 2020-2025">
        <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="rgba(226,234,255,0.18)" />
        <polyline points="${points.join(' ')}" fill="none" stroke="#00d4aa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        ${series.map((d, idx) => {
          const [x, y] = points[idx].split(',');
          return `<circle cx="${x}" cy="${y}" r="${d.year === propsRef.current.year ? 3.5 : 2.4}" fill="${d.year === propsRef.current.year ? '#ffffff' : '#00d4aa'}" stroke="#00d4aa" stroke-width="1.5" />`;
        }).join('')}
      </svg>
    `;
  };

  const buildPopupContent = (regionId: RegionId): string => {
    const { year: activeYear, pillar: activePillar } = propsRef.current;
    const meta = REGION_META[regionId];
    const yearData = DTI_DATA.filter((d) => d.year === activeYear);
    const ranked = getRanking(yearData, activePillar);
    const rank = ranked.findIndex((r) => r.regionId === regionId) + 1;
    const total = getDTIValue(regionId, activeYear, 'total');
    const gov = getDTIValue(regionId, activeYear, 'gov');
    const econ = getDTIValue(regionId, activeYear, 'econ');
    const soc = getDTIValue(regionId, activeYear, 'soc');
    const value = getDTIValue(regionId, activeYear, activePillar);
    const color = getDTIColor(value);
    const regionName = i18n.t(`regions.${regionId}.name`, { defaultValue: meta?.name ?? regionId });

    return `
      <div class="webgis-region-popup">
        <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:10px;">
          <div>
            <div style="font-size:11px;color:var(--muted);font-weight:600;">${i18n.t('panel.selected_region')}</div>
            <div style="font-size:13px;color:var(--text);font-weight:700;line-height:1.25;max-width:168px;">${regionName}</div>
          </div>
          <div style="text-align:right;">
            <div style="font:700 22px 'SF Mono','Fira Code',monospace;color:${color};">${value.toFixed(3)}</div>
            <div style="font-size:11px;color:var(--muted);">${i18n.t('panel.rank', { rank })}</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--accent);font-weight:700;margin-bottom:6px;">${i18n.t(`pillars.${activePillar}`)} · ${activeYear}${activeYear === 2025 ? '*' : ''}</div>
        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:8px;">
          ${[
            [i18n.t('map.col_total'), total],
            [i18n.t('map.col_gov'), gov],
            [i18n.t('map.col_econ'), econ],
            [i18n.t('map.col_soc'), soc],
          ].map(([label, itemValue]) => `
            <div style="border:1px solid var(--border);border-radius:6px;padding:6px 5px;background:rgba(7,14,28,0.2);">
              <div style="font-size:9px;color:var(--muted);font-weight:700;">${label}</div>
              <div style="font:700 11px 'SF Mono','Fira Code',monospace;color:var(--text);">${Number(itemValue).toFixed(3)}</div>
            </div>
          `).join('')}
        </div>
        <div style="font-size:10px;color:var(--muted);font-weight:700;margin-bottom:2px;">${i18n.t('panel.trend_title')}</div>
        ${buildMiniChart(regionId, activePillar)}
      </div>
    `;
  };

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const geoLayer = L.geoJSON(regionsGeoJSON as GeoJSON.FeatureCollection, {
      style: (feature) => {
        const id = feature?.properties?.region_id ?? '';
        return getStyle(id, id === selectedRegion);
      },
      onEachFeature: (feature, layer) => {
        const regionId = feature.properties?.region_id as RegionId;
        const meta = REGION_META[regionId];

        // Bind tooltip using Leaflet's built-in API
        (layer as L.Path).bindTooltip(
          () => {
            const value = getDTIValue(regionId, propsRef.current.year, propsRef.current.pillar);
            const regionName = i18n.t(`regions.${regionId}.name`, { defaultValue: meta?.name ?? regionId });
            return `<strong style="color:#e2eaff">${regionName}</strong><br/>DTI+: <span style="color:#00d4aa;font-family:monospace;font-weight:600">${value.toFixed(3)}</span>`;
          },
          { sticky: true }
        );

        (layer as L.Path).bindPopup(() => buildPopupContent(regionId), {
          closeButton: true,
          maxWidth: 280,
          minWidth: 248,
        });

        layer.on('click', () => {
          propsRef.current.onRegionClick(regionId);
          (layer as L.Path).openPopup();
        });

        layer.on('mouseover', () => {
          (layer as L.Path).setStyle({ weight: 3, color: '#ffffff', fillOpacity: 1 });
        });

        layer.on('mouseout', () => {
          const id = feature.properties?.region_id ?? '';
          (layer as L.Path).setStyle(getStyle(id, id === propsRef.current.selectedRegion));
        });
      },
    });

    geoLayer.addTo(map);
    layerRef.current = geoLayer;

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, year, pillar]);

  // Update selected style without recreating layer
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.eachLayer((layer) => {
      const feature = (layer as L.GeoJSON).feature as GeoJSON.Feature;
      const id = feature?.properties?.region_id ?? '';
      (layer as L.Path).setStyle(getStyle(id, id === selectedRegion));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion]);

  return null;
}
