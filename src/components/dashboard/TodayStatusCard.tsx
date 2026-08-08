import React from 'react';
import { Card } from '../ui/Card';
import { CheckIn } from '../../types';
import { Moon, Scale, Zap, Activity, Smile, RotateCcw } from 'lucide-react';

interface TodayStatusCardProps {
  checkIn: CheckIn | null;
  onRetakeCheckIn?: () => void;
}

export const TodayStatusCard: React.FC<TodayStatusCardProps> = ({
  checkIn,
  onRetakeCheckIn,
}) => {
  if (!checkIn) {
    return (
      <Card className="bg-[#111111] border-[#222222] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Today's Check-In Pending</h3>
            <p className="text-xs text-gray-400">Complete your daily check-in to track readiness.</p>
          </div>
          {onRetakeCheckIn && (
            <button
              onClick={onRetakeCheckIn}
              className="bg-[#10B981] hover:bg-[#059669] text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              Check In Now
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-sm font-bold text-white">Today's Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
            Check-In Complete
          </span>
          {onRetakeCheckIn && (
            <button
              onClick={onRetakeCheckIn}
              title="Update Check-In"
              className="text-gray-500 hover:text-gray-300 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* Sleep */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sleep</span>
          </div>
          <p className="text-base font-extrabold text-white">{checkIn.sleepHours} hrs</p>
        </div>

        {/* Weight */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Scale className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Weight</span>
          </div>
          <p className="text-base font-extrabold text-white">{checkIn.weightKg} kg</p>
        </div>

        {/* Energy */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Energy</span>
          </div>
          <p className="text-base font-extrabold text-white">{checkIn.energyLevel}/10</p>
        </div>

        {/* Mood */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Smile className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mood</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-white truncate">{checkIn.mood}</p>
        </div>

        {/* Soreness */}
        <div className="bg-[#181818] border border-[#262626] rounded-xl p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Soreness</span>
          </div>
          <p className="text-base font-extrabold text-white">{checkIn.soreness}</p>
        </div>
      </div>

      {checkIn.painNotes && (
        <div className="bg-[#181818] border border-rose-500/20 text-rose-300 p-2.5 rounded-xl text-xs flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-400">Pain Note</span>
          <span className="truncate">{checkIn.painNotes}</span>
        </div>
      )}
    </Card>
  );
};
