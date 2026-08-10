import React from 'react';
import { TabType } from '../../types';
import { Home, Zap, Utensils, BookOpen, TrendingUp, User, Bot } from 'lucide-react';
import { motion } from 'motion/react';

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
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % navItems.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + navItems.length) % navItems.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = navItems.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onTabChange(navItems[nextIndex].id);
    const nextElem = document.getElementById(`tab-${navItems[nextIndex].id}`);
    if (nextElem) nextElem.focus();
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex justify-center items-end px-2 sm:px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
      style={{
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <nav
        role="tablist"
        aria-label="Main Navigation"
        className="pointer-events-auto w-full max-w-lg bg-[#111111]/90 backdrop-blur-2xl border border-[#222222] rounded-full p-1 sm:p-1.5 flex items-center justify-around shadow-2xl shadow-black/80 ring-1 ring-white/5 transition-all duration-300"
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative flex-1 min-h-[48px] min-w-[40px] flex flex-col items-center justify-center gap-0.5 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] ${
                isActive ? 'text-[#10B981]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#10B981]/15 border border-[#10B981]/30 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="w-5 h-5 z-10 transition-transform duration-200 active:scale-95" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider z-10 whitespace-nowrap scale-90 sm:scale-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
