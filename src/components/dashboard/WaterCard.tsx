import React from 'react';
import { Droplets, Plus } from 'lucide-react';

interface WaterCardProps {
  currentLiters?: number;
  targetLiters?: number;
  onAddWater?: () => void;
}

export const WaterCard: React.FC<WaterCardProps> = ({
  currentLiters = 1.2,
  targetLiters = 4.0,
  onAddWater,
}) => {
  const percentage = Math.min(100, Math.round((currentLiters / targetLiters) * 100));

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 flex flex-col justify-between min-h-[200px] hover:border-[#333333] transition-colors">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
          <Droplets className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Water</span>
          <button
            onClick={onAddWater}
            className="w-7 h-7 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-gray-300 flex items-center justify-center transition-colors cursor-pointer border border-[#2a2a2a]"
            title="Log Water (+250ml)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-3xl font-bold text-white tracking-tight">
          {currentLiters}
          <span className="text-lg font-normal text-gray-500 ml-1">/ {targetLiters}L</span>
        </p>
        <div className="w-full bg-[#222222] h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-blue-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
