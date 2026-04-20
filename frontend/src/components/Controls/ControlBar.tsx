import { useState } from 'react';
import YearSlider from './YearSlider';
import PlayButton from './PlayButton';
import PillarSelector from './PillarSelector';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from 'react-i18next';
import { exportCSV } from '../../utils/exportUtils';
import { getDTIForYear } from '../../data/dti-data';

export default function ControlBar() {
  const { selectedYear, selectedPillar, selectedRegion, splitMode, darkMode, toggleSplitMode } = useAppStore();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleExportCSV = () => {
    const data = getDTIForYear(selectedYear);
    exportCSV(data, selectedYear, selectedPillar);
    setMenuOpen(false);
  };

  const handleExportPNG = async () => {
    const { exportMapPNG } = await import('../../utils/exportUtils');
    exportMapPNG('map-container', {
      year: selectedYear,
      pillar: selectedPillar,
      selectedRegion,
      darkMode,
    });
    setMenuOpen(false);
  };

  return (
    <div
      className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-b shrink-0"
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      {/* Play + Slider — always visible */}
      <PlayButton />
      <YearSlider />

      {/* Pillar selector */}
      <PillarSelector />

      {/* Desktop: inline buttons */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={toggleSplitMode}
          className="px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap"
          style={{
            borderColor: splitMode ? 'var(--accent)' : 'var(--border)',
            color: splitMode ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          {t('controls.compare')}
        </button>
        <button
          onClick={handleExportCSV}
          className="px-3 py-1 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          ↓ CSV
        </button>
        <button
          onClick={handleExportPNG}
          className="px-3 py-1 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          ↓ PNG
        </button>
      </div>

      {/* Mobile: overflow menu */}
      <div className="relative lg:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
          style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          ⋮
        </button>
        {menuOpen && (
          <>
            <button
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
            <div
              className="absolute right-0 top-full mt-1 z-40 rounded-lg border py-1 min-w-[140px] shadow-xl"
              style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => { toggleSplitMode(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:opacity-80 hidden md:block"
                style={{ color: splitMode ? 'var(--accent)' : 'var(--text)' }}
              >
                {splitMode ? '✓ ' : ''}{t('controls.compare')}
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-3 py-2 text-xs hover:opacity-80"
                style={{ color: 'var(--text)' }}
              >
                ↓ {t('controls.export_csv')}
              </button>
              <button
                onClick={handleExportPNG}
                className="w-full text-left px-3 py-2 text-xs hover:opacity-80"
                style={{ color: 'var(--text)' }}
              >
                ↓ {t('controls.export_png')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
