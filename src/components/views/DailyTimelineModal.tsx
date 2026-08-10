import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  dailyTransformationService,
  DailyHistoryRecord,
} from '../../daily/dailyTransformationService';
import { progressService } from '../../services';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Droplets,
  Scale,
  X,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface DailyTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord?: (record: DailyHistoryRecord) => void;
}

export const DailyTimelineModal: React.FC<DailyTimelineModalProps> = ({
  isOpen,
  onClose,
  onSelectRecord,
}) => {
  const [historyRecords, setHistoryRecords] = useState<DailyHistoryRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const records = dailyTransformationService.getAllDailyHistoryRecords();
      setHistoryRecords(records);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = progressService.getFormattedDate(0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111111] border border-[#222222] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-[#181818] border border-[#262626] p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#222222] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Daily Transformation Timeline</h2>
            <p className="text-xs text-gray-400">Permanent Daily History & Cross-System Records</p>
          </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-3">
          {historyRecords.length === 0 ? (
            <Card className="bg-[#181818] border-[#262626] p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Completed Days Recorded Yet</h3>
              <p className="text-xs text-gray-400">
                Log Breakfast, Lunch, and Dinner today, then tap <strong className="text-[#10B981]">"✓ Complete Today's Nutrition"</strong> to record your first transformation day!
              </p>
            </Card>
          ) : (
            historyRecords.map((record) => {
              const isToday = record.date === todayStr;

              return (
                <div
                  key={record.date}
                  onClick={() => onSelectRecord && onSelectRecord(record)}
                  className="bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded-2xl p-4 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-extrabold text-white">{record.date}</span>
                      {isToday && (
                        <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-extrabold text-amber-400">
                          Score: {record.coachReview.overallScore}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* Status Pills Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-[#121212] p-2 rounded-xl border border-[#222222] flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Workout</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ✓
                      </span>
                    </div>

                    <div className="bg-[#121212] p-2 rounded-xl border border-[#222222] flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Nutrition</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ✓
                      </span>
                    </div>

                    <div className="bg-[#121212] p-2 rounded-xl border border-[#222222] flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Protein</span>
                      <span className="font-bold text-blue-400">{record.nutrition.totalProtein}g</span>
                    </div>

                    <div className="bg-[#121212] p-2 rounded-xl border border-[#222222] flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Calories</span>
                      <span className="font-bold text-white">{record.nutrition.totalCalories}</span>
                    </div>
                  </div>

                  {/* Extra Stats Bar */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      {(record.nutrition.totalWaterMl / 1000).toFixed(1)}L Water
                    </span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-purple-400" />
                      {record.progress.weightKg} kg
                    </span>
                    <span className="flex items-center gap-1 text-[#10B981]">
                      ₹{record.nutrition.totalCostInr} Spent
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-[#222222]">
          <Button variant="secondary" onClick={onClose} className="text-xs font-bold py-2 px-5">
            Close Timeline
          </Button>
        </div>
      </div>
    </div>
  );
};
