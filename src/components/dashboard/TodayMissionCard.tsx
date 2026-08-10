import React from 'react';
import { Play, CheckCircle2, Clock, Flame, Dumbbell, Award, Sparkles } from 'lucide-react';
import { workoutService } from '../../services/workoutService';

interface TodayMissionCardProps {
  workoutTitle?: string;
  durationMinutes?: number;
  completionPercentage?: number;
  onStartWorkout?: () => void;
}

export const TodayMissionCard: React.FC<TodayMissionCardProps> = ({
  workoutTitle,
  durationMinutes,
  completionPercentage = 0,
  onStartWorkout,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkout = workoutService.load();
  const completedRecord = workoutService.getWorkoutForDate(todayStr);

  const title = completedRecord?.title || workoutTitle || todayWorkout.title || 'Chest + Triceps';
  const duration = completedRecord?.durationMinutes || durationMinutes || todayWorkout.durationMinutes || 45;
  const isCompleted = !!completedRecord || completionPercentage === 100;
  const inProgress = !isCompleted && completionPercentage > 0;

  const calories = completedRecord?.caloriesBurned || Math.round(duration * 8.5);
  const muscleGroups = todayWorkout.exercises.map((e) => e.name.split(' ')[0]).slice(0, 3).join(', ') || 'Chest, Triceps';

  const dashOffset = 264 * (1 - Math.min(100, Math.max(0, isCompleted ? 100 : completionPercentage)) / 100);

  return (
    <section className="relative group">
      {/* Blurred glow backdrop */}
      <div
        className={`absolute -inset-0.5 opacity-15 rounded-[32px] blur-xl pointer-events-none transition-all ${
          isCompleted ? 'bg-[#10B981]' : inProgress ? 'bg-amber-500' : 'bg-[#10B981]'
        }`}
      />

      <div className="relative bg-[#111111] border border-[#222222] rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-xl w-full">
          {/* Header Tag */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                isCompleted
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                  : inProgress
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Today's Mission Completed
                </>
              ) : inProgress ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  In Progress ({completionPercentage}%)
                </>
              ) : (
                "Today's Mission"
              )}
            </span>

            <span className="text-xs text-gray-400 font-medium bg-[#181818] px-2.5 py-1 rounded-lg border border-[#262626]">
              Intermediate • High Tension
            </span>
          </div>

          {/* Title & Info */}
          <div className="space-y-1.5">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base flex flex-wrap items-center gap-3 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#10B981]" />
                {duration} Mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="w-4 h-4" />
                ~{calories} kcal
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                {muscleGroups}
              </span>
            </p>
          </div>

          {/* Status / Button */}
          {isCompleted ? (
            <div className="pt-2 space-y-2">
              <div className="px-6 py-3.5 bg-[#10B981]/15 border border-[#10B981]/40 rounded-2xl flex items-center gap-3 text-[#10B981] font-extrabold text-sm sm:text-base">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>✓ Workout Completed Today</span>
              </div>
              <p className="text-xs text-gray-400 italic">
                "Excellent Work! See you tomorrow for your next scheduled split."
              </p>
            </div>
          ) : (
            <button
              onClick={onStartWorkout}
              className="mt-4 px-8 py-4 bg-[#10B981] hover:bg-[#0ea673] text-[#050505] font-extrabold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-[#10B981]/15 active:scale-[0.98] cursor-pointer w-full sm:w-auto text-base"
            >
              <Play className="w-5 h-5 fill-[#050505]" />
              <span>{inProgress ? 'Continue Workout' : 'Start Workout'}</span>
            </button>
          )}
        </div>

        {/* Circular Progress Indicator */}
        <div className="self-center md:self-auto flex-shrink-0">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-8 border-[#222222] relative flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[#10B981] transition-all duration-500"
                strokeDasharray="264"
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black block text-white font-mono">
                {isCompleted ? '100%' : `${completionPercentage}%`}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {isCompleted ? 'Finished' : 'Progress'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

