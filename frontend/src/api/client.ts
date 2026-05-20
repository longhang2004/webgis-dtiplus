/**
 * API Client for WebGIS DTI+ Backend
 * Architecture: RESTful API with JSON, CORS enabled
 * Backend: Node.js v18 + Express.js v4
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data: T;
}

async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface DTIRow {
  region_id: string;
  year: number;
  total: number;
  gov: number;
  econ: number;
  soc: number;
  is_estimate: boolean;
}

export interface RegionRow {
  id: string;
  name: string;
  short_name: string;
  provinces: string[] | null;
  area_km2: number;
  population: number;
}

export interface StatsResponse {
  year: number;
  pillar: string;
  mean: number;
  stddev: number;
  cv: number;
  max: number;
  min: number;
  range: number;
  highest: { region_id: string; value: number };
  lowest: { region_id: string; value: number };
}

export interface CompareResponse {
  from: number;
  to: number;
  pillar: string;
  data: Array<{
    region_id: string;
    value_from: number;
    value_to: number;
    absolute_change: number;
    pct_change: number;
    cagr: number;
  }>;
}

/**
 * Fetch all DTI+ data, optionally filtered by year and/or region
 */
export async function fetchDTIData(params?: {
  year?: number;
  region_id?: string;
  pillar?: string;
}): Promise<DTIRow[]> {
  const queryParams: Record<string, string> = {};
  if (params?.year) queryParams.year = String(params.year);
  if (params?.region_id) queryParams.region_id = params.region_id;
  if (params?.pillar) queryParams.pillar = params.pillar;

  const result = await fetchApi<ApiResponse<DTIRow[]>>('/dti', queryParams);
  return result.data;
}

/**
 * Fetch aggregate statistics for a year/pillar
 */
export async function fetchDTIStats(year: number, pillar?: string): Promise<StatsResponse> {
  const params: Record<string, string> = { year: String(year) };
  if (pillar) params.pillar = pillar;
  return fetchApi<StatsResponse>('/dti/stats', params);
}

/**
 * Fetch comparison data between two years
 */
export async function fetchDTICompare(from: number, to: number, pillar?: string): Promise<CompareResponse> {
  const params: Record<string, string> = { from: String(from), to: String(to) };
  if (pillar) params.pillar = pillar;
  return fetchApi<CompareResponse>('/dti/compare', params);
}

/**
 * Fetch all regions metadata
 */
export async function fetchRegions(): Promise<RegionRow[]> {
  const result = await fetchApi<ApiResponse<RegionRow[]>>('/regions');
  return result.data;
}

/**
 * Fetch GeoJSON for regions from PostGIS
 */
export async function fetchRegionsGeoJSON(): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const result = await fetchApi<GeoJSON.FeatureCollection>('/geojson/regions');
    if (result.features && result.features.length > 0) {
      return result;
    }
    return null; // No geometry in DB, use local fallback
  } catch {
    return null;
  }
}

/**
 * Health check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const result = await fetchApi<{ status: string }>('/health');
    return result.status === 'ok';
  } catch {
    return false;
  }
}
