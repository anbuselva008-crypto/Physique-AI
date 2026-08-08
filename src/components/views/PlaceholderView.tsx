import React from 'react';
import { Card } from '../ui/Card';
import { TabType } from '../../types';
import { Dumbbell, TrendingUp, User, Lock } from 'lucide-react';

interface PlaceholderViewProps {
  type: TabType;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ type }) => {
  const metaMap = {
    workout: {
      title: 'Workout Routines',
      subtitle: 'Chest + Triceps scheduled for today',
      icon: Dumbbell,
      description: 'Detailed workout logger and set breakdown will be active in upcoming releases.',
    },
    progress: {
      title: 'Progress Tracker',
      subtitle: 'Natural Body Transformation Journey',
      icon: TrendingUp,
      description: 'Strength stats, body weight metrics, and photo timeline placeholders.',
    },
    profile: {
      title: 'Anbu Profile',
      subtitle: 'College Student • Coimbatore, TN',
      icon: User,
      description: 'Personalized settings, college schedule sync, and goal configuration.',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Home',
      icon: Dumbbell,
      description: 'Dashboard overview',
    },
    nutrition: {
      title: 'Nutrition',
      subtitle: 'Dietary Tracking',
      icon: Dumbbell,
      description: 'Nutrition tracker',
    },
    knowledge: {
      title: 'Knowledge Library',
      subtitle: 'Evidence-Based Fitness',
      icon: Dumbbell,
      description: 'Library database',
    },
    ai_coach: {
      title: 'AI Coach',
      subtitle: 'Smart Assistant',
      icon: Dumbbell,
      description: 'AI Coaching chat',
    },
  };

  const meta = metaMap[type] || metaMap.dashboard;

  const Icon = meta.icon;

  return (
    <div className="pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-4">
      <Card className="text-center py-12 px-6">
        <div className="w-16 h-16 rounded-3xl bg-[#181818] border border-[#262626] flex items-center justify-center text-[#10B981] mx-auto mb-5 shadow-lg">
          <Icon className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{meta.title}</h2>
        <p className="text-sm font-medium text-[#10B981] mb-4">{meta.subtitle}</p>

        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
          {meta.description}
        </p>

        <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-[#080808] border border-[#222222] px-4 py-2 rounded-2xl">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span>V1 Foundation Shell • Active Module coming soon</span>
        </div>
      </Card>
    </div>
  );
};
