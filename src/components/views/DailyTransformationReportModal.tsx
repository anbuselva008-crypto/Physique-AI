import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DailyHistoryRecord } from '../../daily/dailyTransformationService';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Droplets,
  Coins,
  ArrowRight,
  Flame,
  Calendar,
  X,
  Target,
  Utensils,
  Dumbbell,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface DailyTransformationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DailyHistoryRecord | null;
  onUnlockEdit?: () => void;
}

export const DailyTransformationReportModal: React.FC<DailyTransformationReportModalProps> = ({
  isOpen,
  onClose,
  record,
  onUnlockEdit,
}) => {
  if (!isOpen || !record) return null;

  const { analysisReport, coachReview, nextDayPlan, nutrition, workout, progress } = record;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111111] border border-[#222222] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-[#181818] border border-[#262626] p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#222222] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981]/20 to-blue-500/20 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Daily Transformation Report</h2>
              <span className="text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                🔒 Day Completed
              </span>
            </div>
            <p className="text-xs text-gray-400">Date: {record.date} • Unified System Sync Complete</p>
          </div>
        </div>

        {/* Part 4: AI Coach Review Header Banner */}
        <div className="bg-gradient-to-r from-[#181818] to-[#121212] p-5 rounded-2xl border border-[#262626] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">Today's Coach Review</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-xl">
              <span className="text-xs text-amber-400 font-bold">Overall Score:</span>
              <span className="text-base font-black text-amber-400">{coachReview.overallScore} / 100</span>
            </div>
          </div>

          {/* Scores Breakdown */}
          <div className="grid grid-cols-5 gap-2 text-center pt-1">
            <div className="bg-[#111111] p-2 rounded-xl border border-[#222222]">
              <span className="text-[10px] text-gray-400 block">Workout</span>
              <span className="text-xs font-bold text-emerald-400">{coachReview.scores.workout}</span>
            </div>
            <div className="bg-[#111111] p-2 rounded-xl border border-[#222222]">
              <span className="text-[10px] text-gray-400 block">Nutrition</span>
              <span className="text-xs font-bold text-blue-400">{coachReview.scores.nutrition}</span>
            </div>
            <div className="bg-[#111111] p-2 rounded-xl border border-[#222222]">
              <span className="text-[10px] text-gray-400 block">Hydration</span>
              <span className="text-xs font-bold text-cyan-400">{coachReview.scores.hydration}</span>
            </div>
            <div className="bg-[#111111] p-2 rounded-xl border border-[#222222]">
              <span className="text-[10px] text-gray-400 block">Recovery</span>
              <span className="text-xs font-bold text-purple-400">{coachReview.scores.recovery}</span>
            </div>
            <div className="bg-[#111111] p-2 rounded-xl border border-[#222222]">
              <span className="text-[10px] text-gray-400 block">Discipline</span>
              <span className="text-xs font-bold text-amber-400">{coachReview.scores.discipline}</span>
            </div>
          </div>

          {/* Wins & Mistakes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#111111] rounded-xl border border-[#222222] space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Today's Biggest Win</span>
              </span>
              <p className="text-xs text-gray-200">{coachReview.biggestWin}</p>
            </div>
            <div className="p-3 bg-[#111111] rounded-xl border border-[#222222] space-y-1">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Today's Biggest Mistake</span>
              </span>
              <p className="text-xs text-gray-200">{coachReview.biggestMistake}</p>
            </div>
          </div>

          {/* Tomorrow's Mission */}
          <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-[#10B981]/30 flex items-center gap-3">
            <Target className="w-5 h-5 text-[#10B981] flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#10B981] block">Tomorrow's Mission</span>
              <p className="text-xs font-bold text-white">{coachReview.tomorrowMission}</p>
            </div>
          </div>
        </div>

        {/* Part 3: AI Nutrition Analysis Report */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-[#10B981]" />
            <span>Part 3: Today's AI Nutrition Analysis</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Protein */}
            <div className="p-3.5 bg-[#181818] rounded-2xl border border-[#262626] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Protein</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {analysisReport.protein.status}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-blue-400">{analysisReport.protein.actual}g</span>
                <span className="text-xs text-gray-500">/ {analysisReport.protein.target}g Target</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">{analysisReport.protein.text}</p>
            </div>

            {/* Carbs */}
            <div className="p-3.5 bg-[#181818] rounded-2xl border border-[#262626] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Carbohydrates</span>
                <span className="text-[10px] font-bold text-amber-400">
                  {analysisReport.carbs.missing > 0 ? `Missing ${analysisReport.carbs.missing}g` : 'Optimal'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-400">{analysisReport.carbs.actual}g</span>
                <span className="text-xs text-gray-500">/ {analysisReport.carbs.target}g Target</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">{analysisReport.carbs.suggestion}</p>
            </div>

            {/* Fats */}
            <div className="p-3.5 bg-[#181818] rounded-2xl border border-[#262626] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Fats</span>
                <span className="text-[10px] font-bold text-rose-400">
                  {analysisReport.fat.exceededBy > 0 ? `Exceeded by +${analysisReport.fat.exceededBy}g` : 'Balanced'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-rose-400">{analysisReport.fat.actual}g</span>
                <span className="text-xs text-gray-500">/ {analysisReport.fat.target}g Target</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">{analysisReport.fat.suggestion}</p>
            </div>

            {/* Water & Budget */}
            <div className="p-3.5 bg-[#181818] rounded-2xl border border-[#262626] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Water & Student Budget</span>
                <span className="text-[10px] font-bold text-cyan-400">{analysisReport.budget.status}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-cyan-400 font-extrabold">{analysisReport.water.actual}L / 3.0L Water</span>
                <span className="text-[#10B981] font-extrabold">₹{analysisReport.budget.spent} / ₹150 Cap</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">{analysisReport.water.suggestion}</p>
            </div>
          </div>
        </div>

        {/* Part 7 & 8: Tomorrow's Generated Protocol */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Part 7 & 8: Generated Tomorrow's Adaptive Protocol</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Workout */}
            <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Dumbbell className="w-4 h-4" />
                  <span className="text-xs font-bold">Tomorrow's Workout</span>
                </div>
                <span className="text-[10px] text-gray-400">{nextDayPlan.workout.durationMinutes} mins</span>
              </div>
              <p className="text-sm font-extrabold text-white">{nextDayPlan.workout.title}</p>
              <p className="text-[11px] text-gray-400">Goal: {nextDayPlan.workout.primaryGoal}</p>
              <div className="pt-1 text-[11px] text-gray-300 space-y-1 border-t border-[#222222]">
                {nextDayPlan.workout.exercisesSummary.slice(0, 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diet */}
            <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#10B981]">
                  <Utensils className="w-4 h-4" />
                  <span className="text-xs font-bold">Tomorrow's Meal Plan</span>
                </div>
                <span className="text-[10px] text-[#10B981] font-bold">₹{nextDayPlan.diet.estimatedBudgetInr} Total</span>
              </div>
              <div className="text-[11px] text-gray-300 space-y-1">
                <p><strong className="text-white">Breakfast:</strong> {nextDayPlan.diet.breakfast}</p>
                <p><strong className="text-white">Lunch:</strong> {nextDayPlan.diet.lunch}</p>
                <p><strong className="text-white">Dinner:</strong> {nextDayPlan.diet.dinner}</p>
              </div>
              <p className="text-[10px] text-[#10B981] font-bold border-t border-[#222222] pt-1">
                Target: {nextDayPlan.diet.totalCalories} kcal • {nextDayPlan.diet.totalProtein}g Protein
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-[#222222]">
          {onUnlockEdit ? (
            <button
              onClick={onUnlockEdit}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              Unlock & Edit Day
            </button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            onClick={onClose}
            className="text-xs font-bold py-2.5 px-6"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Acknowledge & Sync All Engines
          </Button>
        </div>
      </div>
    </div>
  );
};
