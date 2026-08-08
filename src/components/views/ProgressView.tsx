import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  WeightEntry,
  BodyMeasurements,
  ProgressPhoto,
  ExercisePR,
  PhotoPose,
} from '../../types';
import { progressService } from '../../services';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Scale,
  Ruler,
  Dumbbell,
  Camera,
  Activity,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  Flame,
  Calendar,
  Zap,
  Moon,
  Droplets,
} from 'lucide-react';

type ProgressTab = 'weight' | 'measurements' | 'prs' | 'photos' | 'stats';

export const ProgressView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProgressTab>('weight');

  // Data State
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurements[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [prs, setPRs] = useState<ExercisePR[]>([]);
  const [stats, setStats] = useState(() => progressService.getProgressStats());

  // Form State
  const [newWeight, setNewWeight] = useState<string>('');
  const [newWeightNote, setNewWeightNote] = useState<string>('');
  const [weightLoggedSuccess, setWeightLoggedSuccess] = useState<boolean>(false);

  // Measurement Form State
  const [mDate, setMDate] = useState<string>(progressService.getFormattedDate(0));
  const [mChest, setMChest] = useState<string>('');
  const [mWaist, setMWaist] = useState<string>('');
  const [mShoulders, setMShoulders] = useState<string>('');
  const [mArms, setMArms] = useState<string>('');
  const [mThighs, setMThighs] = useState<string>('');

  // PR Form State
  const [prExercise, setPRExercise] = useState<string>('Bench Press');
  const [prCustomExercise, setPRCustomExercise] = useState<string>('');
  const [prWeight, setPRWeight] = useState<string>('');
  const [prReps, setPRReps] = useState<string>('5');

  // Photo Form State
  const [photoPose, setPhotoPose] = useState<PhotoPose>('Front');

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setWeights(progressService.getWeightHistory());
    setMeasurements(progressService.getMeasurements());
    setPhotos(progressService.getProgressPhotos());
    setPRs(progressService.getPRs());
    setStats(progressService.getProgressStats());
  };

  // 1. Weight handlers
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    const val = parseFloat(newWeight);
    if (isNaN(val)) return;

    const updated = progressService.addWeightEntry({
      date: progressService.getFormattedDate(0),
      weightKg: val,
      note: newWeightNote || undefined,
    });
    setWeights(updated);
    setNewWeight('');
    setNewWeightNote('');
    setWeightLoggedSuccess(true);
    setTimeout(() => setWeightLoggedSuccess(false), 2500);
  };

  // 2. Measurements handlers
  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = progressService.addMeasurementEntry({
      date: mDate || progressService.getFormattedDate(0),
      chestCm: mChest ? parseFloat(mChest) : undefined,
      waistCm: mWaist ? parseFloat(mWaist) : undefined,
      shouldersCm: mShoulders ? parseFloat(mShoulders) : undefined,
      armsCm: mArms ? parseFloat(mArms) : undefined,
      thighsCm: mThighs ? parseFloat(mThighs) : undefined,
    });
    setMeasurements(updated);
    setMChest('');
    setMWaist('');
    setMShoulders('');
    setMArms('');
    setMThighs('');
  };

  // 3. PR Handlers
  const handleAddPR = (e: React.FormEvent) => {
    e.preventDefault();
    const exerciseName = prExercise === 'Custom' ? prCustomExercise : prExercise;
    if (!exerciseName || !prWeight) return;

    const weightVal = parseFloat(prWeight);
    const repsVal = parseInt(prReps, 10) || 1;

    const updated = progressService.addOrUpdatePR(exerciseName, weightVal, repsVal);
    setPRs(updated);
    setPRWeight('');
    if (prExercise === 'Custom') setPRCustomExercise('');
  };

  // 4. Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const updated = progressService.addProgressPhoto({
          date: progressService.getFormattedDate(0),
          pose: photoPose,
          imageDataUrl: reader.result,
        });
        setPhotos(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = progressService.deleteProgressPhoto(id);
    setPhotos(updated);
  };

  // Trends calculation
  const latestWeight = weights.length ? weights[weights.length - 1].weightKg : 0;
  const firstWeight = weights.length ? weights[0].weightKg : 0;
  const totalWeightDiff = +(latestWeight - firstWeight).toFixed(1);

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Page Title */}
      <Card className="bg-[#111111] border-[#222222]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Progress Hub</h1>
          </div>
          <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
            Offline Tracker
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Monitor your body transformation, strength records, and physical measurements over time.
        </p>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('weight')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'weight'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
              : 'bg-[#141414] border border-[#222222] text-gray-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Weight</span>
        </button>

        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'measurements'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
              : 'bg-[#141414] border border-[#222222] text-gray-400 hover:text-white'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Measurements</span>
        </button>

        <button
          onClick={() => setActiveTab('prs')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'prs'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
              : 'bg-[#141414] border border-[#222222] text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Strength PRs</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'photos'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
              : 'bg-[#141414] border border-[#222222] text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Photos</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
              : 'bg-[#141414] border border-[#222222] text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Stats & Streaks</span>
        </button>
      </div>

      {/* TAB 1: WEIGHT HISTORY */}
      {activeTab === 'weight' && (
        <div className="space-y-6">
          {/* Quick Log Form */}
          <Card className="bg-[#111111] border-[#222222]">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#10B981]" />
              <span>Log Today's Weight</span>
            </h2>

            {weightLoggedSuccess && (
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] p-3 rounded-xl flex items-center gap-2 text-xs font-bold mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Weight entry saved!</span>
              </div>
            )}

            <form onSubmit={handleAddWeight} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 68.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  required
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Post-workout"
                  value={newWeightNote}
                  onChange={(e) => setNewWeightNote(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="py-2.5 text-xs font-bold"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Log Weight
                </Button>
              </div>
            </form>
          </Card>

          {/* Weight Line Chart */}
          <Card className="bg-[#111111] border-[#222222]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Weight Trend Chart</h2>
                <p className="text-xs text-gray-400">Total Change: {totalWeightDiff > 0 ? `+${totalWeightDiff}` : totalWeightDiff} kg</p>
              </div>
              <span className="text-xs font-extrabold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-lg border border-[#10B981]/20">
                Latest: {latestWeight} kg
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weights} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="date" stroke="#666666" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} stroke="#666666" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181818',
                      borderColor: '#333333',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 5 }}
                    activeDot={{ r: 7, fill: '#34D399' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weight Logs Table */}
          <Card className="bg-[#111111] border-[#222222]">
            <h2 className="text-sm font-bold text-white mb-3">Historical Weight Logs</h2>
            <div className="space-y-2">
              {weights.slice().reverse().map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#262626] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-300">{entry.date}</span>
                    {entry.note && (
                      <span className="text-gray-500 bg-[#222222] px-2 py-0.5 rounded text-[10px]">
                        {entry.note}
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-white text-sm">{entry.weightKg} kg</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: BODY MEASUREMENTS */}
      {activeTab === 'measurements' && (
        <div className="space-y-6">
          {/* Add Measurement Form */}
          <Card className="bg-[#111111] border-[#222222]">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#10B981]" />
              <span>Record New Body Measurements (cm)</span>
            </h2>

            <form onSubmit={handleAddMeasurement} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={mChest}
                    onChange={(e) => setMChest(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 80"
                    value={mWaist}
                    onChange={(e) => setMWaist(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Shoulders (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 116"
                    value={mShoulders}
                    onChange={(e) => setMShoulders(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Arms (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 36"
                    value={mArms}
                    onChange={(e) => setMArms(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Thighs (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 57"
                    value={mThighs}
                    onChange={(e) => setMThighs(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="py-2.5 text-xs font-bold"
                icon={<Plus className="w-4 h-4" />}
              >
                Save Measurements
              </Button>
            </form>
          </Card>

          {/* Measurements Timeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">Saved Measurement Logs</h2>
            {measurements.map((record) => (
              <Card key={record.id} className="bg-[#111111] border-[#222222] p-4">
                <div className="flex items-center justify-between mb-3 border-b border-[#222222] pb-2">
                  <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {record.date}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Full Tape Entry
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {record.chestCm && (
                    <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-gray-400 block">Chest</span>
                      <span className="text-sm font-bold text-white">{record.chestCm} cm</span>
                    </div>
                  )}
                  {record.waistCm && (
                    <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-gray-400 block">Waist</span>
                      <span className="text-sm font-bold text-white">{record.waistCm} cm</span>
                    </div>
                  )}
                  {record.shouldersCm && (
                    <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-gray-400 block">Shoulders</span>
                      <span className="text-sm font-bold text-white">{record.shouldersCm} cm</span>
                    </div>
                  )}
                  {record.armsCm && (
                    <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-gray-400 block">Arms</span>
                      <span className="text-sm font-bold text-white">{record.armsCm} cm</span>
                    </div>
                  )}
                  {record.thighsCm && (
                    <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                      <span className="text-[10px] text-gray-400 block">Thighs</span>
                      <span className="text-sm font-bold text-white">{record.thighsCm} cm</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STRENGTH PRs */}
      {activeTab === 'prs' && (
        <div className="space-y-6">
          {/* Add/Update PR Form */}
          <Card className="bg-[#111111] border-[#222222]">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Update Strength Personal Record (PR)</span>
            </h2>

            <form onSubmit={handleAddPR} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Exercise</label>
                <select
                  value={prExercise}
                  onChange={(e) => setPRExercise(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                >
                  <option value="Bench Press">Bench Press</option>
                  <option value="Squat">Squat</option>
                  <option value="Deadlift">Deadlift</option>
                  <option value="Shoulder Press">Shoulder Press</option>
                  <option value="Pull-up">Pull-up</option>
                  <option value="Custom">+ Custom Exercise</option>
                </select>
              </div>

              {prExercise === 'Custom' && (
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Incline DB Press"
                    value={prCustomExercise}
                    onChange={(e) => setPRCustomExercise(e.target.value)}
                    required
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 90"
                  value={prWeight}
                  onChange={(e) => setPRWeight(e.target.value)}
                  required
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Reps</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={prReps}
                  onChange={(e) => setPRReps(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-end sm:col-span-1">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="py-2 text-xs font-bold"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Save PR
                </Button>
              </div>
            </form>
          </Card>

          {/* PR Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prs.map((pr) => {
              const diff = pr.currentPRWeightKg - pr.previousPRWeightKg;
              return (
                <Card key={pr.id} className="bg-[#111111] border-[#222222] p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-[#10B981]" />
                      {pr.exerciseName}
                    </h3>
                    {diff > 0 && (
                      <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-0.5 rounded-full">
                        +{diff} kg Improvement
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-3xl font-black text-white font-mono">
                      {pr.currentPRWeightKg} <span className="text-sm text-gray-400 font-sans font-normal">kg</span>
                    </span>
                    <span className="text-xs text-gray-400 font-medium">x {pr.reps} Reps</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#222222] text-[11px] text-gray-500">
                    <span>Prev: {pr.previousPRWeightKg > 0 ? `${pr.previousPRWeightKg} kg` : 'None'}</span>
                    <span>Set on {pr.date}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PROGRESS PHOTOS */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Photo Upload Box */}
          <Card className="bg-[#111111] border-[#222222]">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#10B981]" />
              <span>Add Progress Photo</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Pose Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Front', 'Side', 'Back'] as PhotoPose[]).map((pose) => (
                    <button
                      key={pose}
                      type="button"
                      onClick={() => setPhotoPose(pose)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                        photoPose === pose
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                          : 'bg-[#181818] border-[#262626] text-gray-400'
                      }`}
                    >
                      {pose} Pose
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block w-full border-2 border-dashed border-[#2b2b2b] hover:border-[#10B981] rounded-2xl p-6 text-center cursor-pointer bg-[#141414] transition-all">
                  <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-white block">Upload {photoPose} View Photo</span>
                  <span className="text-[11px] text-gray-500">Saved securely in browser local storage</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* Photo Timeline */}
          {photos.length === 0 ? (
            <Card className="bg-[#111111] border-[#222222] p-8 text-center text-gray-500">
              <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No progress photos uploaded yet.</p>
              <p className="text-[11px] opacity-70">Upload front, side, or back photos to track physical changes.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="bg-[#111111] border-[#222222] p-3 relative group">
                  <div className="aspect-[3/4] bg-[#181818] rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={photo.imageDataUrl}
                      alt={`${photo.pose} progress`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{photo.pose} View</span>
                    <span className="text-gray-500 text-[11px]">{photo.date}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STATS & STREAKS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Streak */}
            <Card className="bg-[#111111] border-[#222222] p-4 text-center">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1.5" />
              <p className="text-[11px] text-gray-400">Current Streak</p>
              <p className="text-2xl font-black text-white">{stats.currentStreak} Days</p>
            </Card>

            {/* Longest Streak */}
            <Card className="bg-[#111111] border-[#222222] p-4 text-center">
              <Award className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
              <p className="text-[11px] text-gray-400">Longest Streak</p>
              <p className="text-2xl font-black text-white">{stats.longestStreak} Days</p>
            </Card>

            {/* Workouts Completed */}
            <Card className="bg-[#111111] border-[#222222] p-4 text-center">
              <Dumbbell className="w-6 h-6 text-[#10B981] mx-auto mb-1.5" />
              <p className="text-[11px] text-gray-400">Workouts Done</p>
              <p className="text-2xl font-black text-white">{stats.completedWorkouts}</p>
            </Card>

            {/* Workout Days */}
            <Card className="bg-[#111111] border-[#222222] p-4 text-center">
              <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-1.5" />
              <p className="text-[11px] text-gray-400">Active Days</p>
              <p className="text-2xl font-black text-white">{stats.workoutDays} Days</p>
            </Card>
          </div>

          <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#10B981]" />
              <span>Averages & Recovery Metrics</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Avg Sleep</span>
                </div>
                <span className="text-lg font-extrabold text-white">{stats.avgSleep} hrs</span>
              </div>

              <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Avg Water</span>
                </div>
                <span className="text-lg font-extrabold text-white">{stats.avgWater} L</span>
              </div>

              <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Avg Energy</span>
                </div>
                <span className="text-lg font-extrabold text-white">{stats.avgEnergy} / 10</span>
              </div>

              <div className="bg-[#181818] p-3 rounded-xl border border-[#262626]">
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                  <Scale className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Avg Weight</span>
                </div>
                <span className="text-lg font-extrabold text-white">{stats.avgWeight} kg</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
