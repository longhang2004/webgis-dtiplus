import React from 'react';
import Header from './Header';
import MapSection from '../Map/MapSection';
import ControlBar from '../Controls/ControlBar';
import SidePanel from '../Panel/SidePanel';
import { useUrlState } from '../../hooks/useUrlState';
import { useAppStore } from '../../store/appStore';

export default function AppLayout() {
  useUrlState();
  const splitMode = useAppStore((s) => s.splitMode);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Header />
      <ControlBar />
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 relative overflow-hidden ${splitMode ? 'flex' : ''}`} id="map-container">
          <MapSection />
        </div>
        <aside
          className="overflow-y-auto border-l hidden lg:block"
          style={{ width: '360px', minWidth: '320px', borderColor: 'var(--border)', background: 'var(--panel)' }}
        >
          <SidePanel />
        </aside>
      </div>
    </div>
  );
}
