import React from 'react';
import { Card } from '../ui/Card';
import { ScientificMuscleGroupAnalysis, QualitativeDevelopmentLevel } from '../../vision/types';
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  Eye,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Dumbbell,
  Compass,
} from 'lucide-react';

interface EvidenceCardProps {
  analyses?: ScientificMuscleGroupAnalysis[];
  confidenceReasons?: string[];
  notDeterminableFeatures?: string[];
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  analyses,
  confidenceReasons,
  notDeterminableFeatures,
}) => {
  if (!analyses || analyses.length === 0) {
    return null;
  }

  const levelColorMap: Record<QualitativeDevelopmentLevel, string> = {
    'Very Limited': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Limited: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Moderate: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'Well Developed': 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    Advanced: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    Elite: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
  };

  const statusBadge = (status: ScientificMuscleGroupAnalysis['status']) => {
    switch (status) {
      case 'improved':
        return (
          <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Improved
          </span>
        );
      case 'slight_regression':
      case 'regression':
        return (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Priority Focus
          </span>
        );
      case 'insufficient_evidence':
        return (
          <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2.5 py-0.5 rounded-full border border-gray-700 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Insufficient Evidence
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
            <Minus className="w-3 h-3" /> Maintained
          </span>
        );
    }
  };

  return (
    <Card className="bg-[#111111] border-[#222222] p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#10B981]" />
          <div>
            <h3 className="text-base font-extrabold text-white">Anatomical Evidence Engine</h3>
            <p className="text-xs text-gray-400">
              Qualitative development evaluation supported by biomechanical observation and reasoning.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-gray-300 bg-[#181818] px-3 py-1 rounded-full border border-[#262626]">
          Qualitative Classification
        </span>
      </div>

      {/* Confidence Reasons & Photo Quality Banner */}
      {confidenceReasons && confidenceReasons.length > 0 && (
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <h4 className="text-xs font-bold text-white">Photo Set Quality & Confidence Rating</h4>
          </div>
          <ul className="space-y-1">
            {confidenceReasons.map((reason, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-[#10B981] font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Muscle Group Cards Grid */}
      <div className="space-y-4">
        {analyses.map((item, index) => {
          const badgeStyle = levelColorMap[item.developmentLevel] || levelColorMap.Moderate;

          return (
            <div
              key={index}
              className="bg-[#151515] border border-[#222222] rounded-2xl p-4 space-y-3 transition-all hover:border-[#2a2a2a]"
            >
              {/* Muscle Group Title & Level Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#10B981]" />
                  <h4 className="text-xs font-black text-white">{item.muscleGroup}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {statusBadge(item.status)}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                    {item.developmentLevel}
                  </span>
                </div>
              </div>

              {/* Visual Observations */}
              <div className="bg-[#111111] p-3 rounded-xl border border-[#222222] space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3 text-[#10B981]" /> Direct Visual Landmarks Observed
                </span>
                <ul className="space-y-1">
                  {item.observations.map((obs, i) => (
                    <li key={i} className="text-xs text-gray-200 flex items-start gap-1.5">
                      <span className="text-[#10B981] font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Biomechanical Reasoning & Workout Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#111111] p-3 rounded-xl border border-[#222222] space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Biomechanical Reasoning
                  </span>
                  <p className="text-gray-300 leading-relaxed">{item.reasoning}</p>
                </div>

                <div className="bg-[#111111] p-3 rounded-xl border border-[#222222] space-y-1">
                  <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">
                    Workout Program Impact
                  </span>
                  <p className="text-[#10B981] font-semibold leading-relaxed">{item.workoutImpact}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Uncertainty Engine: Cannot Determine List */}
      {notDeterminableFeatures && notDeterminableFeatures.length > 0 && (
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222222]">
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-white">Uncertainty Engine: Explicit Non-Determined Metrics</h4>
          </div>
          <p className="text-[11px] text-gray-400">
            The AI strictly avoids guessing or fabricating data for metrics unobservable in 2D photo photography.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {notDeterminableFeatures.map((feat, i) => (
              <div key={i} className="bg-[#181818] p-2.5 rounded-xl border border-[#262626] text-xs text-rose-300/90 flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
