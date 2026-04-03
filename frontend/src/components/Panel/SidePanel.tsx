import React from 'react';
import RegionDetail from './RegionDetail';
import RankingBars from './RankingBars';
import TrendChart from './TrendChart';
import StatsGrid from './StatsGrid';

export default function SidePanel() {
  return (
    <div className="p-3 space-y-4">
      <RegionDetail />
      <RankingBars />
      <TrendChart />
      <StatsGrid />
    </div>
  );
}
