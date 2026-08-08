import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { VisionReport, DeltaCategoryStatus } from '../../vision/types';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Sliders,
} from 'lucide-react';

interface MonthlyComparisonCardProps {
  currentReport: VisionReport;
  previousReport?: VisionReport;
}

export const MonthlyComparisonCard: React.FC<MonthlyComparisonCardProps> = ({
  currentReport,
  previousReport,
}) => {
  const [activeAngle, setActiveAngle] = useState<'front' | 'side' | 'back'>('front');

  const delta = currentReport.comparisonDelta;
  const currSet = currentReport.photoSet;
  const prevSet = previousReport?.photoSet;

  if (!delta || delta.previousMonth === 'N/A (Baseline)') {
    return (
      <Card className="bg-[#111111] border-[#222222] p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto bg-[#181818] rounded-2xl border border-[#262626] flex items-center justify-center text-[#10B981]">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-extrabold text-white">Baseline Assessment Recorded</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          This is your initial monthly photo set ({currentReport.photoSet.month}). Future monthly uploads will automatically compare side-by-side pose progress, body fat reduction, and muscle hypertrophy.
        </p>
      </Card>
    );
  }

  const bfDelta = delta.bodyFatChangePercentage;

  const statusBadge = (status: DeltaCategoryStatus) => {
    switch (status) {
      case 'improved':
        return (
          <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Improved</span>
          </span>
        );
      case 'needs_attention':
        return (
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Needs Focus</span>
          </span>
        );
      default:
        return (
          <span className="bg-[#181818] text-gray-400 border border-[#2a2a2a] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Minus className="w-3 h-3" />
            <span>Unchanged</span>
          </span>
        );
    }
  };

  const currentPhoto =
    activeAngle === 'front'
      ? currSet.frontPhoto
      : activeAngle === 'side'
      ? currSet.sidePhoto
      : currSet.backPhoto;

  const previousPhoto =
    activeAngle === 'front'
      ? prevSet?.frontPhoto
      : activeAngle === 'side'
      ? prevSet?.sidePhoto
      : prevSet?.backPhoto;

  return (
    <div className="space-y-6">
      {/* 1. Header & Body Fat Delta Banner */}
      <Card className="bg-[#111111] border-[#222222] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-base font-extrabold text-white">
                Monthly Progress & Comparison
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Comparing {delta.previousMonth} vs {delta.currentMonth}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2 ${
                bfDelta < 0
                  ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                  : bfDelta > 0
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-[#181818] text-gray-300 border-[#262626]'
              }`}
            >
              {bfDelta < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : bfDelta > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span className="text-xs font-bold">
                {bfDelta < 0
                  ? `${Math.abs(bfDelta)}% Fat Loss`
                  : bfDelta > 0
                  ? `+${bfDelta}% Fat Change`
                  : 'Steady Composition'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Side-by-Side Visual Photo Comparison */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#10B981]" />
              <span>Side-by-Side Pose Inspection</span>
            </h3>

            {/* Pose Selector Tabs */}
            <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#262626]">
              {(['front', 'side', 'back'] as const).map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setActiveAngle(angle)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                    activeAngle === angle
                      ? 'bg-[#10B981] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Month Photo */}
            <div className="bg-[#161616] border border-[#222222] rounded-xl p-3 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-gray-400">{delta.previousMonth}</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Previous</span>
              </div>
              <div className="aspect-[3/4] w-full max-h-72 bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center border border-[#262626]">
                {previousPhoto?.imageBase64 ? (
                  <img
                    src={previousPhoto.imageBase64}
                    alt={`${delta.previousMonth} ${activeAngle}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-xs text-gray-500">No Photo Available</p>
                )}
              </div>
            </div>

            {/* Current Month Photo */}
            <div className="bg-[#161616] border border-[#10B981]/40 rounded-xl p-3 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-[#10B981]">{delta.currentMonth}</span>
                <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Current
                </span>
              </div>
              <div className="aspect-[3/4] w-full max-h-72 bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center border border-[#262626]">
                {currentPhoto?.imageBase64 ? (
                  <img
                    src={currentPhoto.imageBase64}
                    alt={`${delta.currentMonth} ${activeAngle}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-xs text-gray-500">No Photo Available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Categorized Progress Table */}
      {delta.categoryComparisons && delta.categoryComparisons.length > 0 && (
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-white">Anatomical Recomposition Status</h3>

          <div className="space-y-3">
            {delta.categoryComparisons.map((item, index) => (
              <div
                key={index}
                className="bg-[#161616] border border-[#222222] rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white">{item.category}</h4>
                  {statusBadge(item.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-[#262626]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">
                      {delta.previousMonth} Observation
                    </span>
                    <p className="text-gray-400">{item.previousObservation}</p>
                  </div>

                  <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-[#262626]">
                    <span className="text-[10px] font-bold text-[#10B981] uppercase block mb-0.5">
                      {delta.currentMonth} Observation
                    </span>
                    <p className="text-gray-200 font-medium">{item.currentObservation}</p>
                  </div>
                </div>

                <div className="text-[11px] text-gray-300 font-medium flex items-center gap-1.5 pt-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span>
                    <strong className="text-white">Delta Summary:</strong> {item.changeSummary}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. Improvements & Hypertrophy Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-[#10B981] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Recorded Improvements</span>
          </h3>
          <ul className="space-y-2">
            {delta.improvements.map((imp, i) => (
              <li
                key={i}
                className="bg-[#161616] p-2.5 rounded-xl border border-[#222222] text-xs text-gray-300 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0 mt-1.5" />
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Hypertrophy & Posture Focus</span>
          </h3>
          <ul className="space-y-2">
            {delta.visualHypertrophyNotes.map((note, i) => (
              <li
                key={i}
                className="bg-[#161616] p-2.5 rounded-xl border border-[#222222] text-xs text-gray-300 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
