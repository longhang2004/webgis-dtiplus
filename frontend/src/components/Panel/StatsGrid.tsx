import React from 'react';
import { useAppStore } from '../../store/appStore';
import { getDTIForYear } from '../../data/dti-data';
import { REGION_META } from '../../data/region-meta';
import { computeStats } from '../../utils/statistics';
import { DTI_DATA } from '../../data/dti-data';

export default function StatsGrid() {
  const { selectedYear, selectedPillar } = useAppStore();
  const yearData = getDTIForYear(selectedYear);
  const stats = computeStats(yearData, selectedPillar);

  // CAGR from 2020
  const year2020Data = getDTIForYear(2020);
  const vals2020 = year2020Data.map((r) => r[selectedPillar]);
  const valsNow = yearData.map((r) => r[selectedPillar]);
  const avgNow = valsNow.reduce((s, v) => s + v, 0) / valsNow.length;
  const avg2020 = vals2020.reduce((s, v) => s + v, 0) / vals2020.length;
  const years = selectedYear - 2020;
  const cagr = years > 0 ? ((Math.pow(avgNow / avg2020, 1 / years) - 1) * 100) : 0;

  const items = [
    { label: 'Trung bình quốc gia', value: stats.mean.toFixed(3), mono: true },
    { label: 'Khoảng cách (max−min)', value: stats.range.toFixed(3), mono: true },
    { label: 'Hệ số biến thiên (CV)', value: `${stats.cv.toFixed(1)}%`, mono: true },
    { label: 'Tốc độ tăng TB (CAGR)', value: years > 0 ? `${cagr.toFixed(2)}%/năm` : '—', mono: true },
    { label: 'Vùng cao nhất', value: REGION_META[stats.highest?.regionId]?.shortName ?? '—', mono: false },
    { label: 'Vùng thấp nhất', value: REGION_META[stats.lowest?.regionId]?.shortName ?? '—', mono: false },
  ];

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>THỐNG KÊ TỔNG HỢP — {selectedYear}{selectedYear === 2025 ? '*' : ''}</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ label, value, mono }) => (
          <div key={label} className="rounded p-2" style={{ background: 'var(--panel)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className={`text-sm font-semibold ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--accent)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
