import React from 'react';
import { Card } from '../ui/Card';
import { MonthlyTransformationReport } from '../../vision/types';
import {
  Award,
  Target,
  Dumbbell,
  Utensils,
  Moon,
  Sparkles,
  CheckCircle2,
  Calendar,
  Flame,
} from 'lucide-react';

interface MonthlyReviewCardProps {
  report: MonthlyTransformationReport;
}

export const MonthlyReviewCard: React.FC<MonthlyReviewCardProps> = ({ report }) => {
  const {
    month,
    summary,
    photoComparisonSummary,
    workoutPerformanceSummary,
    nutritionAdherenceSummary,
    recoverySummary,
    recommendedPriorities,
    nextMonthObjectives,
    achievements,
    adherenceMetrics,
  } = report;

  return (
    <div className="space-y-6">
      {/* 1. Review Header Banner */}
      <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Monthly Transformation Review — {month}
              </h2>
              <p className="text-xs text-gray-400">
                Unified AI Synthesis of Vision, Workouts, Nutrition, Recovery, and Persona.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Verified</span>
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="text-xs text-gray-300 leading-relaxed bg-[#161616] p-3.5 rounded-xl border border-[#222222]">
          {summary}
        </p>

        {/* Adherence Gauge Metrics */}
        {adherenceMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#161616] border border-[#222222] p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-[#10B981]" />
                  <span>Workout Quality</span>
                </span>
                <span className="text-xs font-black text-[#10B981]">
                  {adherenceMetrics.workoutQualityPct}%
                </span>
              </div>
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full"
                  style={{ width: `${adherenceMetrics.workoutQualityPct}%` }}
                />
              </div>
            </div>

            <div className="bg-[#161616] border border-[#222222] p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-amber-400" />
                  <span>Nutrition Quality</span>
                </span>
                <span className="text-xs font-black text-amber-400">
                  {adherenceMetrics.nutritionQualityPct}%
                </span>
              </div>
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${adherenceMetrics.nutritionQualityPct}%` }}
                />
              </div>
            </div>

            <div className="bg-[#161616] border border-[#222222] p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Moon className="w-3 h-3 text-sky-400" />
                  <span>Recovery Score</span>
                </span>
                <span className="text-xs font-black text-sky-400">
                  {adherenceMetrics.recoveryQualityPct}%
                </span>
              </div>
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full"
                  style={{ width: `${adherenceMetrics.recoveryQualityPct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 2. Key Achievements & Next Month Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Achievements */}
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-xs font-extrabold text-white">Monthly Achievements</h3>
          </div>

          <ul className="space-y-2">
            {(achievements || [
              `Completed 3-Angle Monthly Photo Session for ${month}`,
              'Maintained targeted progressive overload volume',
              'Consistent protein adherence',
            ]).map((ach, i) => (
              <li
                key={i}
                className="bg-[#161616] border border-[#222222] p-3 rounded-xl text-xs text-gray-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <span>{ach}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Objectives */}
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-extrabold text-white">Next Month Priority Objectives</h3>
          </div>

          <ul className="space-y-2">
            {nextMonthObjectives.map((obj, i) => (
              <li
                key={i}
                className="bg-[#161616] border border-[#222222] p-3 rounded-xl text-xs text-gray-300 flex items-start gap-2"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 3. Detailed Pillar Summaries */}
      <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-white">Pillar Recalibration Summaries</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#161616] border border-[#222222] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vision & Recomposition</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{photoComparisonSummary}</p>
          </div>

          <div className="bg-[#161616] border border-[#222222] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Workout Progression</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{workoutPerformanceSummary}</p>
          </div>

          <div className="bg-[#161616] border border-[#222222] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Utensils className="w-3.5 h-3.5" />
              <span>Nutrition & Hydration</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{nutritionAdherenceSummary}</p>
          </div>

          <div className="bg-[#161616] border border-[#222222] p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <Moon className="w-3.5 h-3.5" />
              <span>Recovery & Sleep Protocol</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{recoverySummary}</p>
          </div>
        </div>
      </Card>

      {/* 4. Priorities List */}
      <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
        <h3 className="text-xs font-extrabold text-white">Actionable Coach Priorities</h3>

        <div className="space-y-2">
          {recommendedPriorities.map((p, i) => (
            <div
              key={i}
              className="bg-emerald-950/20 border border-[#10B981]/20 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300"
            >
              <span className="w-5 h-5 rounded-full bg-[#10B981] text-black font-extrabold text-[10px] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
