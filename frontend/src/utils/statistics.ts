import { DTIRecord, Pillar } from '../types';

export function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function stddev(values: number[]): number {
  const m = mean(values);
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length);
}

export function cv(values: number[]): number {
  const m = mean(values);
  if (m === 0) return 0;
  return (stddev(values) / m) * 100;
}

export function computeStats(records: DTIRecord[], pillar: Pillar) {
  const values = records.map((r) => r[pillar]);
  const sorted = [...records].sort((a, b) => b[pillar] - a[pillar]);
  return {
    mean: mean(values),
    range: Math.max(...values) - Math.min(...values),
    cv: cv(values),
    highest: sorted[0],
    lowest: sorted[sorted.length - 1],
  };
}

export function getRanking(records: DTIRecord[], pillar: Pillar): DTIRecord[] {
  return [...records].sort((a, b) => b[pillar] - a[pillar]);
}

export function getYoYChange(
  records: DTIRecord[],
  regionId: string,
  year: number,
  pillar: Pillar
): number | null {
  const current = records.find((r) => r.regionId === regionId && r.year === year);
  const prev = records.find((r) => r.regionId === regionId && r.year === year - 1);
  if (!current || !prev) return null;
  return current[pillar] - prev[pillar];
}
