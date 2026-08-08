import { ScheduledTaskItem, SystemSchedule } from './types';

/**
 * SystemScheduler
 * Generates structured scheduling configurations for routines, reviews, and photo updates.
 */
export class SystemScheduler {
  /**
   * Generates a structured system schedule.
   */
  public generateSchedule(
    currentDate: Date = new Date()
  ): SystemSchedule {
    const dailyTasks: ScheduledTaskItem[] = [
      {
        id: 'sch-morning-01',
        name: 'Morning Routine & Check-In',
        targetTime: '07:30 AM',
        recurrence: 'Daily',
        description: 'Execute morning check-in, load persona/memory, and construct today\'s transformation plan.',
        actionPipeline: 'morning',
      },
      {
        id: 'sch-workout-01',
        name: 'Scheduled Workout Session',
        targetTime: '05:30 PM',
        recurrence: 'Daily',
        description: 'Execute today\'s exercise protocol, log sets, and update recovery/nutrition needs.',
        actionPipeline: 'workout',
      },
      {
        id: 'sch-nutrition-01',
        name: 'Post-Workout & Evening Meal Log',
        targetTime: '07:30 PM',
        recurrence: 'Daily',
        description: 'Log dinner/post-workout meal, track protein target progress, and adjust bedtime snack.',
        actionPipeline: 'nutrition',
      },
      {
        id: 'sch-weekly-01',
        name: 'Weekly Transformation Review',
        targetTime: 'Sunday 08:00 PM',
        recurrence: 'Weekly',
        description: 'Evaluate 7-day adherence, calculate workout streak, and recalculate weekly targets.',
        actionPipeline: 'weekly',
      },
      {
        id: 'sch-monthly-01',
        name: 'Monthly Visual Body Composition Audit',
        targetTime: '1st of Month 09:00 AM',
        recurrence: 'Monthly',
        description: 'Analyze progress photos with Gemini Vision, compare posture/body fat, and update roadmap.',
        actionPipeline: 'monthly',
      },
    ];

    // Calculate next Sunday
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() + ((7 - currentDate.getDay()) % 7));
    const weeklyReviewDate = sunday.toISOString().split('T')[0];

    // Calculate 1st of next month
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextMonthlyPhotoDate = nextMonth.toISOString().split('T')[0];

    return {
      generatedAt: currentDate.toISOString(),
      dailyTasks,
      weeklyReviewDate,
      nextMonthlyPhotoDate,
    };
  }
}

export const scheduler = new SystemScheduler();
