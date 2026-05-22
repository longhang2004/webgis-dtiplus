import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, ScaleControl, ZoomControl, useMap } from 'react-leaflet';
import ChoroplethLayer from './ChoroplethLayer';
import MapLegend from './MapLegend';
import IslandInset from './IslandInset';
import { RegionId, Year, Pillar } from '../../types';
import { setMapInstance } from '../../store/appStore';

interface Props {
  year: Year;
  pillar: Pillar;
  selectedRegion: RegionId | null;
  onRegionClick: (id: RegionId | null) => void;
  showIslandInset?: boolean;
}

/** Register Leaflet map instance globally for export */
function MapRegistrar() {
  const map = useMap();
  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map]);
  return null;
}

export default function MapContainer({ year, pillar, selectedRegion, onRegionClick, showIslandInset = true }: Props) {
  return (
    <LeafletMap
      center={[16.0, 107.5]}
      zoom={6}
      minZoom={5}
      maxZoom={10}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <MapRegistrar />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        opacity={0.15}
      />
      <ZoomControl position="topright" />
      <ScaleControl position="bottomleft" imperial={false} />
      <ChoroplethLayer
        year={year}
        pillar={pillar}
        selectedRegion={selectedRegion}
        onRegionClick={onRegionClick}
      />
      <MapLegend pillar={pillar} />
      {showIslandInset && <IslandInset />}
    </LeafletMap>
  );
}
