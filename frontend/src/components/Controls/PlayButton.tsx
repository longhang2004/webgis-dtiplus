import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { Year } from '../../types';

const YEARS: Year[] = [2020, 2021, 2022, 2023, 2024, 2025];

export default function PlayButton() {
  const { isPlaying, setIsPlaying, selectedYear, setYear } = useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        useAppStore.setState((s) => {
          const idx = YEARS.indexOf(s.selectedYear);
          const next = YEARS[(idx + 1) % YEARS.length];
          return { selectedYear: next };
        });
      }, 1200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  return (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
      style={{ background: isPlaying ? 'var(--accent)' : 'var(--border)', color: isPlaying ? '#070e1c' : 'var(--text)' }}
    >
      {isPlaying ? '⏸' : '▶'}
    </button>
  );
}
