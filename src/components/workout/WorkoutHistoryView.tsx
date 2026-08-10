import React, { useState } from 'react';
import { workoutService, CompletedWorkoutRecord } from '../../services/workoutService';
import {
  History,
  Search,
  Calendar,
  Clock,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

export const WorkoutHistoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const history = workoutService.getCompletedWorkouts();

  const filteredHistory = history.filter((w) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = w.title.toLowerCase().includes(term);
    const dateMatch = w.date.includes(term);
    const exMatch = w.exercises?.some((e) => e.name.toLowerCase().includes(term));
    return titleMatch || dateMatch || exMatch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleExportData = () => {
    const jsonStr = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physique_ai_workout_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Workout History Database</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Searchable, filterable ledger of every completed session & sets executed
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-[#181818] hover:bg-[#222222] border border-[#262626] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Export History JSON</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by exercise name, split title, or date (e.g., Chest, 2026-08-08)..."
          className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-[#262626] rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-all"
        />
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#222222] rounded-2xl space-y-2">
          <Dumbbell className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-sm font-bold text-gray-300">No completed workout history found</p>
          <p className="text-xs text-gray-500">
            {searchTerm ? 'Try adjusting your search filter.' : 'Complete your first workout session to record history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((rec) => {
            const isExpanded = expandedId === rec.id;
            return (
              <div
                key={rec.id}
                className="bg-[#181818] border border-[#262626] rounded-2xl overflow-hidden transition-all hover:border-[#333333]"
              >
                {/* Record Bar */}
                <div
                  onClick={() => toggleExpand(rec.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{rec.title}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          {rec.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {rec.durationMinutes} mins
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Flame className="w-3 h-3" />
                          {rec.caloriesBurned || 380} kcal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[#10B981] bg-[#10B981]/15 px-3 py-1 rounded-full border border-[#10B981]/30">
                      {rec.completionPercentage || 100}% Complete
                    </span>

                    <button className="p-1 text-gray-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-[#222222] bg-[#141414] space-y-4">
                    {/* Exercises Details */}
                    <div className="space-y-2 pt-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Executed Exercises & Sets
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rec.exercises.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-3 rounded-xl bg-[#181818] border border-[#262626] text-xs space-y-2"
                          >
                            <span className="font-extrabold text-white block">{ex.name}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {ex.sets.map((set, setIdx) => (
                                <span
                                  key={setIdx}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                    set.completed
                                      ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                                      : 'bg-[#222222] border-[#333333] text-gray-500'
                                  }`}
                                >
                                  S{set.setNumber}: {set.targetReps}r
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coach Notes */}
                    {rec.coachNotes && rec.coachNotes.length > 0 && (
                      <div className="p-3 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20 text-xs space-y-1">
                        <span className="font-bold text-[#10B981] block">Coach Feedback:</span>
                        {rec.coachNotes.map((note, idx) => (
                          <p key={idx} className="text-gray-300">
                            • {note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
