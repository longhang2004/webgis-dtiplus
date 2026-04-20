import { Pillar } from '../types';

export function getDTIColor(value: number): string {
  if (value > 0.70) return '#00d4aa';
  if (value > 0.60) return '#1ea06e';
  if (value > 0.50) return '#c8b91e';
  if (value > 0.40) return '#c8641e';
  return '#8b2323';
}

export function getDTIColorLabel(value: number): string {
  if (value > 0.70) return 'very_high';
  if (value > 0.60) return 'high';
  if (value > 0.50) return 'medium';
  if (value > 0.40) return 'low';
  return 'very_low';
}

export const REGION_COLORS: Record<string, string> = {
  DBSH:   '#00d4aa',
  DNB:    '#0ea5e9',
  BTB:    '#8b5cf6',
  DBSCL:  '#f59e0b',
  TDMNPB: '#ef4444',
  TN:     '#ec4899',
};

