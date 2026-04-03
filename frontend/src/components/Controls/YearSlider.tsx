import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Year } from '../../types';

const YEARS: Year[] = [2020, 2021, 2022, 2023, 2024, 2025];

export default function YearSlider() {
  const { selectedYear, setYear } = useAppStore();

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="text-xs whitespace-nowrap font-mono" style={{ color: 'var(--accent)', minWidth: '60px' }}>
        {selectedYear}{selectedYear === 2025 ? '*' : ''}
      </span>
      <input
        type="range"
        min={0}
        max={YEARS.length - 1}
        value={YEARS.indexOf(selectedYear)}
        onChange={(e) => setYear(YEARS[parseInt(e.target.value)])}
        className="flex-1 accent-teal-400"
        style={{ accentColor: 'var(--accent)' }}
      />
      <div className="hidden sm:flex gap-1">
        {YEARS.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className="text-xs px-1 rounded transition-colors"
            style={{
              color: selectedYear === y ? 'var(--accent)' : 'var(--muted)',
              fontWeight: selectedYear === y ? 600 : 400,
            }}
          >
            {y}{y === 2025 ? '*' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
