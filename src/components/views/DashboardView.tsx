import React, { useState, useEffect } from 'react';
import { CheckIn, UserProfile } from '../../types';
import { TodayMissionCard } from '../dashboard/TodayMissionCard';
import { TodayStatusCard } from '../dashboard/TodayStatusCard';
import { ProgressSummaryCard } from '../dashboard/ProgressSummaryCard';
import { WaterCard } from '../dashboard/WaterCard';
import { NutritionCard } from '../dashboard/NutritionCard';
import { WorkoutJourneyCard } from '../dashboard/WorkoutJourneyCard';
import { TomorrowWorkoutCard } from '../dashboard/TomorrowWorkoutCard';
import { StreakMetricsCard } from '../dashboard/StreakMetricsCard';
import { progressService, workoutService, nutritionService } from '../../services';
import { stateSynchronizer } from '../../integration/stateSynchronizer';
import { Card } from '../ui/Card';
import { GraduationCap, Calendar, ShieldCheck } from 'lucide-react';

interface DashboardViewProps {
  profile?: UserProfile;
  checkIn?: CheckIn | null;
  onStartWorkout?: () => void;
  onRetakeCheckIn?: () => void;
  onNavigateToProgress?: () => void;
  onNavigateToWorkout?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  checkIn = null,
  onStartWorkout,
  onRetakeCheckIn,
  onNavigateToProgress,
  onNavigateToWorkout,
}) => {
  const [todayDate] = useState(() => progressService.getFormattedDate(0));
  
  // Real Service State
  const [workoutStats, setWorkoutStats] = useState(() => workoutService.statistics());
  const [nutritionData, setNutritionData] = useState(() => nutritionService.load(todayDate));
  const [progressSummary, setProgressSummary] = useState(() => progressService.getProgressSummary());

  const refreshDashboardData = () => {
    setWorkoutStats(workoutService.statistics());
    setNutritionData(nutritionService.load(todayDate));
    setProgressSummary(progressService.getProgressSummary());
  };

  useEffect(() => {
    refreshDashboardData();
    // Subscribe to state synchronizer so any meal, workout, water or checkin update re-fetches
    const unsubscribe = stateSynchronizer.subscribe(() => {
      refreshDashboardData();
    });
    return () => unsubscribe();
  }, [todayDate]);

  const handleAddWater = () => {
    nutritionService.addWaterIntake(todayDate, 250);
    stateSynchronizer.notifySubscribers();
  };

  const consumedCals = nutritionData.mealLogs.reduce((sum, item) => sum + item.calories, 0);
  const targetCals = nutritionData.goals.targetCalories || 2200;
  const currentWaterLiters = +(nutritionData.waterLog.ml / 1000).toFixed(2);
  const targetWaterLiters = +((nutritionData.goals.targetWaterMl || 3000) / 1000).toFixed(1);

  const city = profile?.city || 'Coimbatore';
  const gymTime = profile?.schedule?.gymTime || '18:00';

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Today's Check-In Status Card */}
      <TodayStatusCard checkIn={checkIn} onRetakeCheckIn={onRetakeCheckIn} />

      {/* Primary Hero Section: Today's Mission */}
      <TodayMissionCard
        workoutTitle={workoutStats.workoutTitle || 'Chest + Triceps'}
        durationMinutes={workoutStats.durationMinutes || 45}
        completionPercentage={workoutStats.completionPercentage}
        onStartWorkout={onStartWorkout}
      />

      {/* Tomorrow's Workout Preview Card */}
      <TomorrowWorkoutCard onViewSplit={onNavigateToWorkout} />

      {/* Workout Journey Calendar Card */}
      <WorkoutJourneyCard onStartWorkout={onStartWorkout} />

      {/* Streak & Consistency Metrics Engine Card */}
      <StreakMetricsCard />

      {/* Progress Summary Card */}
      <ProgressSummaryCard
        summary={progressSummary}
        onViewProgress={onNavigateToProgress}
      />

      {/* Grid: Water and Nutrition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <WaterCard
          currentLiters={currentWaterLiters}
          targetLiters={targetWaterLiters}
          onAddWater={handleAddWater}
        />
        <NutritionCard
          consumedCalories={consumedCals}
          targetCalories={targetCals}
        />
      </div>

      {/* College & Routine Context Card */}
      <Card className="bg-[#111111] border-[#222222]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#10B981]" />
            <h3 className="text-sm font-bold text-white">{city} Student Routine</h3>
          </div>
          <span className="text-xs text-gray-400 font-medium bg-[#1a1a1a] px-2.5 py-1 rounded-lg border border-[#2a2a2a]">
            Target Gym: {gymTime}
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          Customized natural transformation plan tuned for academic schedule and daily energy levels.
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[#1e1e1e] text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Goal: {profile?.fitnessGoal || 'Build Muscle'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Natural Athlete</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
