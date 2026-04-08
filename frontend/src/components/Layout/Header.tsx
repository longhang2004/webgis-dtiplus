import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function Header() {
  const { toggleDarkMode, darkMode, setMobileDataPanelOpen, setAboutModalOpen } = useAppStore();

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg flex shrink-0 items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#070e1c' }}>
            GIS
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text)' }}>
              <span className="sm:hidden">WebGIS DTI+</span>
              <span className="hidden sm:inline">WebGIS DTI+ | Phân hóa không gian phát triển số Việt Nam</span>
            </h1>
            <p className="text-[10px] sm:text-xs truncate hidden sm:block" style={{ color: 'var(--muted)' }}>
              Khoa Địa Lý - Đô Thị · ĐHKHXH&NV · ĐHQG TP.HCM · 2025
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileDataPanelOpen(true)}
            className="md:hidden px-2.5 py-1.5 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            Số liệu
          </button>
          <button
            type="button"
            onClick={() => setAboutModalOpen(true)}
            className="px-2 sm:px-3 py-1 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Giới thiệu
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-2 sm:px-3 py-1 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            {darkMode ? '☀' : '☾'}
            <span className="hidden sm:inline">{darkMode ? ' Sáng' : ' Tối'}</span>
          </button>
        </div>
      </header>
    </>
  );
}
