export type RegionId = 'TDMNPB' | 'DBSH' | 'BTB' | 'TN' | 'DNB' | 'DBSCL';
export type Year = 2020 | 2021 | 2022 | 2023 | 2024 | 2025;
export type Pillar = 'total' | 'gov' | 'econ' | 'soc';

export interface DTIRecord {
  regionId: RegionId;
  year: Year;
  total: number;
  gov: number;
  econ: number;
  soc: number;
  isEstimate: boolean;
}

export interface RegionMeta {
  id: RegionId;
  name: string;
  shortName: string;
  provinces: string[];
  area_km2: number;
  population_2023: number;
}

export interface AppState {
  selectedYear: Year;
  selectedPillar: Pillar;
  selectedRegion: RegionId | null;
  splitMode: boolean;
  splitYear: Year;
  darkMode: boolean;
  isPlaying: boolean;
}
