import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { toggleDarkMode, darkMode, setMobileDataPanelOpen, setAboutModalOpen } = useAppStore();
  const { t, i18n } = useTranslation();

  const handleLanguageToggle = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
  };

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg flex shrink-0 items-center justify-center text-sm font-bold" style={{ background: 'var(--accent)', color: '#070e1c' }}>
            GIS
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text)' }}>
              <span className="sm:hidden">{t('header.app_title')}</span>
              <span className="hidden sm:inline">
                {t('header.app_subtitle')}
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs truncate hidden sm:block" style={{ color: 'var(--muted)' }}>
              {t('header.department')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="px-2 sm:px-3 py-1 text-xs rounded border transition-colors hover:opacity-80 font-semibold"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {i18n.language === 'vi' ? t('header.en') : t('header.vi')}
          </button>
          <button
            type="button"
            onClick={() => setMobileDataPanelOpen(true)}
            className="lg:hidden px-2.5 py-1.5 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            {t('header.data')}
          </button>
          <button
            type="button"
            onClick={() => setAboutModalOpen(true)}
            className="px-2 sm:px-3 py-1 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            {t('header.about')}
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-2 sm:px-3 py-1 text-xs rounded border transition-colors hover:opacity-80 whitespace-nowrap"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            {darkMode ? '☀' : '☾'}
            <span className="hidden sm:inline">
              {darkMode 
                ? ` ${t('header.light')}` 
                : ` ${t('header.dark')}`}
            </span>
          </button>
        </div>
      </header>
    </>
  );
}
