import React from 'react';
import { Card } from '../ui/Card';
import { VisionReport } from '../../vision/types';
import {
  Activity,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Dumbbell,
  Compass,
  Zap,
} from 'lucide-react';

interface VisionAnalysisReportCardProps {
  report: VisionReport;
}

export const VisionAnalysisReportCard: React.FC<VisionAnalysisReportCardProps> = ({ report }) => {
  const { bodyAnalysis } = report;
  const { bodyFat, visibleMuscleDevelopment, strongAreas, weakAreas, postureObservations, categorizedObservations, disclaimer } = bodyAnalysis;

  const confidenceBadgeColor = {
    high: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  }[bodyFat.confidenceLevel || 'medium'];

  return (
    <div className="space-y-6">
      {/* 1. Body Fat & Key Metrics Headline */}
      <Card className="bg-[#111111] border-[#222222] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-[#222222]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-base font-extrabold text-white">
                Body Composition & Fat Percentage Analysis
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Evaluated via Gemini Computer Vision across 3-angle pose symmetry and subcutaneous indicators.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#181818] p-3.5 rounded-2xl border border-[#262626]">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Estimated Body Fat
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-[#10B981]">
                  {bodyFat.estimatedPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Range: {bodyFat.range[0].toFixed(1)}% - {bodyFat.range[1].toFixed(1)}%
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${confidenceBadgeColor}`}
            >
              {bodyFat.confidenceLevel} Confidence
            </span>
          </div>
        </div>

        {/* Visual Justification */}
        <div className="mt-4 bg-[#161616] border border-[#222222] rounded-xl p-3.5 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-200">Visual Fat Storage Justification</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{bodyFat.justification}</p>
          </div>
        </div>
      </Card>

      {/* 2. Categorized Observations (Observed, Estimated, Actionable Advice) */}
      {categorizedObservations && categorizedObservations.length > 0 && (
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-extrabold text-white">
              Anatomical & Biomechanical Breakdown
            </h3>
          </div>

          <div className="space-y-3">
            {categorizedObservations.map((item, index) => (
              <div
                key={index}
                className="bg-[#161616] border border-[#222222] rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#10B981]">{item.category}</h4>
                  <span className="text-[10px] text-gray-500 font-medium">Metric #0{index + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-[#262626]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Visual Feature Observed
                    </span>
                    <p className="text-gray-200 font-medium">{item.observed}</p>
                  </div>

                  <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-[#262626]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Estimated Index / Ratio
                    </span>
                    <p className="text-[#10B981] font-semibold">{item.estimated}</p>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-[#10B981]/20 p-2.5 rounded-lg flex items-start gap-2 text-xs text-emerald-300">
                  <Zap className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-bold">Actionable Focus:</strong>{' '}
                    {item.recommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. Strong Areas vs Lagging Muscle Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Areas */}
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-xs font-extrabold text-white">Dominant & Strong Muscle Groups</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {strongAreas.map((area, i) => (
              <span
                key={i}
                className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{area}</span>
              </span>
            ))}
          </div>
        </Card>

        {/* Lagging Areas */}
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-extrabold text-white">Lagging & Focus Priority Areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakAreas.map((area, i) => (
              <span
                key={i}
                className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>{area}</span>
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Visible Muscle Development Summary */}
      <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-xs font-extrabold text-white">Muscular Development Overview</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(visibleMuscleDevelopment).map(([group, desc]) => (
            <div key={group} className="bg-[#161616] p-3 rounded-xl border border-[#222222]">
              <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider mb-1">
                {group}
              </p>
              <p className="text-xs text-gray-300 line-clamp-2">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. Posture Observations */}
      {postureObservations && postureObservations.length > 0 && (
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-xs font-extrabold text-white">Posture & Spinal Alignment</h3>
          </div>

          <ul className="space-y-2">
            {postureObservations.map((obs, i) => (
              <li
                key={i}
                className="bg-[#161616] border border-[#222222] p-3 rounded-xl text-xs text-gray-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 6. Legal & Scientific Disclaimer */}
      <div className="bg-[#141414] border border-[#222222] p-3.5 rounded-xl text-[11px] text-gray-500 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};
