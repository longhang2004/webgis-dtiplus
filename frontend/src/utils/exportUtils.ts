import { DTIRecord, Pillar, Year } from '../types';
import { REGION_META } from '../data/region-meta';
import { PILLAR_LABELS } from './colorScale';

export function exportCSV(records: DTIRecord[], year: Year, pillar: Pillar): void {
  const header = ['Vùng', 'Tên vùng', 'Năm', 'DTI+ Tổng hợp', 'Chính quyền số', 'Kinh tế số', 'Xã hội số', 'Ước tính'];
  const rows = records.map((r) => [
    r.regionId,
    REGION_META[r.regionId]?.name ?? r.regionId,
    r.year,
    r.total,
    r.gov,
    r.econ,
    r.soc,
    r.isEstimate ? 'Có' : 'Không',
  ]);
  const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DTI_plus_${pillar}_${year}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportMapPNG(elementId: string, filename = 'webgis-dtiplus.png'): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element, { backgroundColor: '#070e1c', useCORS: true });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
