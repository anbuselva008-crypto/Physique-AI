import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { TabType, UserProfile } from '../../types';

interface AppLayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  profile: UserProfile;
  formattedLocation: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onTabChange,
  profile,
  formattedLocation,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#10B981] selection:text-black relative">
      {/* Header */}
      <Header userName={profile.name || 'Anbu'} location={formattedLocation} />

      {/* Main Content Area with Safe Area Bottom Padding */}
      <main
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 w-full pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] transition-all duration-300"
      >
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
