import { useMemo, useEffect, useState } from 'react';
import { DTI_DATA, getDTIForYear, getDTIForRegion } from '../data/dti-data';
import { useAppStore } from '../store/appStore';
import { fetchDTIData, fetchRegionsGeoJSON, DTIRow } from '../api';
import { DTIRecord, RegionId, Year } from '../types';

const BACKEND_ENABLED = import.meta.env.VITE_BACKEND_ENABLED === 'true';
let cachedApiData: DTIRecord[] | null = null;
let apiDataPromise: Promise<DTIRecord[]> | null = null;
let cachedGeoJSON: GeoJSON.FeatureCollection | null = null;
let geoJSONPromise: Promise<GeoJSON.FeatureCollection | null> | null = null;
let loggedDataSource: 'backend' | 'static' | null = null;

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

function logDataSource(source: 'backend' | 'static'): void {
  if (loggedDataSource === source) return;
  loggedDataSource = source;
  console.log(`data: ${source}`);
}

export function useMapData() {
  const { selectedYear, selectedPillar } = useAppStore();
  const [apiData, setApiData] = useState<DTIRecord[] | null>(cachedApiData);
  const [loading, setLoading] = useState(false);

  // Fetch from API only when backend mode is explicitly enabled.
  useEffect(() => {
    if (!BACKEND_ENABLED) {
      logDataSource('static');
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiDataPromise ??= fetchDTIData()
      .then((rows) => {
        cachedApiData = rows.map(apiRowToRecord);
        return cachedApiData;
      });

    apiDataPromise
      .then((records) => {
        if (!cancelled) {
          setApiData(records);
          logDataSource('backend');
        }
      })
      .catch((err: Error) => {
        console.warn('[WebGIS DTI+] API unavailable, using static data:', err.message);
        setApiData(null); // fallback to static
        logDataSource('static');
        apiDataPromise = null;
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

export function useRegionsGeoJSON() {
  const [geoJSON, setGeoJSON] = useState<GeoJSON.FeatureCollection | null>(cachedGeoJSON);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!BACKEND_ENABLED) return;

    let cancelled = false;
    setLoading(true);

    geoJSONPromise ??= fetchRegionsGeoJSON().then((result) => {
      cachedGeoJSON = result;
      return result;
    });

    geoJSONPromise
      .then((result) => {
        if (!cancelled) setGeoJSON(result);
      })
      .catch((err: Error) => {
        console.warn('[WebGIS DTI+] PostGIS GeoJSON unavailable, using local GeoJSON:', err.message);
        setGeoJSON(null);
        geoJSONPromise = null;
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { geoJSON, loading };
}
