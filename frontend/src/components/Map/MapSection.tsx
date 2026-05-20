import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [splitRatio, setSplitRatio] = useState(50);

  const updateSplitRatio = useCallback((clientX: number) => {
    const rect = splitContainerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.min(76, Math.max(24, next)));
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [splitRatio]);

  const handleDividerPointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    updateSplitRatio(event.clientX);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateSplitRatio(moveEvent.clientX);
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [updateSplitRatio]);

  const handleDividerKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    setSplitRatio((current) => {
      if (event.key === 'Home') return 24;
      if (event.key === 'End') return 76;
      const delta = event.key === 'ArrowLeft' ? -5 : 5;
      return Math.min(76, Math.max(24, current + delta));
    });
  }, []);

  if (splitMode) {
    return (
      <>
        {/* Tablet+ : side-by-side maps */}
        <div ref={splitContainerRef} className="relative hidden md:flex h-full w-full min-h-0 flex-row">
          <div
            className="relative h-full min-w-0 overflow-hidden"
            style={{ width: `${splitRatio}%` }}
          >
            <YearBadge year={splitYear} onChange={setSplitYear} />
            <MapContainer
              year={splitYear}
              pillar={selectedPillar}
              selectedRegion={selectedRegion}
              onRegionClick={setRegion}
            />
          </div>
          <button
            type="button"
            className="absolute top-0 bottom-0 z-20 flex w-4 -translate-x-1/2 cursor-col-resize items-center justify-center touch-none"
            style={{ left: `${splitRatio}%` }}
            aria-label={t('controls.resize_split')}
            aria-orientation="vertical"
            aria-valuemax={76}
            aria-valuemin={24}
            aria-valuenow={Math.round(splitRatio)}
            role="separator"
            onKeyDown={handleDividerKeyDown}
            onPointerDown={handleDividerPointerDown}
          >
            <span
              className="h-full w-px"
              style={{ background: 'var(--border)', boxShadow: '0 0 0 1px rgba(255,255,255,0.28)' }}
            />
            <span
              className="absolute h-14 w-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          </button>
          <div className="relative h-full min-w-0 flex-1 overflow-hidden">
            <YearBadge year={selectedYear} onChange={setYear} />
            <MapContainer
              year={selectedYear}
              pillar={selectedPillar}
              selectedRegion={selectedRegion}
              onRegionClick={setRegion}
            />
          </div>
        </div>
        {/* Mobile: single map + hint */}
        <div className="flex flex-col h-full w-full md:hidden">
          <div
            className="text-center text-xs py-1.5 border-b"
            style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            {t('controls.split_mobile_hint')}
          </div>
          <div className="relative flex-1 min-h-0">
            <MapContainer
              year={selectedYear}
              pillar={selectedPillar}
              selectedRegion={selectedRegion}
              onRegionClick={setRegion}
            />
          </div>
        </div>
      </>
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
