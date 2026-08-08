import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Exercise, ExerciseSet } from '../../types';
import { Check, ChevronLeft, ChevronRight, Timer, Play, RotateCcw, Dumbbell } from 'lucide-react';

interface WorkoutSessionViewProps {
  exercises: Exercise[];
  currentExerciseIndex: number;
  onToggleSet: (exerciseIndex: number, setIndex: number) => void;
  onPreviousExercise: () => void;
  onNextExercise: () => void;
  onFinishWorkout: () => void;
}

export const WorkoutSessionView: React.FC<WorkoutSessionViewProps> = ({
  exercises,
  currentExerciseIndex,
  onToggleSet,
  onPreviousExercise,
  onNextExercise,
  onFinishWorkout,
}) => {
  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;

  // Rest Timer state
  const [restSeconds, setRestSeconds] = useState<number>(60);
  const [isResting, setIsResting] = useState<boolean>(false);

  // Countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restSeconds]);

  const handleStartRest = () => {
    setRestSeconds(60);
    setIsResting(true);
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestSeconds(60);
  };

  const handleSetToggle = (setIndex: number) => {
    onToggleSet(currentExerciseIndex, setIndex);

    // Check if toggling this set completes all sets in current exercise
    const updatedSets = currentExercise.sets.map((s, idx) =>
      idx === setIndex ? { ...s, completed: !s.completed } : s
    );
    const allCompleted = updatedSets.every((s) => s.completed);

    if (allCompleted) {
      // Auto move to next exercise or finish if last exercise
      if (currentExerciseIndex < totalExercises - 1) {
        setTimeout(() => {
          onNextExercise();
          setRestSeconds(60);
          setIsResting(false);
        }, 400);
      } else {
        // Check if all exercises across entire workout are complete
        const allExercisesComplete = exercises.every((ex, idx) =>
          idx === currentExerciseIndex
            ? updatedSets.every((s) => s.completed)
            : ex.sets.every((s) => s.completed)
        );
        if (allExercisesComplete) {
          setTimeout(() => {
            onFinishWorkout();
          }, 400);
        }
      }
    }
  };

  const isFirstExercise = currentExerciseIndex === 0;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Progress & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#10B981]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Active Session
          </span>
        </div>
        <div className="text-xs font-bold text-white bg-[#161616] px-3 py-1 rounded-full border border-[#222222]">
          Exercise {currentExerciseIndex + 1} / {totalExercises}
        </div>
      </div>

      {/* Current Exercise Card */}
      <Card className="bg-[#111111] border-[#222222] p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
          {currentExercise.name}
        </h2>

        {/* Sets List */}
        <div className="space-y-3 mb-8">
          {currentExercise.sets.map((set: ExerciseSet, idx: number) => (
            <div
              key={idx}
              onClick={() => handleSetToggle(idx)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                set.completed
                  ? 'bg-[#10B981]/10 border-[#10B981]/40 text-white'
                  : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-[#333333]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">Set {set.setNumber}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {set.targetReps} reps
                </span>
              </div>

              <div
                className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                  set.completed
                    ? 'bg-[#10B981] border-[#10B981] text-black'
                    : 'border-[#333333] bg-[#0f0f0f]'
                }`}
              >
                {set.completed && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>

        {/* Rest Timer Block */}
        <div className="p-4 sm:p-5 bg-[#0a0a0a] rounded-2xl border border-[#222222]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Rest Timer
              </span>
            </div>
            <span className="text-2xl font-black text-white font-mono">
              {restSeconds}s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!isResting ? (
              <Button
                variant="secondary"
                onClick={handleStartRest}
                className="py-2.5 text-xs font-bold"
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Start Rest
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setIsResting(false)}
                className="py-2.5 text-xs font-bold text-amber-400"
              >
                Pause Rest
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleSkipRest}
              className="py-2.5 text-xs font-bold text-gray-400"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Skip Rest
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={isFirstExercise}
          onClick={onPreviousExercise}
          icon={<ChevronLeft className="w-4 h-4" />}
          className="py-3.5 text-sm"
        >
          Previous
        </Button>

        {isLastExercise ? (
          <Button
            variant="primary"
            onClick={onFinishWorkout}
            className="py-3.5 text-sm"
          >
            Finish Workout
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={onNextExercise}
            className="py-3.5 text-sm flex-row-reverse"
            icon={<ChevronRight className="w-4 h-4 ml-1" />}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};
