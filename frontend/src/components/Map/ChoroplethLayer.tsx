import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { PathOptions, GeoJSON as LGeoJSON } from 'leaflet';
import { RegionId, Year, Pillar } from '../../types';
import { getDTIValue } from '../../data/dti-data';
import { getDTIColor } from '../../utils/colorScale';
import { REGION_META } from '../../data/region-meta';
import regionsGeoJSON from '../../data/geojson/vietnam-regions.geojson';

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
      weight: isSelected ? 3 : 1.5,
      color: isSelected ? '#00d4aa' : '#0c1628',
      fillOpacity: 0.85,
    };
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
            return `<strong style="color:#e2eaff">${meta?.name ?? regionId}</strong><br/>DTI+: <span style="color:#00d4aa;font-family:monospace;font-weight:600">${value.toFixed(3)}</span>`;
          },
          { sticky: true }
        );

        layer.on('click', () => {
          propsRef.current.onRegionClick(
            propsRef.current.selectedRegion === regionId ? null : regionId
          );
        });

        layer.on('mouseover', () => {
          (layer as L.Path).setStyle({ weight: 2.5, fillOpacity: 1 });
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
