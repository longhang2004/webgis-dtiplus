import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { RegionId, Year, Pillar } from '../types';

export function useUrlState() {
  const store = useAppStore();
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);

  // Read URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year');
    const pillar = params.get('pillar');
    const region = params.get('region');
    const mode = params.get('mode');
    const splitYear = params.get('splitYear');

    if (year) store.setYear(parseInt(year) as Year);
    if (pillar) store.setPillar(pillar as Pillar);
    if (region) store.setRegion(region as RegionId);
    if (mode === 'split') store.toggleSplitMode();
    if (splitYear) store.setSplitYear(parseInt(splitYear) as Year);
    setHydratedFromUrl(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL
  useEffect(() => {
    if (!hydratedFromUrl) return;

    const params = new URLSearchParams();
    params.set('year', String(store.selectedYear));
    params.set('pillar', store.selectedPillar);
    if (store.selectedRegion) params.set('region', store.selectedRegion);
    if (store.splitMode) {
      params.set('mode', 'split');
      params.set('splitYear', String(store.splitYear));
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [hydratedFromUrl, store.selectedYear, store.selectedPillar, store.selectedRegion, store.splitMode, store.splitYear]);
}
