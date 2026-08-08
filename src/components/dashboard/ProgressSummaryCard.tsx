import React from 'react';
import { Card } from '../ui/Card';
import { ProgressSummary } from '../../types';
import { TrendingUp, TrendingDown, Scale, Flame, Dumbbell, Award, ArrowRight } from 'lucide-react';

interface ProgressSummaryCardProps {
  summary: ProgressSummary;
  onViewProgress?: () => void;
}

export const ProgressSummaryCard: React.FC<ProgressSummaryCardProps> = ({
  summary,
  onViewProgress,
}) => {
  const isWeightUp = summary.weeklyChangeKg > 0;
  const isWeightDown = summary.weeklyChangeKg < 0;

  return (
    <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-sm font-bold text-white">Progress Overview</h3>
        </div>
        {onViewProgress && (
          <button
            onClick={onViewProgress}
            className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Full Stats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Weight */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Scale className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Weight</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-white">{summary.currentWeightKg} kg</span>
            {summary.weeklyChangeKg !== 0 && (
              <span
                className={`text-[11px] font-bold flex items-center ${
                  isWeightDown ? 'text-[#10B981]' : isWeightUp ? 'text-amber-400' : 'text-gray-400'
                }`}
              >
                {isWeightUp ? '+' : ''}
                {summary.weeklyChangeKg}
              </span>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Streak</span>
          </div>
          <p className="text-base font-extrabold text-white">{summary.workoutStreak} Days</p>
        </div>

        {/* Last Workout */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
            <span>Last Session</span>
          </div>
          <p className="text-base font-extrabold text-white">{summary.lastWorkoutDate}</p>
        </div>

        {/* Latest PR */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Latest PR</span>
          </div>
          {summary.latestPR ? (
            <p className="text-xs font-bold text-white truncate">
              {summary.latestPR.exerciseName}: {summary.latestPR.weightKg}kg x{summary.latestPR.reps}
            </p>
          ) : (
            <p className="text-xs font-medium text-gray-500">No PR logged yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};
