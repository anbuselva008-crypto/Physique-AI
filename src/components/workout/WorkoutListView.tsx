import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { WorkoutData } from '../../types';
import { Play, Clock, Dumbbell, CheckCircle2 } from 'lucide-react';

interface WorkoutListViewProps {
  workout: WorkoutData;
  onStartWorkout: () => void;
}

export const WorkoutListView: React.FC<WorkoutListViewProps> = ({
  workout,
  onStartWorkout,
}) => {
  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Overview Card */}
      <Card className="bg-[#111111] border-[#222222]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
            Today's Routine
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1.5 bg-[#181818] px-3 py-1 rounded-full border border-[#2a2a2a]">
            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
            {workout.durationMinutes} Minutes
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          {workout.title}
        </h1>
        <p className="text-xs text-gray-400">
          Targeted hypertrophy workout designed for strength and muscle growth.
        </p>
      </Card>

      {/* Exercises List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
          Exercises ({workout.exercises.length})
        </h2>

        {workout.exercises.map((exercise, index) => {
          const setsCount = exercise.sets.length;
          const reps = exercise.sets[0]?.targetReps || 10;
          const isCompleted = exercise.sets.every((s) => s.completed);

          return (
            <Card
              key={exercise.id}
              className="bg-[#111111] border-[#222222] p-4 sm:p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#181818] border border-[#282828] flex items-center justify-center font-bold text-gray-300 text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">
                    {exercise.name}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-[#10B981]" />
                    {setsCount} × {reps} reps
                  </p>
                </div>
              </div>

              {isCompleted ? (
                <div className="flex items-center gap-1 text-xs font-bold text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done</span>
                </div>
              ) : (
                <span className="text-xs text-gray-500 font-medium">
                  {setsCount} sets
                </span>
              )}
            </Card>
          );
        })}
      </div>

      {/* Start Workout Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={onStartWorkout}
        className="py-4 text-lg mt-4 shadow-xl shadow-[#10B981]/15"
        icon={<Play className="w-6 h-6 fill-[#050505]" />}
      >
        Start Workout
      </Button>
    </div>
  );
};
