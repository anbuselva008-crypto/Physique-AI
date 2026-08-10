import React from 'react';
import { streakEngine } from '../../intelligence/streakEngine';
import { Flame, Trophy, Percent, Droplets, Moon, Award, Target, CalendarX } from 'lucide-react';

export const StreakMetricsCard: React.FC = () => {
  const metrics = streakEngine.calculateMetrics();

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-6 hover:border-[#333333] transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 className="text-lg font-bold text-white tracking-tight">Consistency & Streaks Engine</h2>
        </div>

        <span className="text-xs font-extrabold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-full">
          Auto-Calculated
        </span>
      </div>

      {/* Main Hero Streaks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{metrics.currentStreak}</span>
          <span className="text-[10px] text-gray-500 ml-1">Days</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Longest</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{metrics.longestStreak}</span>
          <span className="text-[10px] text-gray-500 ml-1">Days</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center gap-2 text-[#10B981] mb-1">
            <Percent className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Weekly %</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{metrics.weeklyCompletionRate}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center gap-2 text-[#3B82F6] mb-1">
            <Target className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly %</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{metrics.monthlyCompletionRate}%</span>
        </div>
      </div>

      {/* Secondary Habits & Milestones Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <span className="text-gray-400 block text-[10px]">Hydration Streak</span>
            <span className="font-extrabold text-white">{metrics.hydrationStreak} Days</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] flex items-center gap-2.5">
          <Moon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <div>
            <span className="text-gray-400 block text-[10px]">Sleep Streak</span>
            <span className="font-extrabold text-white">{metrics.sleepStreak} Days</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] flex items-center gap-2.5">
          <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-gray-400 block text-[10px]">Perfect Weeks</span>
            <span className="font-extrabold text-white">{metrics.perfectWeeksCount} Weeks</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] flex items-center gap-2.5">
          <CalendarX className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div>
            <span className="text-gray-400 block text-[10px]">Missed Days</span>
            <span className="font-extrabold text-white">{metrics.missedDaysThisMonth} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};
