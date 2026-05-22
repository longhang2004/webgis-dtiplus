import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose: () => void;
}

export default function AboutModal({ onClose }: Props) {
  const { t } = useTranslation();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="absolute inset-0 z-[1200] flex min-h-0 items-end justify-center sm:items-center p-2 sm:p-4"
      style={{
        background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-full overflow-y-auto rounded-t-2xl border shadow-2xl sm:rounded-xl p-6 sm:p-8 touch-manipulation"
        style={{
          background: 'var(--panel)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          boxShadow: '0 30px 70px -20px rgba(0, 0, 0, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2
            id="about-modal-title"
            className="text-xl sm:text-2xl font-semibold leading-snug pr-2"
            style={{ color: 'var(--accent)' }}
          >
            {t('about.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-2xl leading-none w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80"
            style={{ color: 'var(--muted)', background: 'color-mix(in srgb, var(--border) 35%, transparent)' }}
            aria-label={t('about.close')}
          >
            ×
          </button>
        </div>
        <h3 className="text-base sm:text-lg font-semibold mb-5 leading-relaxed" style={{ color: 'var(--text)' }}>
          {t('about.subtitle')}
        </h3>
        <div className="space-y-5 text-base leading-relaxed" style={{ color: 'var(--text)' }}>
          <div>
            <p className="font-semibold mb-2 text-base" style={{ color: 'var(--accent2)' }}>
              {t('about.team_label')}
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-[var(--muted)]" style={{ color: 'var(--text)' }}>
              <li>{t('about.lead')}</li>
              <li>{t('about.member')}</li>
              <li>{t('about.supervisor')}</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2 text-base" style={{ color: 'var(--accent2)' }}>
              {t('about.institution_label')}
            </p>
            <p style={{ color: 'var(--text)' }}>
              {t('about.institution_desc')}
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2 text-base" style={{ color: 'var(--accent2)' }}>
              {t('about.dti_label')}
            </p>
            <p style={{ color: 'var(--text)' }}>
              {t('about.dti_desc')}
            </p>
          </div>
          <p
            className="italic pt-3 text-sm border-t"
            style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            {t('about.note_2025')}
          </p>
        </div>
      </div>
    </div>
  );
}
