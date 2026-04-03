import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import AboutModal from './AboutModal';

export default function Header() {
  const { toggleDarkMode, darkMode } = useAppStore();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#070e1c' }}>
            GIS
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
              WebGIS DTI+ | Phân hóa không gian phát triển số Việt Nam
            </h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Khoa Địa lý · ĐHKHXH&NV · ĐHQG TP.HCM · 2025
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAbout(true)}
            className="px-3 py-1 text-xs rounded border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Giới thiệu
          </button>
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1 text-xs rounded border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            {darkMode ? '☀ Sáng' : '☾ Tối'}
          </button>
        </div>
      </header>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
