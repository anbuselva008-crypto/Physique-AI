import React from 'react';
import { workoutService } from '../../services/workoutService';
import { ArrowRight, Clock, Dumbbell, ShieldCheck, Zap } from 'lucide-react';

interface TomorrowWorkoutCardProps {
  onViewSplit?: () => void;
}

export const TomorrowWorkoutCard: React.FC<TomorrowWorkoutCardProps> = ({ onViewSplit }) => {
  const tomorrow = workoutService.getTomorrowWorkout();

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 hover:border-[#333333] transition-all relative overflow-hidden group">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#3B82F6]/10 transition-all duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2.5 py-1 rounded-full">
            Tomorrow
          </span>
          <span className="text-xs text-gray-400 font-medium">Up Next</span>
        </div>

        {onViewSplit && (
          <button
            onClick={onViewSplit}
            className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Full Split</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="relative z-10 space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {tomorrow.title}
        </h3>

        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          {tomorrow.focus}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-[#181818] border border-[#262626]">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Duration
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 mt-1">
              <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
              {tomorrow.durationMinutes} mins
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#181818] border border-[#262626]">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Recovery
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              {tomorrow.recoveryRequired}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#181818] border border-[#262626] col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Equipment
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 mt-1 truncate">
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              {tomorrow.equipment}
            </span>
          </div>
        </div>

        {/* Coach Focus */}
        <div className="p-3.5 rounded-2xl bg-[#181818]/80 border border-[#262626] flex items-center gap-2.5 text-xs">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-gray-300 font-medium">
            <strong className="text-white">Coach Focus:</strong> {tomorrow.coachFocus}
          </p>
        </div>
      </div>
    </div>
  );
};
