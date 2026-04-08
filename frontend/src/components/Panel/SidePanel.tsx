import { useAppStore } from '../../store/appStore';
import RegionDetail from './RegionDetail';
import RankingBars from './RankingBars';
import TrendChart from './TrendChart';
import StatsGrid from './StatsGrid';
import ComparisonPanel from './ComparisonPanel';

export default function SidePanel() {
  const splitMode = useAppStore((s) => s.splitMode);

  if (splitMode) {
    return <ComparisonPanel />;
  }

  return (
    <div className="p-3 space-y-4">
      <RegionDetail />
      <RankingBars />
      <TrendChart />
      <StatsGrid />
    </div>
  );
}
