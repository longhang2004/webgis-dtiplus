import { Pillar } from '../types';

export function getDTIColor(value: number): string {
  if (value > 0.70) return '#00d4aa';
  if (value > 0.60) return '#1ea06e';
  if (value > 0.50) return '#c8b91e';
  if (value > 0.40) return '#c8641e';
  return '#8b2323';
}

export function getDTIColorLabel(value: number): string {
  if (value > 0.70) return 'Rất cao';
  if (value > 0.60) return 'Cao';
  if (value > 0.50) return 'Trung bình';
  if (value > 0.40) return 'Thấp';
  return 'Rất thấp';
}

export const REGION_COLORS: Record<string, string> = {
  DBSH:   '#00d4aa',
  DNB:    '#0ea5e9',
  BTB:    '#8b5cf6',
  DBSCL:  '#f59e0b',
  TDMNPB: '#ef4444',
  TN:     '#ec4899',
};

export const PILLAR_LABELS: Record<Pillar, string> = {
  total: 'DTI+ Tổng hợp',
  gov:   'Chính quyền số',
  econ:  'Kinh tế số',
  soc:   'Xã hội số',
};
