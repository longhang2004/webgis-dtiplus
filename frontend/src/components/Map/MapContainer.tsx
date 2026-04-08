import React from 'react';
import { MapContainer as LeafletMap, TileLayer, ScaleControl, ZoomControl } from 'react-leaflet';
import ChoroplethLayer from './ChoroplethLayer';
import MapLegend from './MapLegend';
import { RegionId, Year, Pillar } from '../../types';

interface Props {
  year: Year;
  pillar: Pillar;
  selectedRegion: RegionId | null;
  onRegionClick: (id: RegionId | null) => void;
}

export default function MapContainer({ year, pillar, selectedRegion, onRegionClick }: Props) {
  return (
    <LeafletMap
      center={[16.0, 107.5]}
      zoom={6}
      minZoom={5}
      maxZoom={10}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
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
    </LeafletMap>
  );
}
