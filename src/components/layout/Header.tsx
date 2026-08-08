import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  location?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Anbu',
  location = 'Coimbatore, India',
}) => {
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="pt-8 pb-6 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-gray-500 text-xs sm:text-sm font-medium tracking-wide uppercase">
            {formattedDate} • {location}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {getGreetingTime()}, {userName} <span className="inline-block animate-wave">👋</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-11 h-11 rounded-full border border-[#222222] bg-[#111111] hover:bg-[#181818] flex items-center justify-center transition-colors cursor-pointer text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-full border-2 border-[#10B981] bg-[#111111] overflow-hidden flex items-center justify-center font-bold text-[#10B981] text-base shadow-lg shadow-[#10B981]/10">
            {userName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
