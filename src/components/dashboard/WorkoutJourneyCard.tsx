import React, { useState } from 'react';
import { workoutService, CompletedWorkoutRecord } from '../../services/workoutService';
import { progressService } from '../../services';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Clock,
  Dumbbell,
  AlertCircle,
  X,
  Award,
  Sparkles,
} from 'lucide-react';

interface WorkoutJourneyCardProps {
  onStartWorkout?: () => void;
}

export const WorkoutJourneyCard: React.FC<WorkoutJourneyCardProps> = ({ onStartWorkout }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState<{
    dateStr: string;
    record: CompletedWorkoutRecord | null;
    isToday: boolean;
    isRest: boolean;
    isUpcoming: boolean;
    isMissed: boolean;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // First day of month & number of days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  const completedHistory = workoutService.getCompletedWorkouts();
  const historyMap = new Map<string, CompletedWorkoutRecord>();
  completedHistory.forEach((rec) => historyMap.set(rec.date, rec));

  // PR dates
  const prs = progressService.getPRs();
  const prDates = new Set(prs.map((p) => p.date));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Day Click Handler
  const handleDayClick = (dayNum: number) => {
    const d = new Date(year, month, dayNum);
    const dateStr = d.toISOString().split('T')[0];
    const record = historyMap.get(dateStr) || null;

    const isToday = dateStr === todayStr;
    const isPast = d < todayObj && !isToday;
    const isUpcoming = d > todayObj;
    const dayOfWeek = d.getDay();
    const isRest = dayOfWeek === 0 || dayOfWeek === 3; // Sun & Wed rest days by default

    const isMissed = isPast && !record && !isRest;

    setSelectedDayRecord({
      dateStr,
      record,
      isToday,
      isRest,
      isUpcoming,
      isMissed,
    });
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 hover:border-[#333333] transition-all relative">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Workout Journey Calendar</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Single source of truth for training consistency & streaks
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-[#181818] border border-[#262626] rounded-xl px-3 py-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white min-w-[100px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
          <span key={i} className="text-[11px] font-bold text-gray-500 uppercase tracking-wider py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Empty padding cells before 1st day */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 sm:h-11 rounded-xl bg-transparent" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const d = new Date(year, month, dayNum);
          const dateStr = d.toISOString().split('T')[0];
          const isToday = dateStr === todayStr;
          const record = historyMap.get(dateStr);

          const isPast = d < todayObj && !isToday;
          const isUpcoming = d > todayObj;
          const dayOfWeek = d.getDay();
          const isRest = dayOfWeek === 0 || dayOfWeek === 3; // Scheduled rest days
          const isMissed = isPast && !record && !isRest;
          const hasPR = prDates.has(dateStr);

          // Determine status color styling
          let bgStyle = 'bg-[#181818] text-gray-400 hover:border-[#333333]';
          let badgeIcon = null;

          if (record) {
            bgStyle = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 font-bold';
            badgeIcon = <Check className="w-3 h-3 text-[#10B981]" />;
          } else if (isToday) {
            bgStyle = 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B] font-extrabold ring-2 ring-[#F59E0B]/30';
          } else if (isMissed) {
            bgStyle = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
          } else if (isRest) {
            bgStyle = 'bg-[#222222] text-gray-500 border-[#2a2a2a]';
          } else if (isUpcoming) {
            bgStyle = 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20';
          }

          return (
            <button
              key={dayNum}
              onClick={() => handleDayClick(dayNum)}
              className={`h-9 sm:h-11 rounded-xl border flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer ${bgStyle}`}
            >
              <span className="text-xs sm:text-sm">{dayNum}</span>
              {hasPR && !record && (
                <Award className="w-2.5 h-2.5 text-amber-400 absolute top-1 right-1" />
              )}
              {badgeIcon && <div className="mt-0.5">{badgeIcon}</div>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#222222] text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#10B981]/20 border border-[#10B981]/50" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#F59E0B]/20 border border-[#F59E0B]" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#3B82F6]/20 border border-[#3B82F6]/50" />
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#222222] border border-[#333333]" />
          <span>Rest</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/50" />
          <span>Missed</span>
        </div>
      </div>

      {/* Selected Day Workout Summary Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#222222] rounded-3xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedDayRecord(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full bg-[#181818] border border-[#262626]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider block">
                  {selectedDayRecord.dateStr}
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {selectedDayRecord.record?.title || (selectedDayRecord.isRest ? 'Rest & Recovery Day' : 'Workout Session')}
                </h3>
              </div>
            </div>

            {/* Status Banner */}
            <div className="p-3.5 rounded-2xl border text-xs flex items-center justify-between">
              <span className="text-gray-400 font-medium">Day Status</span>
              {selectedDayRecord.record ? (
                <span className="font-extrabold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/30">
                  ✓ Workout Completed ({selectedDayRecord.record.completionPercentage}%)
                </span>
              ) : selectedDayRecord.isToday ? (
                <span className="font-extrabold text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/30">
                  ● Scheduled Today
                </span>
              ) : selectedDayRecord.isRest ? (
                <span className="font-extrabold text-gray-400 bg-[#222222] px-3 py-1 rounded-full border border-[#333333]">
                  ○ Active Rest Day
                </span>
              ) : selectedDayRecord.isMissed ? (
                <span className="font-extrabold text-[#EF4444] bg-[#EF4444]/10 px-3 py-1 rounded-full border border-[#EF4444]/30">
                  ✕ Missed Day (Rescheduled)
                </span>
              ) : (
                <span className="font-extrabold text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1 rounded-full border border-[#3B82F6]/30">
                  ▲ Upcoming Session
                </span>
              )}
            </div>

            {/* Workout Details if Completed */}
            {selectedDayRecord.record ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-[#181818] border border-[#262626]">
                    <span className="text-gray-400 block text-[10px]">Duration</span>
                    <span className="text-base font-bold text-white flex items-center gap-1.5 mt-1">
                      <Clock className="w-4 h-4 text-[#10B981]" />
                      {selectedDayRecord.record.durationMinutes} mins
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#181818] border border-[#262626]">
                    <span className="text-gray-400 block text-[10px]">Calories Burned</span>
                    <span className="text-base font-bold text-white flex items-center gap-1.5 mt-1">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {selectedDayRecord.record.caloriesBurned || 380} kcal
                    </span>
                  </div>
                </div>

                {/* Exercises list */}
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Executed Exercises
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedDayRecord.record.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#161616] border border-[#222222] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white">{ex.name}</span>
                        <span className="text-gray-400 font-mono">
                          {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} sets
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coach notes */}
                {selectedDayRecord.record.coachNotes && (
                  <div className="p-3.5 rounded-2xl bg-[#10B981]/5 border border-[#10B981]/20 text-xs space-y-1">
                    <span className="font-bold text-[#10B981] block">Coach Insight:</span>
                    {selectedDayRecord.record.coachNotes.map((note, i) => (
                      <p key={i} className="text-gray-300">
                        • {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : selectedDayRecord.isToday && onStartWorkout ? (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-gray-300">
                  Today's session is pending execution. Tap below to launch the live workout engine.
                </p>
                <button
                  onClick={() => {
                    setSelectedDayRecord(null);
                    onStartWorkout();
                  }}
                  className="w-full py-3 bg-[#10B981] hover:bg-[#0ea673] text-black font-bold rounded-2xl transition-all text-xs"
                >
                  Start Today's Workout
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] text-xs text-gray-400">
                {selectedDayRecord.isRest
                  ? 'Scheduled recovery day for central nervous system restoration.'
                  : selectedDayRecord.isMissed
                  ? 'Session was missed. Physique AI automatically adjusted weekly progression to preserve recovery.'
                  : 'Upcoming session scheduled in your weekly hypertrophy split.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
