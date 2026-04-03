import { getDTIColor } from '../utils/colorScale';
import { Pillar, Year, RegionId } from '../types';
import { getDTIValue } from '../data/dti-data';

export function useColorScale(year: Year, pillar: Pillar) {
  const getColor = (regionId: RegionId): string => {
    const value = getDTIValue(regionId, year, pillar);
    return getDTIColor(value);
  };
  return { getColor };
}
