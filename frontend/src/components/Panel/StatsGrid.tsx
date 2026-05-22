import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import { computeStats } from '../../utils/statistics';
import { useMapData } from '../../hooks/useMapData';

export default function StatsGrid() {
  const { selectedYear, selectedPillar } = useAppStore();
  const { t } = useTranslation();
  const { yearData, allData } = useMapData();
  const stats = computeStats(yearData, selectedPillar);

  // CAGR from 2020
  const year2020Data = allData.filter((r) => r.year === 2020);
  const vals2020 = year2020Data.map((r) => r[selectedPillar]);
  const valsNow = yearData.map((r) => r[selectedPillar]);
  const avgNow = valsNow.reduce((s, v) => s + v, 0) / valsNow.length;
  const avg2020 = vals2020.reduce((s, v) => s + v, 0) / vals2020.length;
  const years = selectedYear - 2020;
  const cagr = years > 0 ? ((Math.pow(avgNow / avg2020, 1 / years) - 1) * 100) : 0;

  const items = [
    { label: t('panel.national_avg'), value: stats.mean.toFixed(3), mono: true },
    { label: t('panel.range'), value: stats.range.toFixed(3), mono: true },
    { label: t('panel.cv'), value: `${stats.cv.toFixed(1)}%`, mono: true },
    { label: t('panel.cagr'), value: years > 0 ? `${cagr.toFixed(2)}${t('panel.cagr_unit')}` : t('panel.na'), mono: true },
    { label: t('panel.highest'), value: stats.highest?.regionId ? t(`regions.${stats.highest.regionId}.shortName`) : t('panel.na'), mono: false },
    { label: t('panel.lowest'), value: stats.lowest?.regionId ? t(`regions.${stats.lowest.regionId}.shortName`) : t('panel.na'), mono: false },
  ];

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>
        {t('panel.stats_title', { year: selectedYear, est: selectedYear === 2025 ? '*' : '' })}
      </p>
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
