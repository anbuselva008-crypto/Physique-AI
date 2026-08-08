import React from 'react';
import { Play } from 'lucide-react';

interface TodayMissionCardProps {
  workoutTitle?: string;
  durationMinutes?: number;
  onStartWorkout?: () => void;
}

export const TodayMissionCard: React.FC<TodayMissionCardProps> = ({
  workoutTitle = 'Chest + Triceps',
  durationMinutes = 45,
  onStartWorkout,
}) => {
  return (
    <section className="relative group">
      {/* Blurred green backdrop glow */}
      <div className="absolute -inset-0.5 bg-[#10B981] opacity-15 rounded-[32px] blur-xl pointer-events-none" />

      <div className="relative bg-[#111111] border border-[#222222] rounded-[32px] p-6 sm:p-8 flex items-center justify-between">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold uppercase tracking-wider border border-[#10B981]/20">
            Today's Mission
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {workoutTitle}
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Hypertrophy Session • {durationMinutes} Minutes
            </p>
          </div>

          <button
            onClick={onStartWorkout}
            className="mt-4 px-8 py-4 bg-[#10B981] hover:bg-[#0ea673] text-[#050505] font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/10 active:scale-[0.98] cursor-pointer w-full sm:w-auto"
          >
            <Play className="w-5 h-5 fill-[#050505]" />
            <span>Start Workout</span>
          </button>
        </div>

        {/* Circular Progress Indicator for larger screens */}
        <div className="hidden md:block pl-6">
          <div className="w-40 h-40 rounded-full border-8 border-[#222222] relative flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[#10B981]"
                strokeDasharray="264"
                strokeDashoffset="66"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <span className="text-2xl font-bold block text-white">75%</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Goal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
