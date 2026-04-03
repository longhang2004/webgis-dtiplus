import { useAppStore } from '../../store/appStore';
import MapContainer from './MapContainer';
import { Year } from '../../types';

const YEARS: Year[] = [2020, 2021, 2022, 2023, 2024, 2025];

function YearBadge({ year, onChange }: { year: Year; onChange: (y: Year) => void }) {
  return (
    <div
      className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded px-2 py-1"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => {
          const idx = YEARS.indexOf(year);
          if (idx > 0) onChange(YEARS[idx - 1]);
        }}
        className="text-xs w-4 text-center hover:opacity-60 disabled:opacity-20"
        style={{ color: 'var(--accent)' }}
        disabled={year === YEARS[0]}
      >‹</button>
      <span className="text-xs font-mono px-1 min-w-[38px] text-center" style={{ color: 'var(--accent)' }}>
        {year}{year === 2025 ? '*' : ''}
      </span>
      <button
        onClick={() => {
          const idx = YEARS.indexOf(year);
          if (idx < YEARS.length - 1) onChange(YEARS[idx + 1]);
        }}
        className="text-xs w-4 text-center hover:opacity-60 disabled:opacity-20"
        style={{ color: 'var(--accent)' }}
        disabled={year === YEARS[YEARS.length - 1]}
      >›</button>
    </div>
  );
}

export default function MapSection() {
  const {
    splitMode, selectedYear, splitYear, setSplitYear,
    selectedPillar, selectedRegion, setRegion, setYear,
  } = useAppStore();

  if (splitMode) {
    return (
      <div className="flex h-full w-full min-h-0 flex-col md:flex-row">
        {/* Left panel — splitYear */}
        <div
          className="relative min-h-[42vh] flex-1 border-b md:min-h-0 md:border-b-0 md:border-r"
          style={{ borderColor: 'var(--border)' }}
        >
          <YearBadge year={splitYear} onChange={setSplitYear} />
          <MapContainer
            year={splitYear}
            pillar={selectedPillar}
            selectedRegion={selectedRegion}
            onRegionClick={setRegion}
          />
        </div>
        {/* Right panel — selectedYear */}
        <div className="relative min-h-[42vh] flex-1 md:min-h-0">
          <YearBadge year={selectedYear} onChange={setYear} />
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
