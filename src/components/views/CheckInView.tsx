import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckIn, MoodType, SorenessType, UserProfile } from '../../types';
import { checkInService } from '../../services';
import { Sparkles, Moon, Scale, Zap, Activity, Droplets, AlertCircle, ArrowRight } from 'lucide-react';

interface CheckInViewProps {
  profile?: UserProfile;
  onCheckInComplete: (checkIn: CheckIn) => void;
  onSkip?: () => void;
}

const MOOD_OPTIONS: MoodType[] = [
  'Excellent 😄',
  'Good 🙂',
  'Normal 😐',
  'Tired 😴',
  'Exhausted 😫',
];

const SORENESS_OPTIONS: SorenessType[] = ['None', 'Light', 'Medium', 'Heavy'];

export const CheckInView: React.FC<CheckInViewProps> = ({
  profile,
  onCheckInComplete,
  onSkip,
}) => {
  const [mood, setMood] = useState<MoodType>('Good 🙂');
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [weightKg, setWeightKg] = useState<number>(profile?.currentWeightKg || 68);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [soreness, setSoreness] = useState<SorenessType>('None');
  const [waterAfterWaking, setWaterAfterWaking] = useState<boolean>(true);
  const [painNotes, setPainNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checkIn = checkInService.save({
      mood,
      sleepHours,
      weightKg: Number(weightKg),
      energyLevel,
      soreness,
      waterAfterWaking,
      painNotes: painNotes.trim() || undefined,
    });
    onCheckInComplete(checkIn);
  };

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Top Banner */}
      <Card className="bg-[#111111] border-[#222222]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#10B981]" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Daily Readiness Check-In</h1>
          </div>
          <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
            Today
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Quick 30-second assessment to track your recovery, sleep, and energy levels.
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Mood */}
        <Card className="bg-[#111111] border-[#222222]">
          <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>1. How do you feel today?</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
                  mood === m
                    ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] shadow-lg shadow-[#10B981]/10'
                    : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-[#333333]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Card>

        {/* 2. Sleep Hours */}
        <Card className="bg-[#111111] border-[#222222]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>2. How many hours did you sleep?</span>
            </label>
            <span className="text-lg font-extrabold text-[#10B981]">{sleepHours} hrs</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full accent-[#10B981] h-2 bg-[#1e1e1e] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-gray-500 font-medium mt-1">
            <span>0h (Exhausted)</span>
            <span>6h</span>
            <span>12h (Fully Rested)</span>
          </div>
        </Card>

        {/* 3. Current Weight */}
        <Card className="bg-[#111111] border-[#222222]">
          <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#10B981]" />
            <span>3. Current Weight (kg)</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
            required
            className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-3 text-base text-white font-bold focus:outline-none focus:border-[#10B981]"
          />
        </Card>

        {/* 4. Energy Level */}
        <Card className="bg-[#111111] border-[#222222]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>4. Energy Level (1–10)</span>
            </label>
            <span className="text-lg font-extrabold text-[#10B981]">{energyLevel} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
            className="w-full accent-[#10B981] h-2 bg-[#1e1e1e] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-gray-500 font-medium mt-1">
            <span>1 (Very Low)</span>
            <span>5 (Moderate)</span>
            <span>10 (Peak Energy)</span>
          </div>
        </Card>

        {/* 5. Muscle Soreness */}
        <Card className="bg-[#111111] border-[#222222]">
          <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10B981]" />
            <span>5. Muscle Soreness</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SORENESS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSoreness(s)}
                className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  soreness === s
                    ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                    : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-[#333333]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        {/* 6. Water After Waking */}
        <Card className="bg-[#111111] border-[#222222]">
          <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>6. Water after waking?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWaterAfterWaking(true)}
              className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                waterAfterWaking
                  ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                  : 'bg-[#181818] border-[#262626] text-gray-400'
              }`}
            >
              Yes 💧
            </button>
            <button
              type="button"
              onClick={() => setWaterAfterWaking(false)}
              className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                !waterAfterWaking
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-[#181818] border-[#262626] text-gray-400'
              }`}
            >
              No
            </button>
          </div>
        </Card>

        {/* 7. Any Pain Today */}
        <Card className="bg-[#111111] border-[#222222]">
          <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>7. Any pain today? (Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Slight lower back stiffness, knee ache..."
            value={painNotes}
            onChange={(e) => setPainNotes(e.target.value)}
            className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#10B981]"
          />
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="py-4 text-base font-bold shadow-xl shadow-[#10B981]/15"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Complete Check-In & Go to Dashboard
          </Button>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 py-2 font-medium cursor-pointer"
            >
              Skip Check-in for now
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
