import React from 'react';
import { useAppStore } from '../../store/appStore';
import { getDTIForYear } from '../../data/dti-data';
import { REGION_META } from '../../data/region-meta';
import { getDTIColor, REGION_COLORS } from '../../utils/colorScale';
import { getRanking } from '../../utils/statistics';
import { RegionId } from '../../types';

export default function RankingBars() {
  const { selectedYear, selectedPillar, selectedRegion, setRegion } = useAppStore();
  const yearData = getDTIForYear(selectedYear);
  const ranked = getRanking(yearData, selectedPillar);
  const maxVal = ranked[0]?.[selectedPillar] ?? 1;

  return (
    <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>XẾP HẠNG CÁC VÙNG</p>
      {ranked.map((record, idx) => {
        const meta = REGION_META[record.regionId];
        const val = record[selectedPillar];
        const color = REGION_COLORS[record.regionId] ?? getDTIColor(val);
        const isSelected = record.regionId === selectedRegion;

        return (
          <button
            key={record.regionId}
            onClick={() => setRegion(isSelected ? null : record.regionId as RegionId)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs w-4 text-right" style={{ color: 'var(--muted)' }}>{idx + 1}</span>
              <span className="text-xs flex-1 truncate" style={{ color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                {meta?.shortName ?? record.regionId}
              </span>
              <span className="text-xs font-mono" style={{ color }}>{val.toFixed(3)}</span>
            </div>
            <div className="h-1.5 rounded-full ml-6" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(val / maxVal) * 100}%`, background: color, opacity: isSelected || !selectedRegion ? 1 : 0.4 }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
