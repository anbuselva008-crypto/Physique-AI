import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { WorkoutData } from '../../types';
import { WorkoutTimelineView } from './WorkoutTimelineView';
import { WorkoutHistoryView } from './WorkoutHistoryView';
import { Play, Clock, Dumbbell, CheckCircle2, Calendar, History, List } from 'lucide-react';

interface WorkoutListViewProps {
  workout: WorkoutData;
  onStartWorkout: () => void;
}

export const WorkoutListView: React.FC<WorkoutListViewProps> = ({
  workout,
  onStartWorkout,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'timeline' | 'history'>('today');

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111111] border border-[#222222] rounded-2xl">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'today'
              ? 'bg-[#10B981] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#181818]'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Today Routine</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-[#10B981] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#181818]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Split</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#10B981] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#181818]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>

      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Overview Card */}
          <Card className="bg-[#111111] border-[#222222]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
                Today's Routine
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1.5 bg-[#181818] px-3 py-1 rounded-full border border-[#2a2a2a]">
                <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                {workout.durationMinutes} Minutes
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {workout.title}
            </h1>
            <p className="text-xs text-gray-400">
              Targeted hypertrophy workout designed for strength and muscle growth.
            </p>
          </Card>

          {/* Exercises List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
              Exercises ({workout.exercises.length})
            </h2>

            {workout.exercises.map((exercise, index) => {
              const setsCount = exercise.sets.length;
              const reps = exercise.sets[0]?.targetReps || 10;
              const isCompleted = exercise.sets.every((s) => s.completed);

              return (
                <Card
                  key={exercise.id}
                  className="bg-[#111111] border-[#222222] p-4 sm:p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#181818] border border-[#282828] flex items-center justify-center font-bold text-gray-300 text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-0.5">
                        {exercise.name}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-[#10B981]" />
                        {setsCount} × {reps} reps
                      </p>
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#10B981]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Done</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">
                      {setsCount} sets
                    </span>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Start Workout Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={onStartWorkout}
            className="py-4 text-lg mt-4 shadow-xl shadow-[#10B981]/15 cursor-pointer"
            icon={<Play className="w-6 h-6 fill-[#050505]" />}
          >
            Start Workout
          </Button>
        </div>
      )}

      {activeTab === 'timeline' && (
        <WorkoutTimelineView onStartWorkout={onStartWorkout} />
      )}

      {activeTab === 'history' && (
        <WorkoutHistoryView />
      )}
    </div>
  );
};
