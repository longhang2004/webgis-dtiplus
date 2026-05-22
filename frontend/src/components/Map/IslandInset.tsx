import { useMemo } from 'react';
import { CircleMarker, GeoJSON as GeoJSONLayer, MapContainer as LeafletMap, TileLayer, Tooltip } from 'react-leaflet';
import type { PathOptions } from 'leaflet';
import islandsGeoJSON from '../../data/geojson/vietnam-islands.geojson';
import { getDTIColor } from '../../utils/colorScale';
import { useMapData } from '../../hooks/useMapData';
import { RegionId } from '../../types';
import i18n from '../../i18n';

type IslandFeature = GeoJSON.Feature<GeoJSON.MultiPolygon, {
  id: string;
  name: string;
  name_en: string;
  kind: string;
}>;

const INSET_CENTER: [number, number] = [13.55, 113.15];
const LABEL_POSITIONS: Record<string, [number, number]> = {
  HOANG_SA: [16.45, 112.05],
  TRUONG_SA: [10.55, 114.05],
};
const ISLAND_REGION: Record<string, RegionId> = {
  HOANG_SA: 'BTB',
  TRUONG_SA: 'BTB',
};

export default function IslandInset() {
  const { yearData, selectedPillar, selectedYear } = useMapData();
  const features = useMemo(
    () => (islandsGeoJSON as GeoJSON.FeatureCollection).features as IslandFeature[],
    [],
  );

  const getIslandColor = (islandId: string): string => {
    const regionId = ISLAND_REGION[islandId];
    const record = yearData.find((item) => item.regionId === regionId);
    return getDTIColor(record?.[selectedPillar] ?? 0);
  };

  return (
    <div
      className="webgis-island-inset"
      aria-label="Hoàng Sa và Trường Sa"
      onMouseDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="webgis-island-inset__title">Hoàng Sa · Trường Sa</div>
      <LeafletMap
        center={INSET_CENTER}
        zoom={4.25}
        minZoom={4}
        maxZoom={7}
        zoomSnap={0.25}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.32}
        />
        <GeoJSONLayer
          key={`${selectedYear}-${selectedPillar}`}
          data={islandsGeoJSON as GeoJSON.FeatureCollection}
          style={(feature): PathOptions => ({
            color: '#ffffff',
            weight: 1.4,
            fillColor: getIslandColor(String(feature?.properties?.id ?? '')),
            fillOpacity: 0.9,
          })}
        />
        {features.map((feature) => {
          const [lat, lng] = LABEL_POSITIONS[feature.properties.id];
          const label = i18n.language === 'en' ? feature.properties.name_en : feature.properties.name;
          const color = getIslandColor(feature.properties.id);

          return (
            <CircleMarker
              key={`${feature.properties.id}-${selectedYear}-${selectedPillar}`}
              center={[lat, lng]}
              radius={5}
              pathOptions={{
                color: '#ffffff',
                weight: 1.5,
                fillColor: color,
                fillOpacity: 1,
              }}
            >
              <Tooltip permanent direction="right" offset={[8, 0]} opacity={1}>
                {label}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </LeafletMap>
    </div>
  );
}
