import React, { useState } from 'react';
import { CheckIn, TabType, UserProfile } from './types';
import { profileService, checkInService } from './services';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/views/DashboardView';
import { CheckInView } from './components/views/CheckInView';
import { WorkoutEngineView } from './components/views/WorkoutEngineView';
import { ProfileView } from './components/views/ProfileView';
import { ProgressView } from './components/views/ProgressView';
import { NutritionView } from './components/views/NutritionView';
import { KnowledgeView } from './components/views/KnowledgeView';
import { AICoachView } from './components/views/AICoachView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(() => profileService.load());
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(() => checkInService.load());
  const [showCheckInView, setShowCheckInView] = useState<boolean>(() => !checkInService.hasCompletedTodayCheckIn());

  const handleStartWorkout = () => {
    setActiveTab('workout');
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    profileService.save(updatedProfile);
  };

  const handleCheckInComplete = (completedCheckIn: CheckIn) => {
    setTodayCheckIn(completedCheckIn);
    setShowCheckInView(false);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'dashboard' && showCheckInView && todayCheckIn) {
      setShowCheckInView(false);
    }
    setActiveTab(tab);
  };

  const formattedLocation = `${profile.city || 'Coimbatore'}, ${profile.country || 'India'}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#10B981] selection:text-black">
      {/* Header */}
      <Header userName={profile.name || 'Anbu'} location={formattedLocation} />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'dashboard' && (
          showCheckInView ? (
            <CheckInView
              profile={profile}
              onCheckInComplete={handleCheckInComplete}
              onSkip={todayCheckIn ? () => setShowCheckInView(false) : undefined}
            />
          ) : (
            <DashboardView
              profile={profile}
              checkIn={todayCheckIn}
              onStartWorkout={handleStartWorkout}
              onRetakeCheckIn={() => setShowCheckInView(true)}
              onNavigateToProgress={() => setActiveTab('progress')}
            />
          )
        )}
        {activeTab === 'workout' && (
          <WorkoutEngineView onBackToDashboard={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'ai_coach' && (
          <AICoachView />
        )}
        {activeTab === 'nutrition' && (
          <NutritionView />
        )}
        {activeTab === 'knowledge' && (
          <KnowledgeView />
        )}
        {activeTab === 'profile' && (
          <ProfileView profile={profile} onSaveProfile={handleSaveProfile} />
        )}
        {activeTab === 'progress' && (
          <ProgressView />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}


