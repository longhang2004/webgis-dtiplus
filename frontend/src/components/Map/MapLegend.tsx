import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pillar } from '../../types';
import ReactDOM from 'react-dom/client';

const LEGEND_THRESHOLDS = [
  { color: '#00d4aa', range: '> 0.70 — ', key: 'very_high' },
  { color: '#1ea06e', range: '0.60 – 0.70 — ', key: 'high' },
  { color: '#c8b91e', range: '0.50 – 0.60 — ', key: 'medium' },
  { color: '#c8641e', range: '0.40 – 0.50 — ', key: 'low' },
  { color: '#8b2323', range: '< 0.40 — ', key: 'very_low' },
];

function LegendContent({ pillar }: { pillar: Pillar }) {
  const { t } = useTranslation();
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
        {t(`pillars.${pillar}`)}
      </p>
      {LEGEND_THRESHOLDS.map((item) => (
        <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text)', fontSize: '11px' }}>{item.range}{t(`color_labels.${item.key}`)}</span>
        </div>
      ))}
    </div>
  );
}

export default function MapLegend({ pillar }: { pillar: Pillar }) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  const { i18n } = useTranslation();

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
  }, [map, pillar, i18n.language]);

  return null;
}
