import React from 'react';
import { Card } from '../ui/Card';
import { ScientificExecutiveSummary, TransformationMomentum } from '../../vision/types';
import {
  TrendingUp,
  CheckCircle2,
  Minus,
  AlertTriangle,
  Target,
  Sparkles,
  Info,
  ShieldCheck,
  Flame,
  Activity,
  Award,
} from 'lucide-react';

interface ExecutiveSummaryCardProps {
  summary?: ScientificExecutiveSummary;
  month: string;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ summary, month }) => {
  if (!summary) {
    return null;
  }

  const momentumColorMap: Record<TransformationMomentum, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    Excellent: {
      bg: 'bg-[#10B981]/15',
      text: 'text-[#10B981]',
      border: 'border-[#10B981]/30',
      icon: <Flame className="w-4 h-4 text-[#10B981]" />,
    },
    Good: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    },
    Stable: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
    },
    Slow: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    },
    'At Risk': {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    },
  };

  const momConfig = momentumColorMap[summary.momentum] || momentumColorMap.Good;

  return (
    <Card className="bg-[#111111] border-[#222222] p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-[#10B981]" />
          <div>
            <h3 className="text-base font-extrabold text-white">Scientific Executive Summary</h3>
            <p className="text-xs text-gray-400">
              Evidence-based progress diagnosis for Month {month}
            </p>
          </div>
        </div>

        {/* Momentum Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${momConfig.bg} ${momConfig.border}`}>
          {momConfig.icon}
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block leading-none">
              Transformation Momentum
            </span>
            <span className={`text-xs font-black capitalize ${momConfig.text}`}>
              {summary.momentum}
            </span>
          </div>
        </div>
      </div>

      {/* Rationale for Momentum */}
      <div className="bg-[#161616] border border-[#222222] p-3.5 rounded-xl text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Momentum Diagnosis: </span>
          <span>{summary.momentumReason}</span>
        </div>
      </div>

      {/* Executive Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Key Improvements */}
        <div className="bg-[#161616] border border-[#222222] p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Key Visual Improvements
            </h4>
          </div>
          <ul className="space-y-1.5 pt-1">
            {summary.keyImprovements.map((item, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-[#10B981] font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* No Visible Change */}
        <div className="bg-[#161616] border border-[#222222] p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
            <Minus className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Areas with No Visible Change
            </h4>
          </div>
          <ul className="space-y-1.5 pt-1">
            {summary.noVisibleChangeAreas.map((item, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas Requiring Attention */}
        <div className="bg-[#161616] border border-[#222222] p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Priority Lagging Focus
            </h4>
          </div>
          <ul className="space-y-1.5 pt-1">
            {summary.areasRequiringAttention.map((item, i) => (
              <li key={i} className="text-xs text-amber-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Priority & Expected Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="bg-emerald-950/20 border border-[#10B981]/30 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#10B981]" />
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
              Highest Priority Action Item
            </span>
          </div>
          <p className="text-xs font-bold text-white">{summary.highestPriority}</p>
        </div>

        <div className="bg-blue-950/20 border border-blue-500/30 p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Expected Result Next Month
            </span>
          </div>
          <p className="text-xs font-bold text-white">{summary.expectedResultNextMonth}</p>
        </div>
      </div>

      {/* Scientific Limitations Disclaimer */}
      {summary.scientificLimitations && summary.scientificLimitations.length > 0 && (
        <div className="bg-[#141414] border border-[#222222] p-3.5 rounded-xl text-[11px] text-gray-400 space-y-1.5">
          <div className="flex items-center gap-2 text-gray-300 font-bold">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span>Scientific Limitations & Transparency Statement</span>
          </div>
          <ul className="space-y-1 pl-5 list-disc text-gray-400 leading-relaxed">
            {summary.scientificLimitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
