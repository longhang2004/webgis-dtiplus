import { useMemo, useEffect, useState } from 'react';
import { DTI_DATA, getDTIForYear, getDTIForRegion } from '../data/dti-data';
import { useAppStore } from '../store/appStore';
import { fetchDTIData, DTIRow } from '../api';
import { DTIRecord, RegionId, Year } from '../types';

const BACKEND_ENABLED = import.meta.env.VITE_BACKEND_ENABLED === 'true';

/**
 * Converts API row format to frontend DTIRecord format
 */
function apiRowToRecord(row: DTIRow): DTIRecord {
  return {
    regionId: row.region_id as RegionId,
    year: row.year as Year,
    total: Number(row.total),
    gov: Number(row.gov),
    econ: Number(row.econ),
    soc: Number(row.soc),
    isEstimate: row.is_estimate,
  };
}

export function useMapData() {
  const { selectedYear, selectedPillar } = useAppStore();
  const [apiData, setApiData] = useState<DTIRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch from API only when backend mode is explicitly enabled.
  useEffect(() => {
    if (!BACKEND_ENABLED) return;

    let cancelled = false;
    setLoading(true);

    fetchDTIData()
      .then((rows) => {
        if (!cancelled) {
          setApiData(rows.map(apiRowToRecord));
        }
      })
      .catch((err) => {
        console.warn('[WebGIS DTI+] API unavailable, using static data:', err.message);
        setApiData(null); // fallback to static
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const allData = useMemo(() => apiData ?? DTI_DATA, [apiData]);

  const yearData = useMemo(
    () => {
      if (apiData) {
        return apiData.filter((d) => d.year === selectedYear);
      }
      return getDTIForYear(selectedYear);
    },
    [selectedYear, apiData]
  );

  const regionTimeSeries = useMemo(
    () => (regionId: string) => {
      if (apiData) {
        return apiData
          .filter((d) => d.regionId === regionId)
          .sort((a, b) => a.year - b.year);
      }
      return getDTIForRegion(regionId as RegionId);
    },
    [apiData]
  );

  return { yearData, allData, regionTimeSeries, selectedYear, selectedPillar, loading };
}
