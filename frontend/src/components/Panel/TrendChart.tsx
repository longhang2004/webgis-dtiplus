import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Legend, ResponsiveContainer, Dot
} from 'recharts';
import { useAppStore } from '../../store/appStore';
import { DTI_DATA } from '../../data/dti-data';
import { REGION_META } from '../../data/region-meta';
import { REGION_COLORS } from '../../utils/colorScale';
import { RegionId } from '../../types';

const REGION_IDS = ['DBSH', 'DNB', 'BTB', 'DBSCL', 'TDMNPB', 'TN'] as RegionId[];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

export default function TrendChart() {
  const { selectedPillar, selectedRegion, selectedYear, setRegion } = useAppStore();

  const chartData = YEARS.map((year) => {
    const row: Record<string, number | string> = { year: String(year) + (year === 2025 ? '*' : '') };
    REGION_IDS.forEach((id) => {
      const rec = DTI_DATA.find((d) => d.regionId === id && d.year === year);
      row[id] = rec ? rec[selectedPillar] : 0;
    });
    return row;
  });

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>XU HƯỚNG 2020–2025</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6b80a8' }} />
          <YAxis domain={[0.25, 0.85]} tick={{ fontSize: 10, fill: '#6b80a8' }} tickCount={7} />
          <Tooltip
            contentStyle={{ background: '#0c1628', border: '1px solid #1a2d4d', borderRadius: '6px', fontSize: '11px' }}
            labelStyle={{ color: '#00d4aa' }}
            itemStyle={{ color: '#e2eaff' }}
          />
          <ReferenceLine
            x={String(selectedYear) + (selectedYear === 2025 ? '*' : '')}
            stroke="#00d4aa"
            strokeDasharray="4 2"
            strokeOpacity={0.6}
          />
          {REGION_IDS.map((id) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={REGION_COLORS[id]}
              strokeWidth={selectedRegion === id ? 2.5 : 1.5}
              strokeOpacity={!selectedRegion || selectedRegion === id ? 1 : 0.2}
              dot={false}
              activeDot={{ r: 4, fill: REGION_COLORS[id] }}
              name={REGION_META[id]?.shortName ?? id}
            />
          ))}
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '10px', cursor: 'pointer' }}
            onClick={(e) => setRegion((e.dataKey as RegionId) === selectedRegion ? null : e.dataKey as RegionId)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
