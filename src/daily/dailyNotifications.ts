import { NotificationItem, NotificationSchedule } from './types';
import { UnifiedTransformationState } from '../intelligence/types';

/**
 * DailyNotifications
 * Generates time-stamped, structured notification objects for proactive app engagement.
 * Does NOT invoke push notification APIs; generates purely structured schedule data.
 */
export class DailyNotifications {
  /**
   * Generates today's structured notification schedule based on workout schedule and recovery targets.
   */
  public generateNotificationSchedule(
    intelligenceState: UnifiedTransformationState,
    dateStr: string = new Date().toISOString().split('T')[0]
  ): NotificationSchedule {
    const { workoutPlan, mealPlan, recoveryPlan } = intelligenceState;

    const notifications: NotificationItem[] = [
      {
        id: 'notif-01',
        scheduledTime: '07:30 AM',
        title: 'Morning Recovery Check-in',
        message: 'Complete today\'s check-in (sleep, soreness & energy) to calibrate your daily plan.',
        category: 'CheckIn',
        actionUrl: '/check-in',
      },
      {
        id: 'notif-02',
        scheduledTime: '08:00 AM',
        title: 'Hydration Kickstart',
        message: `Drink your first 500ml water to reach today\'s ${mealPlan.hydrationTargetLiters}L target.`,
        category: 'Water',
        actionUrl: '/nutrition',
      },
      {
        id: 'notif-03',
        scheduledTime: '12:30 PM',
        title: 'Midday Protein Refuel',
        message: `Time for Lunch. Target ~${mealPlan.lunch.protein}g protein to maintain positive nitrogen balance.`,
        category: 'Nutrition',
        actionUrl: '/nutrition',
      },
    ];

    if (workoutPlan.sessionType !== 'Rest Day') {
      notifications.push({
        id: 'notif-04',
        scheduledTime: '05:00 PM',
        title: `Time to Workout: ${workoutPlan.sessionType}`,
        message: `Today\'s focus: ${workoutPlan.targetFocus}. Est. duration: ${workoutPlan.estimatedDurationMins} mins.`,
        category: 'Workout',
        actionUrl: '/workout',
      });
    } else {
      notifications.push({
        id: 'notif-04',
        scheduledTime: '05:00 PM',
        title: 'Active Mobility & Recovery Flow',
        message: 'Rest Day active recovery session: 15 mins foam rolling and light walking.',
        category: 'Workout',
        actionUrl: '/recovery',
      });
    }

    notifications.push(
      {
        id: 'notif-05',
        scheduledTime: '07:30 PM',
        title: 'Prepare Dinner',
        message: `Dinner target: ~${mealPlan.dinner.protein}g protein. Log your meal to stay on track.`,
        category: 'Nutrition',
        actionUrl: '/nutrition',
      },
      {
        id: 'notif-06',
        scheduledTime: '09:45 PM',
        title: 'Sleep Preparation & Wind-down',
        message: `Target ${recoveryPlan.sleepTargetHours}h sleep tonight. Limit blue light screen time now.`,
        category: 'Sleep',
        actionUrl: '/recovery',
      }
    );

    // If photo day
    const isPhotoDay = new Date().getDate() === 1;
    if (isPhotoDay) {
      notifications.push({
        id: 'notif-07',
        scheduledTime: '09:00 AM',
        title: 'Monthly Progress Photo Due',
        message: 'Take today\'s front and back progress photo for AI visual body composition tracking.',
        category: 'Photos',
        actionUrl: '/progress',
      });
    }

    return {
      date: dateStr,
      notifications,
    };
  }
}

export const dailyNotifications = new DailyNotifications();
