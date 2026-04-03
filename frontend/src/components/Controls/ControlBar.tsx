import React from 'react';
import YearSlider from './YearSlider';
import PlayButton from './PlayButton';
import PillarSelector from './PillarSelector';
import { useAppStore } from '../../store/appStore';
import { exportCSV } from '../../utils/exportUtils';
import { getDTIForYear } from '../../data/dti-data';

export default function ControlBar() {
  const { selectedYear, selectedPillar, splitMode, toggleSplitMode } = useAppStore();

  const handleExportCSV = () => {
    const data = getDTIForYear(selectedYear);
    exportCSV(data, selectedYear, selectedPillar);
  };

  const handleExportPNG = async () => {
    const { exportMapPNG } = await import('../../utils/exportUtils');
    exportMapPNG('map-container');
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b flex-wrap"
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <PlayButton />
        <YearSlider />
      </div>
      <PillarSelector />
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSplitMode}
          className="px-3 py-1 text-xs rounded border transition-colors"
          style={{
            borderColor: splitMode ? 'var(--accent)' : 'var(--border)',
            color: splitMode ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          ⬛ So sánh
        </button>
        <button
          onClick={handleExportCSV}
          className="px-3 py-1 text-xs rounded border transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          ↓ CSV
        </button>
        <button
          onClick={handleExportPNG}
          className="px-3 py-1 text-xs rounded border transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          ↓ PNG
        </button>
      </div>
    </div>
  );
}
