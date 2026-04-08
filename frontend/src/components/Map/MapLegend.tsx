import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { Pillar } from '../../types';
import { PILLAR_LABELS } from '../../utils/colorScale';
import ReactDOM from 'react-dom/client';

const LEGEND_ITEMS = [
  { color: '#00d4aa', label: '> 0.70 — Rất cao' },
  { color: '#1ea06e', label: '0.60 – 0.70 — Cao' },
  { color: '#c8b91e', label: '0.50 – 0.60 — Trung bình' },
  { color: '#c8641e', label: '0.40 – 0.50 — Thấp' },
  { color: '#8b2323', label: '< 0.40 — Rất thấp' },
];

function LegendContent({ pillar }: { pillar: Pillar }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 12px',
      minWidth: '160px',
      opacity: 0.95,
    }}>
      <p style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>
        {PILLAR_LABELS[pillar]}
      </p>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text)', fontSize: '11px' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function MapLegend({ pillar }: { pillar: Pillar }) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    const control = new L.Control({ position: 'bottomleft' });
    control.onAdd = () => {
      const div = L.DomUtil.create('div');
      const root = ReactDOM.createRoot(div);
      root.render(<LegendContent pillar={pillar} />);
      return div;
    };
    control.addTo(map);
    controlRef.current = control;
    return () => {
      if (controlRef.current) map.removeControl(controlRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pillar]);

  return null;
}
