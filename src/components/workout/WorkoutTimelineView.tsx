import React, { useState } from 'react';
import { workoutService, WeeklyScheduleItem } from '../../services/workoutService';
import { workoutPlanner } from '../../intelligence/workoutPlanner';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  RefreshCw,
  X,
  Sparkles,
  Flame,
  ShieldCheck,
  AlertCircle,
  Moon,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface WorkoutTimelineViewProps {
  onStartWorkout?: () => void;
}

export const WorkoutTimelineView: React.FC<WorkoutTimelineViewProps> = ({ onStartWorkout }) => {
  const schedule = workoutService.getWeeklySchedule();
  const todayWorkout = workoutService.getTodayWorkout();
  const tomorrowWorkout = workoutService.getTomorrowWorkout();

  const [selectedDay, setSelectedDay] = useState<WeeklyScheduleItem | null>(null);

  const getStatusBadge = (item: WeeklyScheduleItem) => {
    if (item.isCompleted) {
      return (
        <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/20 border border-[#10B981]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> COMPLETED
        </span>
      );
    }
    if (item.isToday) {
      return (
        <span className="text-[10px] font-extrabold text-[#3B82F6] bg-[#3B82F6]/20 border border-[#3B82F6]/40 px-2 py-0.5 rounded-full">
          TODAY
        </span>
      );
    }
    if (item.isRest) {
      return (
        <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Moon className="w-3 h-3" /> REST DAY
        </span>
      );
    }
    // Check if day is past and not completed -> MISSED
    const currentDayIdx = new Date().getDay();
    const dayIndices: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    const itemDayIdx = dayIndices[item.dayName] ?? 0;

    if (itemDayIdx < currentDayIdx && !item.isCompleted) {
      return (
        <span className="text-[10px] font-extrabold text-red-400 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> MISSED
        </span>
      );
    }

    return (
      <span className="text-[10px] font-extrabold text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">
        UPCOMING
      </span>
    );
  };

  const getCardStyle = (item: WeeklyScheduleItem) => {
    if (item.isCompleted) return 'bg-[#10B981]/10 border-[#10B981]/40 text-white hover:border-[#10B981]';
    if (item.isToday) return 'bg-[#111111] border-[#3B82F6] text-white ring-2 ring-[#3B82F6]/20 hover:border-blue-400';
    if (item.isRest) return 'bg-[#141414] border-[#222222] text-gray-400 hover:border-purple-500/40';
    return 'bg-[#181818] border-[#262626] text-gray-300 hover:border-[#333333]';
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Weekly Split Schedule Header */}
      <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-lg font-bold text-white tracking-tight">7-Day Dynamic Hypertrophy Timeline</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any day to inspect full exercise breakdown, sets, tempo, and AI coach notes
            </p>
          </div>

          <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
            <RefreshCw className="w-3 h-3 animate-spin-slow text-[#10B981]" />
            Adaptive Intelligence Active
          </span>
        </div>

        {/* 7-Day Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {schedule.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(item)}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between text-left transition-all relative cursor-pointer group ${getCardStyle(
                item
              )}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">
                    {item.dayName} {item.dayNumber}
                  </span>
                  {getStatusBadge(item)}
                </div>

                <h3 className="text-sm font-extrabold text-white leading-tight mb-1 group-hover:text-[#10B981] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-gray-400 line-clamp-2">{item.focus}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#222222] text-[10px] text-gray-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#10B981]" />
                  {item.durationMinutes ? `${item.durationMinutes}m` : 'Rest'}
                </span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Today vs Tomorrow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-full">
              Today's Session
            </span>
            <span className="text-xs text-gray-400">45 Minutes</span>
          </div>

          <h3 className="text-2xl font-black text-white">{todayWorkout.title}</h3>

          <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#262626] text-xs text-gray-300">
            Target exercises include compound pushes, tempo bench press, incline flys, and tricep pressdowns.
          </div>

          {onStartWorkout && (
            <button
              onClick={onStartWorkout}
              className="w-full py-3.5 bg-[#10B981] hover:bg-[#0ea673] text-black font-extrabold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#10B981]/10"
            >
              <Dumbbell className="w-4 h-4 fill-black" />
              <span>Launch Live Workout Engine</span>
            </button>
          )}
        </div>

        {/* Tomorrow's Focus */}
        <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-3 py-1 rounded-full">
              Tomorrow's Preview
            </span>
            <span className="text-xs text-gray-400">{tomorrowWorkout.durationMinutes} Minutes</span>
          </div>

          <h3 className="text-2xl font-black text-white">{tomorrowWorkout.title}</h3>

          <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#262626] text-xs space-y-1">
            <span className="text-gray-400 block font-semibold">Coach Priority:</span>
            <p className="text-gray-200">{tomorrowWorkout.coachFocus}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] text-[11px] text-gray-400 flex items-center justify-between">
            <span>Equipment Required:</span>
            <span className="font-bold text-white">{tomorrowWorkout.equipment}</span>
          </div>
        </div>
      </div>

      {/* Day Inspection Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#222222] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#10B981]">
                    {selectedDay.dayName} {selectedDay.dayNumber}
                  </span>
                  {getStatusBadge(selectedDay)}
                </div>
                <h3 className="text-2xl font-black text-white">{selectedDay.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedDay.focus}</p>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-full bg-[#181818] hover:bg-[#222222] text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDay.isRest ? (
              <div className="text-center py-8 space-y-3 bg-[#161616] rounded-2xl border border-[#222222] p-6">
                <Moon className="w-10 h-10 text-purple-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Active Recovery Day</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Focus on mobility, hydration (3L+), light stretching, and high protein intake. Your CNS and muscle fibers repair today for maximal hypertrophy tomorrow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-400 bg-[#181818] p-3 rounded-2xl border border-[#262626]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#10B981]" />
                    {selectedDay.durationMinutes} Minutes Session
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Dumbbell className="w-4 h-4" />
                    Hypertrophy Focus
                  </span>
                </div>

                {/* Sample Exercises Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                    Exercise Structure & Prescribed Sets
                  </h4>

                  <div className="space-y-2">
                    {selectedDay.title.includes('Chest') || selectedDay.title.includes('Push') ? (
                      <>
                        <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">Incline Barbell Press</span>
                            <span className="text-[11px] text-gray-400">4 Sets × 8-10 Reps • Tempo 3-0-1-0</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">RPE 8.5</span>
                        </div>
                        <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">Flat Cable Flyes</span>
                            <span className="text-[11px] text-gray-400">3 Sets × 12 Reps • Peak Contraction</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">RPE 8</span>
                        </div>
                        <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">Overhead Rope Tricep Extension</span>
                            <span className="text-[11px] text-gray-400">3 Sets × 12-15 Reps • Deep Stretch</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">RPE 9</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">Lat Pulldown / Pullups</span>
                            <span className="text-[11px] text-gray-400">4 Sets × 10 Reps • Controlled Squeeze</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">RPE 8.5</span>
                        </div>
                        <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">Incline Dumbbell Curl</span>
                            <span className="text-[11px] text-gray-400">3 Sets × 12 Reps • Full Range</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">RPE 8</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Coach Protocol */}
                <div className="p-3.5 bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-[#10B981] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Coach Guidance
                  </span>
                  <p className="text-gray-300 leading-relaxed">
                    Maintain progressive overload. Increase load by 2.5kg if you complete all prescribed target reps with clean form.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2">
              {selectedDay.isToday && onStartWorkout && !selectedDay.isCompleted && (
                <button
                  onClick={() => {
                    setSelectedDay(null);
                    onStartWorkout();
                  }}
                  className="w-full py-3.5 bg-[#10B981] hover:bg-[#0ea673] text-black font-extrabold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#10B981]/10"
                >
                  <Dumbbell className="w-4 h-4 fill-black" />
                  <span>Start This Workout Now</span>
                </button>
              )}

              <button
                onClick={() => setSelectedDay(null)}
                className="w-full mt-2 py-3 bg-[#181818] hover:bg-[#222222] text-gray-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

