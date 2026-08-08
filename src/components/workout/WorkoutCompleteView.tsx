import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Trophy, Clock, CheckCircle2, ArrowLeft, Save } from 'lucide-react';

interface WorkoutCompleteViewProps {
  durationMinutes: number;
  completedExercisesCount: number;
  totalExercisesCount: number;
  onSaveWorkout: () => void;
  onBackToDashboard: () => void;
}

export const WorkoutCompleteView: React.FC<WorkoutCompleteViewProps> = ({
  durationMinutes = 45,
  completedExercisesCount = 4,
  totalExercisesCount = 4,
  onSaveWorkout,
  onBackToDashboard,
}) => {
  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-4">
      <Card className="text-center py-10 px-6 sm:px-10 bg-[#111111] border-[#222222] relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-[#10B981]/15 border-2 border-[#10B981] flex items-center justify-center text-[#10B981] mx-auto mb-6 shadow-xl shadow-[#10B981]/20">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="text-xs font-extrabold text-[#10B981] uppercase tracking-widest bg-[#10B981]/10 px-4 py-1.5 rounded-full border border-[#10B981]/20 inline-block mb-3">
          Congratulations 🎉
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Workout Finished
        </h1>

        <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
          Great consistency, Anbu! You pushed through your session today. Keep building that momentum.
        </p>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 text-center">
            <Clock className="w-5 h-5 text-[#10B981] mx-auto mb-1.5" />
            <p className="text-xs text-gray-400 font-medium">Duration</p>
            <p className="text-xl font-extrabold text-white">{durationMinutes} Mins</p>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-[#10B981] mx-auto mb-1.5" />
            <p className="text-xs text-gray-400 font-medium">Exercises</p>
            <p className="text-xl font-extrabold text-white">
              {completedExercisesCount} / {totalExercisesCount}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-md mx-auto">
          <Button
            variant="primary"
            fullWidth
            onClick={onSaveWorkout}
            className="py-3.5 text-base shadow-lg shadow-[#10B981]/15"
            icon={<Save className="w-5 h-5" />}
          >
            Save Workout
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={onBackToDashboard}
            className="py-3.5 text-base"
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
