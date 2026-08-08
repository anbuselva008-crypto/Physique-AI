import { WorkoutData } from '../types';

export const TODAY_WORKOUT: WorkoutData = {
  id: 'chest-triceps-1',
  title: 'Chest + Triceps',
  durationMinutes: 45,
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      sets: [
        { setNumber: 1, targetReps: 10, completed: false },
        { setNumber: 2, targetReps: 10, completed: false },
        { setNumber: 3, targetReps: 10, completed: false },
      ],
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press',
      sets: [
        { setNumber: 1, targetReps: 12, completed: false },
        { setNumber: 2, targetReps: 12, completed: false },
        { setNumber: 3, targetReps: 12, completed: false },
      ],
    },
    {
      id: 'ex-3',
      name: 'Cable Fly',
      sets: [
        { setNumber: 1, targetReps: 15, completed: false },
        { setNumber: 2, targetReps: 15, completed: false },
        { setNumber: 3, targetReps: 15, completed: false },
      ],
    },
    {
      id: 'ex-4',
      name: 'Tricep Pushdown',
      sets: [
        { setNumber: 1, targetReps: 12, completed: false },
        { setNumber: 2, targetReps: 12, completed: false },
        { setNumber: 3, targetReps: 12, completed: false },
      ],
    },
  ],
};
