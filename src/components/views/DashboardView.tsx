import React from 'react';
import { CheckIn, UserProfile } from '../../types';
import { TodayMissionCard } from '../dashboard/TodayMissionCard';
import { TodayStatusCard } from '../dashboard/TodayStatusCard';
import { ProgressSummaryCard } from '../dashboard/ProgressSummaryCard';
import { WaterCard } from '../dashboard/WaterCard';
import { NutritionCard } from '../dashboard/NutritionCard';
import { progressService } from '../../services';
import { Card } from '../ui/Card';
import { GraduationCap, Calendar, ShieldCheck } from 'lucide-react';

interface DashboardViewProps {
  profile?: UserProfile;
  checkIn?: CheckIn | null;
  onStartWorkout?: () => void;
  onRetakeCheckIn?: () => void;
  onNavigateToProgress?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  checkIn = null,
  onStartWorkout,
  onRetakeCheckIn,
  onNavigateToProgress,
}) => {
  const [waterAmount, setWaterAmount] = React.useState(2.5);
  const progressSummary = progressService.getProgressSummary();

  const handleAddWater = () => {
    setWaterAmount((prev) => Math.min(5.0, +(prev + 0.25).toFixed(2)));
  };

  const city = profile?.city || 'Coimbatore';
  const gymTime = profile?.schedule?.gymTime || '18:00';

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Today's Check-In Status Card */}
      <TodayStatusCard checkIn={checkIn} onRetakeCheckIn={onRetakeCheckIn} />

      {/* Primary Hero Section: Today's Mission */}
      <TodayMissionCard
        workoutTitle="Chest + Triceps"
        durationMinutes={45}
        onStartWorkout={onStartWorkout}
      />

      {/* Progress Summary Card */}
      <ProgressSummaryCard
        summary={progressSummary}
        onViewProgress={onNavigateToProgress}
      />

      {/* Grid: Water and Nutrition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <WaterCard
          currentLiters={waterAmount}
          targetLiters={4.0}
          onAddWater={handleAddWater}
        />
        <NutritionCard
          consumedCalories={1850}
          targetCalories={2400}
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
