import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Pillar } from '../../types';
import { PILLAR_LABELS } from '../../utils/colorScale';

const PILLARS: Pillar[] = ['total', 'gov', 'econ', 'soc'];

export default function PillarSelector() {
  const { selectedPillar, setPillar } = useAppStore();

  return (
    <select
      value={selectedPillar}
      onChange={(e) => setPillar(e.target.value as Pillar)}
      className="text-xs rounded border px-2 py-1"
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        borderColor: 'var(--border)',
      }}
    >
      {PILLARS.map((p) => (
        <option key={p} value={p}>{PILLAR_LABELS[p]}</option>
      ))}
    </select>
  );
}
