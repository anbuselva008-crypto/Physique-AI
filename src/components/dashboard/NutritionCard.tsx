import React from 'react';
import { Utensils } from 'lucide-react';

interface NutritionCardProps {
  consumedCalories?: number;
  targetCalories?: number;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  consumedCalories = 0,
  targetCalories = 2200,
}) => {
  const caloriePercentage = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 flex flex-col justify-between min-h-[200px] hover:border-[#333333] transition-colors">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center border border-[#10B981]/20">
          <Utensils className="w-6 h-6 text-[#10B981]" />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nutrition</span>
      </div>

      <div className="mt-6">
        <p className="text-3xl font-bold text-white tracking-tight">
          {remainingCalories.toLocaleString()}
          <span className="text-lg font-normal text-gray-500 ml-1">kcal left</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Consumed: {consumedCalories.toLocaleString()} / {targetCalories.toLocaleString()} kcal
        </p>
        <div className="w-full bg-[#222222] h-2 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-[#10B981] h-full rounded-full transition-all duration-300"
            style={{ width: `${caloriePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
