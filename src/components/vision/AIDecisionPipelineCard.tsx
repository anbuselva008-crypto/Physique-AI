import React from 'react';
import { Card } from '../ui/Card';
import { DecisionPipelineFlow } from '../../vision/types';
import {
  GitCommit,
  Eye,
  Dumbbell,
  Utensils,
  Moon,
  Target,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

interface AIDecisionPipelineCardProps {
  flows?: DecisionPipelineFlow[];
}

export const AIDecisionPipelineCard: React.FC<AIDecisionPipelineCardProps> = ({ flows }) => {
  if (!flows || flows.length === 0) {
    return (
      <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-[#10B981]" />
          <h3 className="text-base font-extrabold text-white">Why Did the AI Change My Program?</h3>
        </div>
        <p className="text-xs text-gray-400">
          No program recalibrations triggered in the current session. Maintain current progressive overload schedule.
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#222222] p-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-[#10B981]" />
          <div>
            <h3 className="text-base font-extrabold text-white">Why Did the AI Change My Program?</h3>
            <p className="text-xs text-gray-400">
              End-to-end multi-engine reasoning pipeline connecting visual findings directly to workout & diet adjustments.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20 self-start sm:self-auto">
          Multi-Engine Synchronized
        </span>
      </div>

      <div className="space-y-6">
        {flows.map((flow, index) => (
          <div key={index} className="bg-[#151515] border border-[#222222] rounded-2xl p-4.5 space-y-4">
            {/* Header / Problem Statement */}
            <div className="flex items-center justify-between bg-[#111111] p-3 rounded-xl border border-[#222222]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#10B981]/15 text-[#10B981] text-xs font-black flex items-center justify-center border border-[#10B981]/30">
                  0{index + 1}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Detected Target Issue
                  </span>
                  <h4 className="text-xs font-black text-white">{flow.detectedIssue}</h4>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-[#10B981]" />
            </div>

            {/* Pipeline Step-by-Step Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Step 1: Vision Evidence */}
              <div className="bg-[#111111] p-3.5 rounded-xl border border-[#222222] space-y-2 relative">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#10B981]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>1. Vision Evidence</span>
                </div>
                <ul className="space-y-1">
                  {flow.evidence.map((ev, i) => (
                    <li key={i} className="text-[11px] text-gray-300 leading-tight flex items-start gap-1">
                      <span className="text-[#10B981]">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step 2: Workout Engine */}
              <div className="bg-[#111111] p-3.5 rounded-xl border border-[#222222] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-400">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>2. Workout Adjustment</span>
                </div>
                <p className="text-[11px] text-gray-200 font-medium leading-tight">
                  {flow.workoutAdjustment}
                </p>
              </div>

              {/* Step 3: Nutrition & Recovery */}
              <div className="bg-[#111111] p-3.5 rounded-xl border border-[#222222] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>3. Nutrition & Recovery</span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-200">
                  <p><strong className="text-amber-400">Diet:</strong> {flow.nutritionAdjustment}</p>
                  <p><strong className="text-blue-400">Recovery:</strong> {flow.recoveryAdjustment}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Goal Impact & Coaching Cue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-emerald-950/20 border border-[#10B981]/30 p-3 rounded-xl flex items-start gap-2.5">
                <Target className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">
                    Goal Tracker Impact
                  </span>
                  <p className="text-xs font-semibold text-gray-200">{flow.goalImpact}</p>
                </div>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/30 p-3 rounded-xl flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    Coaching Cue Focus
                  </span>
                  <p className="text-xs font-semibold text-gray-200">{flow.coachFocus}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
