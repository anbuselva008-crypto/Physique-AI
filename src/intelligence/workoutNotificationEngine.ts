import { workoutService } from '../services/workoutService';
import { streakEngine } from './streakEngine';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'workout_today' | 'workout_missed' | 'workout_completed' | 'tomorrow_preview' | 'weekly_review' | 'monthly_summary';
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const workoutNotificationEngine = {
  generateNotifications(): InAppNotification[] {
    const notifications: InAppNotification[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const history = workoutService.getCompletedWorkouts();
    const isCompletedToday = history.some((w) => w.date === todayStr);
    const metrics = streakEngine.calculateMetrics();

    if (isCompletedToday) {
      notifications.push({
        id: `notif-completed-${todayStr}`,
        title: 'Workout Completed! 🔥',
        message: `Great job! You completed today's session. Current streak is now ${metrics.currentStreak} days!`,
        type: 'workout_completed',
        timestamp: 'Just now',
        read: false,
        priority: 'high',
      });

      const tomorrow = workoutService.getTomorrowWorkout();
      notifications.push({
        id: `notif-tomorrow-${todayStr}`,
        title: `Tomorrow: ${tomorrow.title}`,
        message: `Up next: ${tomorrow.focus} (${tomorrow.durationMinutes} mins). Focus: ${tomorrow.coachFocus}.`,
        type: 'tomorrow_preview',
        timestamp: '1h ago',
        read: false,
        priority: 'medium',
      });
    } else {
      const todayWorkout = workoutService.getTodayWorkout();
      notifications.push({
        id: `notif-today-${todayStr}`,
        title: `Today's Mission: ${todayWorkout.title}`,
        message: `Target duration: ${todayWorkout.durationMinutes} mins. Ready to hit the gym?`,
        type: 'workout_today',
        timestamp: 'Today',
        read: false,
        priority: 'high',
      });
    }

    if (metrics.weeklyCompletionRate < 50) {
      notifications.push({
        id: `notif-weekly-review-${todayStr}`,
        title: 'Weekly Training Review 📊',
        message: `Weekly completion is at ${metrics.weeklyCompletionRate}%. Let's crush your upcoming sessions to stay on target!`,
        type: 'weekly_review',
        timestamp: 'This Week',
        read: false,
        priority: 'low',
      });
    }

    return notifications;
  },
};
