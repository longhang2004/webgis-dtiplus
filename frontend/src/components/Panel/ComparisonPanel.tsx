import { useAppStore } from '../../store/appStore';
import { getDTIForYear, getDTIValue } from '../../data/dti-data';
import { REGION_META } from '../../data/region-meta';
import { getDTIColor, REGION_COLORS, PILLAR_LABELS } from '../../utils/colorScale';
import { computeStats, getRanking } from '../../utils/statistics';
import { RegionId, Year, Pillar } from '../../types';

const REGION_IDS: RegionId[] = ['DBSH', 'DNB', 'BTB', 'DBSCL', 'TDMNPB', 'TN'];

function formatChange(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${(val * 100).toFixed(1)}%`;
}

function formatDiff(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(3)}`;
}

export default function ComparisonPanel() {
  const { splitYear, selectedYear, selectedPillar, selectedRegion, setRegion } = useAppStore();

  const fromData = getDTIForYear(splitYear);
  const toData = getDTIForYear(selectedYear);
  const fromStats = computeStats(fromData, selectedPillar);
  const toStats = computeStats(toData, selectedPillar);

  // Per-region comparison, sorted by absolute change descending
  const regionChanges = REGION_IDS.map((id) => {
    const from = getDTIValue(id, splitYear, selectedPillar);
    const to = getDTIValue(id, selectedYear, selectedPillar);
    const diff = to - from;
    const pctChange = from > 0 ? (diff / from) : 0;
    return { id, from, to, diff, pctChange };
  }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  // Rank changes
  const rankFrom = getRanking(fromData, selectedPillar).map((r) => r.regionId);
  const rankTo = getRanking(toData, selectedPillar).map((r) => r.regionId);

  const meanDiff = toStats.mean - fromStats.mean;
  const cvDiff = toStats.cv - fromStats.cv;
  const gapDiff = toStats.range - fromStats.range;

  const yearsDiff = selectedYear - splitYear;
  const yearLabel = yearsDiff > 0 ? `${splitYear} → ${selectedYear}` : `${selectedYear} → ${splitYear}`;

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>SO SÁNH</p>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--accent)' }}>
            {yearLabel}
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{PILLAR_LABELS[selectedPillar]}</p>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded p-2" style={{ background: 'var(--panel)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>TB quốc gia</p>
            <p className="text-sm font-mono font-semibold" style={{ color: meanDiff >= 0 ? '#00d4aa' : '#ef4444' }}>
              {formatDiff(meanDiff)}
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              {fromStats.mean.toFixed(3)} → {toStats.mean.toFixed(3)}
            </p>
          </div>
          <div className="rounded p-2" style={{ background: 'var(--panel)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Khoảng cách</p>
            <p className="text-sm font-mono font-semibold" style={{ color: gapDiff <= 0 ? '#00d4aa' : '#ef4444' }}>
              {formatDiff(gapDiff)}
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              {fromStats.range.toFixed(3)} → {toStats.range.toFixed(3)}
            </p>
          </div>
          <div className="rounded p-2" style={{ background: 'var(--panel)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Hệ số CV</p>
            <p className="text-sm font-mono font-semibold" style={{ color: cvDiff <= 0 ? '#00d4aa' : '#ef4444' }}>
              {cvDiff >= 0 ? '+' : ''}{cvDiff.toFixed(1)}%
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              {fromStats.cv.toFixed(1)} → {toStats.cv.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Per-region comparison */}
      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>THAY ĐỔI THEO VÙNG</p>
        <div className="space-y-3">
          {regionChanges.map(({ id, from, to, diff, pctChange }) => {
            const meta = REGION_META[id];
            const isSelected = id === selectedRegion;
            const fromRank = rankFrom.indexOf(id) + 1;
            const toRank = rankTo.indexOf(id) + 1;
            const rankDiff = fromRank - toRank; // positive = improved

            return (
              <button
                key={id}
                onClick={() => setRegion(isSelected ? null : id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: REGION_COLORS[id] }} />
                    <span
                      className="text-xs font-medium"
                      style={{ color: isSelected ? 'var(--accent)' : 'var(--text)' }}
                    >
                      {meta?.shortName ?? id}
                    </span>
                    {rankDiff !== 0 && (
                      <span className="text-xs font-mono" style={{ color: rankDiff > 0 ? '#00d4aa' : rankDiff < 0 ? '#ef4444' : 'var(--muted)' }}>
                        {rankDiff > 0 ? `▲${rankDiff}` : `▼${Math.abs(rankDiff)}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                      {from.toFixed(3)}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '10px' }}>→</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text)' }}>
                      {to.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Dumbbell chart: scale 0.25–0.85 matching TrendChart */}
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex-1 h-4 relative" style={{ background: 'transparent' }}>
                    {/* Track */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-px"
                      style={{ background: 'var(--border)' }}
                    />
                    {/* Change segment connecting from → to */}
                    {(() => {
                      const lo = Math.min(from, to);
                      const hi = Math.max(from, to);
                      const scale = (v: number) => ((v - 0.25) / 0.6) * 100; // map 0.25–0.85 to 0–100%
                      return (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
                          style={{
                            left: `${scale(lo)}%`,
                            width: `${scale(hi) - scale(lo)}%`,
                            background: diff >= 0
                              ? 'linear-gradient(90deg, rgba(0,212,170,0.3), rgba(0,212,170,0.7))'
                              : 'linear-gradient(90deg, rgba(239,68,68,0.7), rgba(239,68,68,0.3))',
                          }}
                        />
                      );
                    })()}
                    {/* "From" dot (hollow) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2"
                      style={{
                        left: `${((from - 0.25) / 0.6) * 100}%`,
                        borderColor: getDTIColor(from),
                        background: 'var(--bg)',
                      }}
                    />
                    {/* "To" dot (solid) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
                      style={{
                        left: `${((to - 0.25) / 0.6) * 100}%`,
                        background: getDTIColor(to),
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-semibold min-w-[52px] text-right"
                    style={{ color: diff >= 0 ? '#00d4aa' : '#ef4444' }}
                  >
                    {formatDiff(diff)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Convergence analysis */}
      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>PHÂN TÍCH HỘI TỤ</p>
        <div className="space-y-2 text-xs" style={{ color: 'var(--muted)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: gapDiff <= 0 ? '#00d4aa' : '#ef4444' }}
            />
            <span>
              Khoảng cách max−min{' '}
              <strong style={{ color: gapDiff <= 0 ? '#00d4aa' : '#ef4444' }}>
                {gapDiff <= 0 ? 'thu hẹp' : 'mở rộng'}
              </strong>
              {' '}{Math.abs(gapDiff).toFixed(3)} điểm
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: cvDiff <= 0 ? '#00d4aa' : '#ef4444' }}
            />
            <span>
              Hệ số biến thiên (CV){' '}
              <strong style={{ color: cvDiff <= 0 ? '#00d4aa' : '#ef4444' }}>
                {cvDiff <= 0 ? 'giảm' : 'tăng'}
              </strong>
              {' '}{Math.abs(cvDiff).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#0ea5e9' }} />
            <span>
              Vùng cải thiện nhiều nhất:{' '}
              <strong style={{ color: 'var(--text)' }}>
                {REGION_META[regionChanges[0]?.id]?.shortName}
              </strong>
              {' '}({formatDiff(regionChanges[0]?.diff ?? 0)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
            <span>
              Vùng cải thiện ít nhất:{' '}
              <strong style={{ color: 'var(--text)' }}>
                {REGION_META[regionChanges[regionChanges.length - 1]?.id]?.shortName}
              </strong>
              {' '}({formatDiff(regionChanges[regionChanges.length - 1]?.diff ?? 0)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
