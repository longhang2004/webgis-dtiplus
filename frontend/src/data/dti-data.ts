import { DTIRecord, RegionId, Year } from '../types';

const RAW: Record<string, Record<Year, { total: number; gov: number; econ: number; soc: number }>> = {
  DBSH: {
    2020: { total: 0.612, gov: 0.632, econ: 0.595, soc: 0.608 },
    2021: { total: 0.645, gov: 0.668, econ: 0.628, soc: 0.638 },
    2022: { total: 0.681, gov: 0.712, econ: 0.658, soc: 0.673 },
    2023: { total: 0.714, gov: 0.745, econ: 0.692, soc: 0.704 },
    2024: { total: 0.742, gov: 0.768, econ: 0.718, soc: 0.741 },
    2025: { total: 0.771, gov: 0.792, econ: 0.748, soc: 0.774 },
  },
  DNB: {
    2020: { total: 0.588, gov: 0.601, econ: 0.612, soc: 0.552 },
    2021: { total: 0.621, gov: 0.634, econ: 0.648, soc: 0.582 },
    2022: { total: 0.658, gov: 0.681, econ: 0.673, soc: 0.621 },
    2023: { total: 0.697, gov: 0.718, econ: 0.705, soc: 0.668 },
    2024: { total: 0.726, gov: 0.742, econ: 0.731, soc: 0.706 },
    2025: { total: 0.758, gov: 0.771, econ: 0.762, soc: 0.742 },
  },
  BTB: {
    2020: { total: 0.447, gov: 0.458, econ: 0.428, soc: 0.455 },
    2021: { total: 0.475, gov: 0.489, econ: 0.458, soc: 0.478 },
    2022: { total: 0.512, gov: 0.534, econ: 0.493, soc: 0.509 },
    2023: { total: 0.541, gov: 0.562, econ: 0.522, soc: 0.540 },
    2024: { total: 0.573, gov: 0.591, econ: 0.552, soc: 0.575 },
    2025: { total: 0.601, gov: 0.618, econ: 0.582, soc: 0.604 },
  },
  DBSCL: {
    2020: { total: 0.413, gov: 0.422, econ: 0.398, soc: 0.420 },
    2021: { total: 0.441, gov: 0.449, econ: 0.425, soc: 0.448 },
    2022: { total: 0.473, gov: 0.487, econ: 0.461, soc: 0.471 },
    2023: { total: 0.502, gov: 0.514, econ: 0.488, soc: 0.503 },
    2024: { total: 0.531, gov: 0.538, econ: 0.518, soc: 0.537 },
    2025: { total: 0.558, gov: 0.564, econ: 0.548, soc: 0.562 },
  },
  TDMNPB: {
    2020: { total: 0.384, gov: 0.392, econ: 0.368, soc: 0.393 },
    2021: { total: 0.412, gov: 0.421, econ: 0.396, soc: 0.420 },
    2022: { total: 0.443, gov: 0.461, econ: 0.425, soc: 0.443 },
    2023: { total: 0.472, gov: 0.488, econ: 0.451, soc: 0.478 },
    2024: { total: 0.501, gov: 0.512, econ: 0.481, soc: 0.511 },
    2025: { total: 0.528, gov: 0.536, econ: 0.512, soc: 0.536 },
  },
  TN: {
    2020: { total: 0.332, gov: 0.338, econ: 0.315, soc: 0.342 },
    2021: { total: 0.358, gov: 0.365, econ: 0.342, soc: 0.368 },
    2022: { total: 0.387, gov: 0.401, econ: 0.371, soc: 0.389 },
    2023: { total: 0.416, gov: 0.428, econ: 0.398, soc: 0.421 },
    2024: { total: 0.448, gov: 0.452, econ: 0.428, soc: 0.462 },
    2025: { total: 0.475, gov: 0.478, econ: 0.462, soc: 0.484 },
  },
};

export const DTI_DATA: DTIRecord[] = Object.entries(RAW).flatMap(([regionId, years]) =>
  (Object.entries(years) as [string, { total: number; gov: number; econ: number; soc: number }][]).map(
    ([year, vals]) => ({
      regionId: regionId as RegionId,
      year: parseInt(year) as Year,
      ...vals,
      isEstimate: parseInt(year) === 2025,
    })
  )
);

export function getDTIValue(
  regionId: RegionId,
  year: Year,
  pillar: 'total' | 'gov' | 'econ' | 'soc'
): number {
  const record = DTI_DATA.find((d) => d.regionId === regionId && d.year === year);
  return record ? record[pillar] : 0;
}

export function getDTIForYear(year: Year): DTIRecord[] {
  return DTI_DATA.filter((d) => d.year === year);
}

export function getDTIForRegion(regionId: RegionId): DTIRecord[] {
  return DTI_DATA.filter((d) => d.regionId === regionId).sort((a, b) => a.year - b.year);
}
