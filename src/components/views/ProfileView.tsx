import React, { useState } from 'react';
import { UserProfile, FitnessGoal, TrainingExperience, WorkoutLocation, DietType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  User,
  Activity,
  Dumbbell,
  Clock,
  Utensils,
  Wallet,
  FileText,
  Save,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

const FITNESS_GOALS: FitnessGoal[] = ['Lose Fat', 'Build Muscle', 'Body Recomposition', 'Maintain'];
const TRAINING_EXPERIENCES: TrainingExperience[] = ['Beginner', 'Intermediate', 'Advanced'];
const WORKOUT_LOCATIONS: WorkoutLocation[] = ['Home', 'Gym'];
const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbells', 'Resistance Bands', 'Machines', 'Bodyweight'];
const DIET_OPTIONS: DietType[] = ['Vegetarian', 'Egg', 'Chicken', 'Everything'];

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (field: keyof UserProfile['schedule'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }));
  };

  const toggleEquipment = (item: string) => {
    setFormData((prev) => {
      const exists = prev.equipment.includes(item);
      const updated = exists
        ? prev.equipment.filter((i) => i !== item)
        : [...prev.equipment, item];
      return { ...prev, equipment: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Header Banner */}
      <Card className="bg-[#111111] border-[#222222]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#10B981]" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Personal Profile</h1>
          </div>
          <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
            AI Calibration Data
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Personalize your metrics, schedule, and preferences. This data directly powers your daily routine and coaching.
        </p>
      </Card>

      {savedSuccess && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>Profile saved successfully! Dashboard greeting & metrics updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Personal Details */}
        <Card className="bg-[#111111] border-[#222222] space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#10B981]" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', Number(e.target.value))}
                required
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981] transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Physical Metrics & Goals */}
        <Card className="bg-[#111111] border-[#222222] space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10B981]" />
            Physical Metrics & Goals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => handleInputChange('heightCm', Number(e.target.value))}
                required
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Weight (kg)</label>
              <input
                type="number"
                value={formData.currentWeightKg}
                onChange={(e) => handleInputChange('currentWeightKg', Number(e.target.value))}
                required
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Weight (kg)</label>
              <input
                type="number"
                value={formData.targetWeightKg}
                onChange={(e) => handleInputChange('targetWeightKg', Number(e.target.value))}
                required
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Fitness Goal</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FITNESS_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleInputChange('fitnessGoal', goal)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.fitnessGoal === goal
                      ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]'
                      : 'bg-[#181818] border-[#262626] text-gray-400 hover:border-[#333333]'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Training Setup */}
        <Card className="bg-[#111111] border-[#222222] space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#10B981]" />
            Training Setup
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Training Experience</label>
              <div className="grid grid-cols-3 gap-2">
                {TRAINING_EXPERIENCES.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => handleInputChange('trainingExperience', exp)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.trainingExperience === exp
                        ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]'
                        : 'bg-[#181818] border-[#262626] text-gray-400 hover:border-[#333333]'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Workout Location</label>
              <div className="grid grid-cols-2 gap-2">
                {WORKOUT_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleInputChange('workoutLocation', loc)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.workoutLocation === loc
                        ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]'
                        : 'bg-[#181818] border-[#262626] text-gray-400 hover:border-[#333333]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Available Equipment (Multi-select)
            </label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((item) => {
                const selected = formData.equipment.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#10B981] border-[#10B981] text-black'
                        : 'bg-[#181818] border-[#262626] text-gray-400 hover:border-[#333333]'
                    }`}
                  >
                    {item} {selected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Daily Schedule */}
        <Card className="bg-[#111111] border-[#222222] space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#10B981]" />
            College & Daily Schedule
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">Wake-up</label>
              <input
                type="time"
                value={formData.schedule.wakeUpTime}
                onChange={(e) => handleScheduleChange('wakeUpTime', e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">College Start</label>
              <input
                type="time"
                value={formData.schedule.collegeStart}
                onChange={(e) => handleScheduleChange('collegeStart', e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">College End</label>
              <input
                type="time"
                value={formData.schedule.collegeEnd}
                onChange={(e) => handleScheduleChange('collegeEnd', e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">Gym Time</label>
              <input
                type="time"
                value={formData.schedule.gymTime}
                onChange={(e) => handleScheduleChange('gymTime', e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-medium text-gray-400 mb-1">Sleep Time</label>
              <input
                type="time"
                value={formData.schedule.sleepTime}
                onChange={(e) => handleScheduleChange('sleepTime', e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>
        </Card>

        {/* Diet & Budget */}
        <Card className="bg-[#111111] border-[#222222] space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#10B981]" />
            Diet & Budget
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleInputChange('diet', d)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.diet === d
                        ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]'
                        : 'bg-[#181818] border-[#262626] text-gray-400 hover:border-[#333333]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
                Monthly Food Budget (₹)
              </label>
              <input
                type="text"
                value={formData.monthlyBudget}
                onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                placeholder="e.g. 3500"
                className="w-full bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>
          </div>
        </Card>

        {/* Medical Notes */}
        <Card className="bg-[#111111] border-[#222222] space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#10B981]" />
            Medical Notes (Optional)
          </h2>
          <textarea
            rows={3}
            value={formData.medicalNotes || ''}
            onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
            placeholder="Any past injuries, joint issues, or medical conditions..."
            className="w-full bg-[#181818] border border-[#262626] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#10B981] resize-none"
          />
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          className="py-4 text-base font-bold shadow-xl shadow-[#10B981]/15"
          icon={<Save className="w-5 h-5" />}
        >
          Save Profile Changes
        </Button>
      </form>
    </div>
  );
};
