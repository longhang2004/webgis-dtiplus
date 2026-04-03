import { create } from 'zustand';
import { RegionId, Year, Pillar, AppState } from '../types';

interface AppStore extends AppState {
  setYear: (year: Year) => void;
  setPillar: (pillar: Pillar) => void;
  setRegion: (region: RegionId | null) => void;
  toggleSplitMode: () => void;
  setSplitYear: (year: Year) => void;
  toggleDarkMode: () => void;
  setIsPlaying: (playing: boolean) => void;
  /** Slide-up panel for stats on viewports where the sidebar is hidden */
  mobileDataPanelOpen: boolean;
  setMobileDataPanelOpen: (open: boolean) => void;
  /** Intro modal: scoped to map area only (does not cover chrome / sidebar) */
  aboutModalOpen: boolean;
  setAboutModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedYear: 2023,
  selectedPillar: 'total',
  selectedRegion: null,
  splitMode: false,
  splitYear: 2020,
  darkMode: true,
  isPlaying: false,
  mobileDataPanelOpen: false,
  aboutModalOpen: false,

  setYear: (year) => set({ selectedYear: year }),
  setPillar: (pillar) => set({ selectedPillar: pillar }),
  setRegion: (region) => set({ selectedRegion: region }),
  toggleSplitMode: () => set((s) => ({ splitMode: !s.splitMode })),
  setSplitYear: (year) => set({ splitYear: year }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setMobileDataPanelOpen: (open) => set({ mobileDataPanelOpen: open }),
  setAboutModalOpen: (open) => set({ aboutModalOpen: open }),
}));
