import { useMemo } from 'react';
import { DTI_DATA, getDTIForYear, getDTIForRegion } from '../data/dti-data';
import { useAppStore } from '../store/appStore';

export function useMapData() {
  const { selectedYear, selectedPillar } = useAppStore();

  const yearData = useMemo(() => getDTIForYear(selectedYear), [selectedYear]);

  const allData = useMemo(() => DTI_DATA, []);

  const regionTimeSeries = useMemo(
    () => (regionId: string) => getDTIForRegion(regionId as never),
    []
  );

  return { yearData, allData, regionTimeSeries, selectedYear, selectedPillar };
}
