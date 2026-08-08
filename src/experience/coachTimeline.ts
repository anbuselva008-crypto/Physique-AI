import { TimelineEvent } from './dashboardState';
import { checkInService } from '../services/checkInService';
import { workoutService } from '../services/workoutService';
import { nutritionService } from '../services/nutritionService';
import { progressService } from '../services/progressService';
import { getPersona } from '../persona';

/**
 * CoachTimeline
 * Generates a chronological transformation history capturing milestones, check-ins,
 * workouts, PRs, photos, and physical body composition improvements.
 */
export class CoachTimeline {
  /**
   * Generates the chronological transformation history timeline.
   */
  public generateTimeline(): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const persona = getPersona();
    const checkInStats = checkInService.statistics();
    const workoutStats = workoutService.statistics();
    const nutritionData = nutritionService.load();
    const progressData = progressService.load();

    // 1. Started Journey
    events.push({
      id: 'tl-start-01',
      date: 'Day 1',
      title: 'Transformation Journey Launched',
      description: `Persona initialized for ${persona.personal?.name || 'User'} with primary goal: ${persona.fitness?.goal || 'Build Muscle'}.`,
      category: 'Milestone',
      importance: 'high',
    });

    // 2. First Check-in
    if (checkInStats.hasCheckedInToday) {
      events.push({
        id: 'tl-chk-01',
        date: 'Today',
        title: 'Morning Check-In Logged',
        description: `Logged sleep (${checkInStats.todaySleepHours}h) & energy (${checkInStats.todayEnergyLevel}/10).`,
        category: 'Checkin',
        importance: 'medium',
      });
    }

    // 3. Workout Achievements
    if (workoutStats.completedSets > 0) {
      events.push({
        id: 'tl-wrk-01',
        date: 'Recent',
        title: `${workoutStats.workoutTitle || 'Workout'} Completed`,
        description: `Completed ${workoutStats.completedSets} total sets (${workoutStats.completionPercentage.toFixed(0)}% completion).`,
        category: 'Workout',
        importance: 'high',
      });
    }

    // 4. PR / Strength Milestone
    events.push({
      id: 'tl-pr-01',
      date: 'Recent',
      title: 'Progressive Overload Target Achieved',
      description: 'Maintained strict 3-second eccentric tempo across all compound working sets.',
      category: 'PR',
      importance: 'medium',
    });

    // 5. Nutrition / Protein Milestone
    const mealLogs = nutritionData.mealLogs || [];
    if (mealLogs.length > 0) {
      const totalProtein = mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);
      events.push({
        id: 'tl-nutr-01',
        date: 'Today',
        title: 'Nutrition Log Active',
        description: `Logged ${mealLogs.length} meals totaling ${totalProtein}g protein.`,
        category: 'Nutrition',
        importance: 'medium',
      });
    }

    // 6. Progress Photos & Weight Trends
    const photos = progressData.photos || [];
    if (photos.length > 0) {
      events.push({
        id: 'tl-vis-01',
        date: photos[photos.length - 1].date || 'Month 1',
        title: 'Visual Body Composition Audit Logged',
        description: 'Uploaded front and back progress photos for Gemini Vision body fat estimation.',
        category: 'Vision',
        importance: 'high',
      });
    }

    const weights = progressData.weights || [];
    if (weights.length >= 2) {
      const startW = weights[0].weightKg;
      const endW = weights[weights.length - 1].weightKg;
      const diff = endW - startW;

      events.push({
        id: 'tl-wgt-01',
        date: 'Progress',
        title: 'Scale Weight Trend Logged',
        description: `Scale weight moved from ${startW.toFixed(1)}kg to ${endW.toFixed(1)}kg (${diff >= 0 ? '+' : ''}${diff.toFixed(1)}kg).`,
        category: 'Roadmap',
        importance: 'high',
      });
    }

    return events;
  }
}

export const coachTimeline = new CoachTimeline();
