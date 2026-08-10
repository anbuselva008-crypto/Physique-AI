import React from 'react';
import { Card } from '../ui/Card';
import { StoredMonthlyReport } from '../../vision/monthlyReportStorage';
import { Calendar, CheckCircle2, TrendingDown, TrendingUp, Sparkles, ChevronRight, Activity } from 'lucide-react';

interface MonthlyTimelineCardProps {
  reports: StoredMonthlyReport[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const MonthlyTimelineCard: React.FC<MonthlyTimelineCardProps> = ({
  reports,
  selectedMonth,
  onSelectMonth,
}) => {
  if (!reports || reports.length === 0) {
    return (
      <Card className="bg-[#111111] border-[#222222] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-[#10B981]" />
          <h3 className="text-base font-bold text-white">Monthly Transformation Timeline</h3>
        </div>
        <p className="text-xs text-gray-400">
          No monthly vision photo analyses logged yet. Complete your first 3-angle photo session to establish your baseline.
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#222222] p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#10B981]" />
          <div>
            <h3 className="text-base font-extrabold text-white">Monthly Transformation Timeline</h3>
            <p className="text-xs text-gray-400">
              Interactive physical evolution tracking across recorded monthly vision sessions.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20 self-start sm:self-auto">
          {reports.length} {reports.length === 1 ? 'Month' : 'Months'} Logged
        </span>
      </div>

      {/* Horizontal Month Nodes */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {reports.map((report, index) => {
          const isSelected = report.month === selectedMonth;
          const prevReport = index > 0 ? reports[index - 1] : undefined;
          const bfDiff = prevReport
            ? Math.round((report.bodyFatPercentage - prevReport.bodyFatPercentage) * 10) / 10
            : 0;

          return (
            <button
              key={report.month}
              onClick={() => onSelectMonth(report.month)}
              className={`flex-shrink-0 flex flex-col items-start p-3.5 rounded-2xl border transition-all cursor-pointer min-w-[160px] text-left ${
                isSelected
                  ? 'bg-[#181818] border-[#10B981] shadow-lg shadow-[#10B981]/10'
                  : 'bg-[#141414] border-[#222222] hover:border-[#333333]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xs font-black text-white">Month {report.month}</span>
                {isSelected && <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />}
              </div>

              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-medium">Est. Fat:</span>
                  <span className="font-bold text-[#10B981]">{report.bodyFatPercentage.toFixed(1)}%</span>
                </div>

                {prevReport && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Delta:</span>
                    <span
                      className={`font-bold flex items-center gap-0.5 ${
                        bfDiff < 0
                          ? 'text-[#10B981]'
                          : bfDiff > 0
                          ? 'text-rose-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {bfDiff < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : bfDiff > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : null}
                      {bfDiff > 0 ? `+${bfDiff}%` : `${bfDiff}%`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium pt-1 border-t border-[#222222]">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  <span>{report.confidenceLevel.toUpperCase()} confidence</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Selected Month Brief Summary */}
      {selectedMonth && (
        <div className="bg-[#151515] border border-[#222222] rounded-2xl p-4 space-y-3">
          {(() => {
            const currentReport = reports.find((r) => r.month === selectedMonth);
            if (!currentReport) return null;

            return (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#10B981]" />
                    <h4 className="text-xs font-extrabold text-white">
                      Executive Analysis Summary ({currentReport.month})
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">
                    Logged: {new Date(currentReport.analyzedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed bg-[#111111] p-3 rounded-xl border border-[#222222]">
                  {currentReport.coachSummary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#111111] p-3 rounded-xl border border-[#222222]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Lagging Areas Targeted
                    </span>
                    <p className="text-xs font-bold text-rose-400 mt-1">
                      {currentReport.weakAreas.join(', ') || 'None identified'}
                    </p>
                  </div>

                  <div className="bg-[#111111] p-3 rounded-xl border border-[#222222]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Adaptive Workout Program Injection
                    </span>
                    <p className="text-xs font-bold text-[#10B981] mt-1">
                      {currentReport.adaptiveWorkoutAdjustments[0] || 'Standard overload maintained'}
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </Card>
  );
};
