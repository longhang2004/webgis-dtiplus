/**
 * API module - exports all API client functions
 * The frontend uses local static data unless VITE_BACKEND_ENABLED=true.
 * Set VITE_API_URL to point to the backend when backend mode is enabled.
 */
export {
  fetchDTIData,
  fetchDTIStats,
  fetchDTICompare,
  fetchRegions,
  fetchRegionsGeoJSON,
  checkHealth,
} from './client';

export type {
  DTIRow,
  RegionRow,
  StatsResponse,
  CompareResponse,
} from './client';
