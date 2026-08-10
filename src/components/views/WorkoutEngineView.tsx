import React, { useState } from 'react';
import { WorkoutStage, WorkoutData } from '../../types';
import { workoutService } from '../../services';
import { workoutConnector } from '../../integration/workoutConnector';
import { WorkoutListView } from '../workout/WorkoutListView';
import { WorkoutSessionView } from '../workout/WorkoutSessionView';
import { WorkoutCompleteView } from '../workout/WorkoutCompleteView';

interface WorkoutEngineViewProps {
  onBackToDashboard: () => void;
}

export const WorkoutEngineView: React.FC<WorkoutEngineViewProps> = ({
  onBackToDashboard,
}) => {
  const [stage, setStage] = useState<WorkoutStage>('list');
  const [workout, setWorkout] = useState<WorkoutData>(() => workoutService.load());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  const handleStartWorkout = () => {
    setStage('session');
    setCurrentExerciseIndex(0);
  };

  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    const updated = workoutService.update(exerciseIndex, setIndex);
    setWorkout(updated);
  };

  const handlePreviousExercise = () => {
    setCurrentExerciseIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextExercise = () => {
    setCurrentExerciseIndex((prev) =>
      Math.min(workout.exercises.length - 1, prev + 1)
    );
  };

  const handleFinishWorkout = async () => {
    await workoutConnector.logCompletedWorkout(workout);
    setStage('complete');
  };

  const handleSaveWorkout = () => {
    // Save workout in state / return to dashboard
    onBackToDashboard();
  };

  const completedCount = workout.exercises.filter((ex) =>
    ex.sets.every((s) => s.completed)
  ).length;

  return (
    <div>
      {stage === 'list' && (
        <WorkoutListView
          workout={workout}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {stage === 'session' && (
        <WorkoutSessionView
          exercises={workout.exercises}
          currentExerciseIndex={currentExerciseIndex}
          onToggleSet={handleToggleSet}
          onPreviousExercise={handlePreviousExercise}
          onNextExercise={handleNextExercise}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {stage === 'complete' && (
        <WorkoutCompleteView
          durationMinutes={workout.durationMinutes}
          completedExercisesCount={completedCount}
          totalExercisesCount={workout.exercises.length}
          onSaveWorkout={handleSaveWorkout}
          onBackToDashboard={onBackToDashboard}
        />
      )}
    </div>
  );
};
