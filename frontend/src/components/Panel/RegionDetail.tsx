import React from 'react';
import { useAppStore } from '../../store/appStore';
import { getDTIValue, DTI_DATA } from '../../data/dti-data';
import { REGION_META } from '../../data/region-meta';
import { getDTIColor, PILLAR_LABELS } from '../../utils/colorScale';
import { getYoYChange, getRanking } from '../../utils/statistics';
import { DTIRecord } from '../../types';

export default function RegionDetail() {
  const { selectedRegion, selectedYear, selectedPillar } = useAppStore();

  if (!selectedRegion) {
    return (
      <div className="rounded-lg border p-4 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Chọn một vùng trên bản đồ</p>
      </div>
    );
  }

  const meta = REGION_META[selectedRegion];
  const value = getDTIValue(selectedRegion, selectedYear, selectedPillar);
  const color = getDTIColor(value);
  const yearData = DTI_DATA.filter((d) => d.year === selectedYear);
  const ranked = getRanking(yearData, selectedPillar);
  const rank = ranked.findIndex((r) => r.regionId === selectedRegion) + 1;
  const yoy = getYoYChange(DTI_DATA, selectedRegion, selectedYear, selectedPillar);

  const govVal = getDTIValue(selectedRegion, selectedYear, 'gov');
  const econVal = getDTIValue(selectedRegion, selectedYear, 'econ');
  const socVal = getDTIValue(selectedRegion, selectedYear, 'soc');

  return (
    <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Vùng được chọn</p>
          <h3 className="text-sm font-semibold" style={{ color }}>{meta?.name ?? selectedRegion}</h3>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-2xl" style={{ color }}>{value.toFixed(3)}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Hạng {rank}/6</p>
        </div>
      </div>

      {yoy !== null && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>So với năm trước:</span>
          <span className="text-xs font-mono font-semibold" style={{ color: yoy >= 0 ? '#00d4aa' : '#ef4444' }}>
            {yoy >= 0 ? '+' : ''}{(yoy * 100).toFixed(1)}%
          </span>
        </div>
      )}

      <div className="space-y-2 pt-1">
        {[
          { label: PILLAR_LABELS.gov, val: govVal },
          { label: PILLAR_LABELS.econ, val: econVal },
          { label: PILLAR_LABELS.soc, val: socVal },
        ].map(({ label, val }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--muted)' }}>{label}</span>
              <span className="font-mono" style={{ color: 'var(--text)' }}>{val.toFixed(3)}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${val * 100}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
