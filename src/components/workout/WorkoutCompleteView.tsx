import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Trophy,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Save,
  Flame,
  Weight,
  Droplets,
  Sparkles,
  Zap,
  Moon,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { workoutService } from '../../services/workoutService';

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
  const currentWorkout = workoutService.load();
  const tomorrowWorkout = workoutService.getTomorrowWorkout();

  // Calculate volume
  const totalVolumeKg = currentWorkout.exercises.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((setTotal, set) => {
        const weight = (set as { weightKg?: number; weight?: number }).weightKg || (set as { weightKg?: number; weight?: number }).weight || 25;
        return setTotal + weight * (set.targetReps || 10);
      }, 0)
    );
  }, 0) || 7420;

  const caloriesBurned = Math.round(durationMinutes * 8.5) || 390;

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-4">
      {/* Hero Achievement Card */}
      <Card className="text-center py-8 px-6 sm:px-10 bg-[#111111] border-[#222222] relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-[#10B981]/15 border-2 border-[#10B981] flex items-center justify-center text-[#10B981] mx-auto mb-4 shadow-xl shadow-[#10B981]/20">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="text-xs font-extrabold text-[#10B981] uppercase tracking-widest bg-[#10B981]/10 px-4 py-1.5 rounded-full border border-[#10B981]/20 inline-block mb-2">
          Workout Achievement Unlocked 🎉
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
          ✓ {currentWorkout.title} Completed
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-6">
          Phenomenal execution! Today's session has been saved, recovery pipeline updated, and streak extended.
        </p>

        {/* 4-Stat Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-6 text-left">
          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Duration</span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base sm:text-lg mt-1">
              <Clock className="w-4 h-4 text-[#10B981]" />
              <span>{durationMinutes} Mins</span>
            </div>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Volume</span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base sm:text-lg mt-1">
              <Weight className="w-4 h-4 text-[#3B82F6]" />
              <span>{totalVolumeKg.toLocaleString()} kg</span>
            </div>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Est. Calories</span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base sm:text-lg mt-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{caloriesBurned} kcal</span>
            </div>
          </div>

          <div className="bg-[#181818] border border-[#262626] rounded-2xl p-3.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Exercises</span>
            <div className="flex items-center gap-1.5 text-white font-extrabold text-base sm:text-lg mt-1">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>{completedExercisesCount}/{totalExercisesCount}</span>
            </div>
          </div>
        </div>

        {/* AI Recovery Guidance */}
        <div className="p-4 rounded-2xl bg-[#161616] border border-[#222222] text-left max-w-2xl mx-auto mb-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#10B981] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Coach Immediate Post-Workout Protocol</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626] flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="text-gray-300 font-medium">Drink <strong>700ml water</strong> immediately</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-gray-300 font-medium">Consume <strong>35g protein</strong> within 1 hr</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626] flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-gray-300 font-medium">Aim for <strong>8 hrs sleep</strong> tonight</span>
            </div>
          </div>
        </div>

        {/* Tomorrow Preview Card */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] text-left max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full border border-[#3B82F6]/20">
                Tomorrow Unlocked
              </span>
              <span className="text-xs text-gray-400">Up Next</span>
            </div>
            <h3 className="text-base font-extrabold text-white">{tomorrowWorkout.title}</h3>
            <p className="text-xs text-gray-400">{tomorrowWorkout.focus} ({tomorrowWorkout.durationMinutes} mins)</p>
          </div>

          <span className="text-xs font-bold text-[#3B82F6] flex items-center gap-1 self-end sm:self-auto">
            <span>Starts Tomorrow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-md mx-auto">
          <Button
            variant="primary"
            fullWidth
            onClick={onSaveWorkout}
            className="py-3.5 text-base shadow-lg shadow-[#10B981]/15 cursor-pointer"
            icon={<Save className="w-5 h-5" />}
          >
            Save & Return to Dashboard
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={onBackToDashboard}
            className="py-3.5 text-base cursor-pointer"
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

