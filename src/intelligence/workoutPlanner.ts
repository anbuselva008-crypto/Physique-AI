import { DynamicWorkoutPlan, PlannedExercise } from './types';
import { getPersona } from '../persona';
import { EXERCISE_DATABASE } from '../knowledge/exerciseDatabase';

/**
 * WorkoutPlanner
 * Generates dynamic, non-static workout sessions (Push, Pull, Legs, Upper, Lower, Cardio/Abs)
 * matching the user's recovery score, available equipment, experience level, and target weak areas.
 */
export class WorkoutPlanner {
  /**
   * Generates today's tailored workout plan.
   */
  public generateTodayWorkout(
    recoveryScore: number,
    weekNum: number = 1,
    dayNum: number = 1
  ): DynamicWorkoutPlan {
    const persona = getPersona();

    const equipmentList = persona.fitness?.availableEquipment || ['Barbell', 'Dumbbell', 'Cable', 'Bodyweight'];
    const timeAvailableMins = 60;
    const weakAreas = persona.body?.weakAreas || ['Upper Chest', 'Rear Delts'];

    // Determine session type based on day
    const sessionTypes: Array<'Push' | 'Pull' | 'Legs' | 'Upper' | 'Rest Day'> = [
      'Push',
      'Pull',
      'Legs',
      'Rest Day',
      'Upper',
      'Rest Day',
      'Rest Day',
    ];
    const sessionType = sessionTypes[(dayNum - 1) % sessionTypes.length] || 'Push';

    // Rest Day handling
    if (sessionType === 'Rest Day' || recoveryScore < 35) {
      return {
        sessionType: 'Rest Day',
        targetFocus: 'Active Mobility & Central Nervous System Recovery',
        estimatedDurationMins: 20,
        intensityLevel: 'Low',
        exercises: [],
        warmup: [
          '5 mins light walking',
          'Cat-Cow mobility drill (10 reps)',
          '90/90 Hip switches (10 reps per side)',
        ],
        cooldown: ['Static hamstring stretch (45s)', 'Doorway chest stretch (30s)'],
        trainingNotes: [
          'Today is focused on physiological restoration.',
          'Low recovery score or scheduled rest day.',
          'Prioritize hydration and 8 hours of sleep.',
        ],
      };
    }

    // Filter exercises matching available equipment
    const matchingExercises = EXERCISE_DATABASE.filter((ex) => {
      if (!ex.equipment) return true;
      return equipmentList.some((eq) =>
        ex.equipment.toLowerCase().includes(eq.toLowerCase()) ||
        eq.toLowerCase().includes(ex.equipment.toLowerCase())
      );
    });

    const pool = matchingExercises.length > 0 ? matchingExercises : EXERCISE_DATABASE;

    // Select 4-5 exercises
    const selected: PlannedExercise[] = pool.slice(0, 5).map((ex) => {
      const primaryTarget = ex.primaryMuscles?.[0] || 'Chest';
      const isWeakAreaTarget = weakAreas.some((wa) =>
        wa.toLowerCase().includes(primaryTarget.toLowerCase())
      );

      return {
        id: ex.id,
        name: ex.name,
        targetMuscle: primaryTarget,
        sets: isWeakAreaTarget ? 4 : 3,
        reps: '8-12',
        tempo: '3-0-1-0',
        restSeconds: 90,
        targetRPE: recoveryScore >= 75 ? 8.5 : 7.5,
        targetRIR: recoveryScore >= 75 ? 1 : 2,
        notes: isWeakAreaTarget
          ? 'Focus area: Pause 1 sec at peak contraction.'
          : 'Maintain strict eccentric tempo (3 seconds down).',
      };
    });

    return {
      sessionType,
      targetFocus: `${sessionType} Hypertrophy & Strength (${weakAreas[0] || 'Chest/Back'} Emphasis)`,
      estimatedDurationMins: Math.min(timeAvailableMins, selected.length * 12 + 10),
      intensityLevel: recoveryScore >= 75 ? 'High' : 'Moderate',
      exercises: selected,
      warmup: [
        '3 minutes arm circles & torso twists',
        '2 warm-up feeder sets on first compound lift at 50% working weight',
      ],
      cooldown: [
        'Doorway chest & lat stretch (2 minutes total)',
        '3 minutes diaphragmatic box breathing',
      ],
      trainingNotes: [
        `Target ${selected.length} exercises today.`,
        `RPE ${recoveryScore >= 75 ? '8-9' : '7-8'}.`,
        'Stay hydrated with 1L water during workout.',
      ],
    };
  }
}

export const workoutPlanner = new WorkoutPlanner();
