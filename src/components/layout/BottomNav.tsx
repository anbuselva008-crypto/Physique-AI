import React from 'react';
import { TabType } from '../../types';
import { Home, Zap, Utensils, BookOpen, TrendingUp, User, Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'workout', label: 'Workout', icon: Zap },
  { id: 'ai_coach', label: 'AI Coach', icon: Bot },
  { id: 'nutrition', label: 'Diet', icon: Utensils },
  { id: 'knowledge', label: 'Library', icon: BookOpen },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-[#111111]/85 backdrop-blur-xl border border-[#222222] rounded-full p-2 flex items-center justify-between z-50 shadow-2xl shadow-black/50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-full transition-colors cursor-pointer ${
              isActive ? 'text-[#10B981]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
