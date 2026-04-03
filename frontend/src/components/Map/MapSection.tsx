import React from 'react';
import { useAppStore } from '../../store/appStore';
import MapContainer from './MapContainer';

export default function MapSection() {
  const { splitMode, selectedYear, splitYear, selectedPillar, selectedRegion, setRegion } = useAppStore();

  if (splitMode) {
    return (
      <div className="flex h-full w-full">
        <div className="flex-1 relative border-r" style={{ borderColor: 'var(--border)' }}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded text-xs font-mono" style={{ background: 'var(--panel)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
            {splitYear}{splitYear === 2025 ? '*' : ''}
          </div>
          <MapContainer
            year={splitYear}
            pillar={selectedPillar}
            selectedRegion={selectedRegion}
            onRegionClick={setRegion}
          />
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded text-xs font-mono" style={{ background: 'var(--panel)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
            {selectedYear}{selectedYear === 2025 ? '*' : ''}
          </div>
          <MapContainer
            year={selectedYear}
            pillar={selectedPillar}
            selectedRegion={selectedRegion}
            onRegionClick={setRegion}
          />
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      year={selectedYear}
      pillar={selectedPillar}
      selectedRegion={selectedRegion}
      onRegionClick={setRegion}
    />
  );
}
