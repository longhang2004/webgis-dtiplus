import { useEffect } from 'react';
import Header from './Header';
import AboutModal from './AboutModal';
import MapSection from '../Map/MapSection';
import ControlBar from '../Controls/ControlBar';
import SidePanel from '../Panel/SidePanel';
import { useUrlState } from '../../hooks/useUrlState';
import { useAppStore } from '../../store/appStore';

export default function AppLayout() {
  useUrlState();
  const splitMode = useAppStore((s) => s.splitMode);
  const darkMode = useAppStore((s) => s.darkMode);

  // Sync dark/light class on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(darkMode ? 'dark' : 'light');
  }, [darkMode]);
  const mobileDataPanelOpen = useAppStore((s) => s.mobileDataPanelOpen);
  const setMobileDataPanelOpen = useAppStore((s) => s.setMobileDataPanelOpen);
  const aboutModalOpen = useAppStore((s) => s.aboutModalOpen);
  const setAboutModalOpen = useAppStore((s) => s.setAboutModalOpen);

  return (
    <div className="flex flex-col h-[100dvh] min-h-0 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Header />
      <ControlBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className={`flex-1 relative overflow-hidden min-h-0 ${splitMode ? 'flex' : ''}`} id="map-container">
          <MapSection />
          {aboutModalOpen && <AboutModal onClose={() => setAboutModalOpen(false)} />}
        </div>
        <aside
          className="overflow-y-auto border-l hidden md:block shrink-0"
          style={{ width: 'min(360px, 34vw)', minWidth: '260px', borderColor: 'var(--border)', background: 'var(--panel)' }}
        >
          <SidePanel />
        </aside>
      </div>

      {mobileDataPanelOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 w-full h-full border-0 cursor-default"
            style={{ background: 'rgba(7, 14, 28, 0.72)' }}
            aria-label="Đóng bảng số liệu"
            onClick={() => setMobileDataPanelOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 flex max-h-[88vh] flex-col rounded-t-2xl border-t shadow-2xl"
            style={{
              background: 'var(--panel)',
              borderColor: 'var(--border)',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
            }}
          >
            <div
              className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Bảng số liệu
              </span>
              <button
                type="button"
                onClick={() => setMobileDataPanelOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none hover:opacity-80"
                style={{ color: 'var(--muted)', background: 'rgba(26, 45, 77, 0.35)' }}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <SidePanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
