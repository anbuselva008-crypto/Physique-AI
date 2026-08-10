import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  FoodItem,
  MealLogItem,
  MealType,
  FoodCategory,
  WaterLog,
  DailyNutritionGoals,
} from '../../types';
import { nutritionService, progressService } from '../../services';
import { nutritionCoachEngine, EndOfDayAnalysis } from '../../intelligence/nutritionCoachEngine';
import { stateSynchronizer } from '../../integration/stateSynchronizer';
import {
  dailyTransformationService,
  DailyHistoryRecord,
} from '../../daily/dailyTransformationService';
import { DailyTransformationReportModal } from './DailyTransformationReportModal';
import { DailyTimelineModal } from './DailyTimelineModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Utensils,
  Droplets,
  Plus,
  Trash2,
  Search,
  Check,
  TrendingUp,
  X,
  PieChart,
  Target,
  Flame,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Apple,
  Filter,
  Brain,
  Sparkles,
  ShoppingCart,
  Lightbulb,
  ArrowRight,
  MessageSquare,
  Send,
  Calendar,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Coins,
  ShieldCheck,
  RefreshCw,
  Lock,
  Unlock,
  Award,
} from 'lucide-react';

export const NutritionView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(progressService.getFormattedDate(0));
  const [viewTab, setViewTab] = useState<'log' | 'analysis' | 'local' | 'planner' | 'coach' | 'stats'>('log');

  // Data State
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>([]);
  const [waterLog, setWaterLog] = useState<WaterLog>({ date: selectedDate, ml: 0, targetMl: 3000 });
  const [goals, setGoals] = useState<DailyNutritionGoals>(nutritionService.getNutritionGoals());
  const [weeklyStats, setWeeklyStats] = useState(nutritionService.getWeeklyStats());
  const [eodAnalysis, setEodAnalysis] = useState<EndOfDayAnalysis>(
    nutritionCoachEngine.generateAnalysis(selectedDate)
  );

  // Modal / Search State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('Breakfast');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Custom Food Form State
  const [showCustomFoodForm, setShowCustomFoodForm] = useState<boolean>(false);
  const [cfName, setCfName] = useState<string>('');
  const [cfCalories, setCfCalories] = useState<string>('');
  const [cfProtein, setCfProtein] = useState<string>('');
  const [cfCarbs, setCfCarbs] = useState<string>('');
  const [cfFat, setCfFat] = useState<string>('');
  const [cfServing, setCfServing] = useState<string>('');
  const [cfCategory, setCfCategory] = useState<FoodCategory>('Snack');

  // Conversational AI Coach State
  const [coachQueryInput, setCoachQueryInput] = useState<string>('');
  const [activeCoachResponse, setActiveCoachResponse] = useState<{
    answer: string;
    suggestedFoods: { name: string; costInr: number; protein: number; calories: number; location: string }[];
  } | null>(null);

  // Daily Transformation Pipeline State
  const [isDayLocked, setIsDayLocked] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showTimelineModal, setShowTimelineModal] = useState<boolean>(false);
  const [completedRecord, setCompletedRecord] = useState<DailyHistoryRecord | null>(null);

  useEffect(() => {
    refreshData();
    const unsubscribe = stateSynchronizer.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [selectedDate]);

  const refreshData = () => {
    setAllFoods(nutritionService.getAllFoods());
    const currentMeals = nutritionService.getMealLogsForDate(selectedDate);
    setMealLogs(currentMeals);
    setWaterLog(nutritionService.getWaterForDate(selectedDate));
    setGoals(nutritionService.getNutritionGoals());
    setWeeklyStats(nutritionService.getWeeklyStats());
    setEodAnalysis(nutritionCoachEngine.generateAnalysis(selectedDate));

    // Refresh day lock and history record
    const locked = dailyTransformationService.isDayLocked(selectedDate);
    setIsDayLocked(locked);
    const existingRec = dailyTransformationService.getDailyHistoryRecord(selectedDate);
    setCompletedRecord(existingRec);
  };

  // Readiness Check for Complete Today's Nutrition (Part 1)
  const completionCheck = useMemo(() => {
    return dailyTransformationService.checkCanCompleteDay(selectedDate);
  }, [selectedDate, mealLogs]);

  const handleCompleteTodayNutrition = () => {
    if (!completionCheck.canComplete) return;
    const record = dailyTransformationService.executeCompleteDayPipeline(selectedDate);
    setCompletedRecord(record);
    setIsDayLocked(true);
    setShowReportModal(true);
    refreshData();
  };

  const handleUnlockDay = () => {
    dailyTransformationService.setDayLock(selectedDate, false);
    setIsDayLocked(false);
    refreshData();
  };

  // Water Actions
  const handleAddWater = (ml: number) => {
    const updated = nutritionService.addWaterIntake(selectedDate, ml);
    setWaterLog(updated);
    setWeeklyStats(nutritionService.getWeeklyStats());
    setEodAnalysis(nutritionCoachEngine.generateAnalysis(selectedDate));
    stateSynchronizer.notifySubscribers();
  };

  // Meal Actions
  const handleOpenSearch = (mealType: MealType) => {
    setActiveMealType(mealType);
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFood(null);
    setQuantity(1);
    setIsSearchOpen(true);
  };

  const handleSelectFoodItem = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(1);
  };

  const handleConfirmAddMeal = () => {
    if (!selectedFood) return;

    const finalCalories = Math.round(selectedFood.calories * quantity);
    const finalProtein = +(selectedFood.protein * quantity).toFixed(1);
    const finalCarbs = +(selectedFood.carbs * quantity).toFixed(1);
    const finalFat = +(selectedFood.fat * quantity).toFixed(1);

    nutritionService.addMealLog({
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      mealType: activeMealType,
      quantity,
      calories: finalCalories,
      protein: finalProtein,
      carbs: finalCarbs,
      fat: finalFat,
      servingSize: selectedFood.servingSize,
      date: selectedDate,
    });

    setIsSearchOpen(false);
    setSelectedFood(null);
    refreshData();
    stateSynchronizer.notifySubscribers();
  };

  const handleDeleteMealItem = (id: string) => {
    nutritionService.deleteMealLog(id);
    refreshData();
    stateSynchronizer.notifySubscribers();
  };

  // Custom Food Add Handler
  const handleCreateCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfName || !cfCalories) return;

    const newFood = nutritionService.addCustomFood({
      name: cfName,
      calories: parseFloat(cfCalories) || 0,
      protein: parseFloat(cfProtein) || 0,
      carbs: parseFloat(cfCarbs) || 0,
      fat: parseFloat(cfFat) || 0,
      servingSize: cfServing || '1 Serving',
      category: cfCategory,
    });

    setAllFoods(newFood);
    setShowCustomFoodForm(false);
    setCfName('');
    setCfCalories('');
    setCfProtein('');
    setCfCarbs('');
    setCfFat('');
    setCfServing('');
  };

  // Coach Query Handler
  const handleAskCoach = (queryText: string) => {
    if (!queryText.trim()) return;
    const res = nutritionCoachEngine.answerUserNutritionQuery(queryText, selectedDate);
    setActiveCoachResponse(res);
    setCoachQueryInput(queryText);
  };

  // Filtered Food Database
  const filteredFoods = useMemo(() => {
    return allFoods.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' ||
        f.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [allFoods, searchQuery, selectedCategory]);

  // Daily totals calculations
  const totalCalories = mealLogs.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = Math.round(mealLogs.reduce((sum, m) => sum + m.protein, 0));
  const totalCarbs = Math.round(mealLogs.reduce((sum, m) => sum + m.carbs, 0));
  const totalFat = Math.round(mealLogs.reduce((sum, m) => sum + m.fat, 0));

  const caloriesRemaining = Math.max(0, goals.targetCalories - totalCalories);
  const proteinRemaining = Math.max(0, goals.targetProtein - totalProtein);

  // Grouped meals
  const mealCategories: { type: MealType; icon: React.ReactNode; label: string }[] = [
    { type: 'Breakfast', icon: <Coffee className="w-4 h-4 text-amber-400" />, label: 'Breakfast' },
    { type: 'Lunch', icon: <Sun className="w-4 h-4 text-orange-400" />, label: 'Lunch' },
    { type: 'Dinner', icon: <Moon className="w-4 h-4 text-indigo-400" />, label: 'Dinner' },
    { type: 'Snacks', icon: <Cookie className="w-4 h-4 text-emerald-400" />, label: 'Snacks' },
  ];

  const categoriesList = [
    'All',
    'South Indian',
    'North Indian',
    'Breakfast',
    'Protein',
    'Rice',
    'Vegetable',
    'Fruit',
    'Drink',
    'Snack',
    'Fast Food',
  ];

  const quickCoachQueries = [
    'What should I eat tonight?',
    'I already ate biryani.',
    'I only have ₹100.',
    'I missed breakfast.',
    'I am eating in the SNS canteen.',
    'I am going to Annapoorna / A2B.',
  ];

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Header Banner & Location Context */}
      <Card className="bg-[#111111] border-[#222222] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-6 h-6 text-[#10B981]" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">AI Nutrition Coach</h1>
              <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Saravanampatti Engine
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Coimbatore, Tamil Nadu • Near SNS College of Technology • Monthly Budget: ₹4500</span>
            </p>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setViewTab('log')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                viewTab === 'log'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              Meal Tracker
            </button>
            <button
              onClick={() => setViewTab('analysis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1 ${
                viewTab === 'analysis'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Analysis</span>
            </button>
            <button
              onClick={() => setViewTab('local')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                viewTab === 'local'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              Local Foods
            </button>
            <button
              onClick={() => setViewTab('planner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                viewTab === 'planner'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              Next Day & Grocery
            </button>
            <button
              onClick={() => setViewTab('coach')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1 ${
                viewTab === 'coach'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Dietitian</span>
            </button>
            <button
              onClick={() => setViewTab('stats')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                viewTab === 'stats'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setShowTimelineModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timeline History</span>
            </button>
          </div>
        </div>
      </Card>

      {/* VIEW TAB 1: MEAL TRACKER */}
      {viewTab === 'log' && (
        <>
          {/* Daily Macros Overview Card */}
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-white">Daily Macro Overview</h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Target:</span>
                <span className="font-extrabold text-white">{goals.targetCalories} kcal</span>
              </div>
            </div>

            {/* Macro Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Calories */}
              <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                <span className="text-[11px] text-gray-400 block">Calories</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{totalCalories}</span>
                  <span className="text-xs text-gray-500">/ {goals.targetCalories}</span>
                </div>
                <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-[#10B981] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalCalories / goals.targetCalories) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#10B981] font-bold pt-1">{caloriesRemaining} kcal left</p>
              </div>

              {/* Protein */}
              <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                <span className="text-[11px] text-gray-400 block">Protein</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{totalProtein}g</span>
                  <span className="text-xs text-gray-500">/ {goals.targetProtein}g</span>
                </div>
                <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-blue-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalProtein / goals.targetProtein) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-blue-400 font-bold pt-1">{proteinRemaining}g left</p>
              </div>

              {/* Carbs */}
              <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                <span className="text-[11px] text-gray-400 block">Carbs</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{totalCarbs}g</span>
                  <span className="text-xs text-gray-500">/ {goals.targetCarbs}g</span>
                </div>
                <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalCarbs / goals.targetCarbs) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 pt-1">
                  {Math.max(0, goals.targetCarbs - totalCarbs)}g left
                </p>
              </div>

              {/* Fat */}
              <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                <span className="text-[11px] text-gray-400 block">Fat</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{totalFat}g</span>
                  <span className="text-xs text-gray-500">/ {goals.targetFat}g</span>
                </div>
                <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalFat / goals.targetFat) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 pt-1">
                  {Math.max(0, goals.targetFat - totalFat)}g left
                </p>
              </div>
            </div>
          </Card>

          {/* Water Tracker Card */}
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white">Water Intake Tracker</h2>
              </div>
              <span className="text-xs font-extrabold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-lg border border-blue-400/20">
                {(waterLog.ml / 1000).toFixed(2)} / {(waterLog.targetMl / 1000).toFixed(1)} Liters
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-[#222222] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterLog.ml / waterLog.targetMl) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-medium pt-0.5">
                <span>0 ml</span>
                <span>{waterLog.ml} ml logged</span>
                <span>Goal: {waterLog.targetMl} ml</span>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => handleAddWater(250)}
                className="py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#262626] rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>250 ml</span>
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#262626] rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>500 ml</span>
              </button>
              <button
                onClick={() => handleAddWater(1000)}
                className="py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#262626] rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1.0 Liter</span>
              </button>
            </div>
          </Card>

          {/* Meals Logging Sections */}
          <div className="space-y-4">
            {mealCategories.map((cat) => {
              const logsForMeal = mealLogs.filter((m) => m.mealType === cat.type);
              const mealCals = logsForMeal.reduce((s, m) => s + m.calories, 0);
              const mealProtein = Math.round(logsForMeal.reduce((s, m) => s + m.protein, 0));

              return (
                <Card key={cat.type} className="bg-[#111111] border-[#222222] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <h3 className="text-sm font-bold text-white">{cat.label}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400">
                        {mealCals} kcal • {mealProtein}g P
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenSearch(cat.type)}
                        className="py-1 px-2.5 text-xs font-bold"
                        icon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add Food
                      </Button>
                    </div>
                  </div>

                  {/* Food List in this meal */}
                  {logsForMeal.length === 0 ? (
                    <p className="text-xs text-gray-500 py-1 italic">No items logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {logsForMeal.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#262626] text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{item.foodName}</p>
                            <p className="text-[11px] text-gray-400">
                              Qty: {item.quantity}x ({item.servingSize}) • {item.calories} kcal
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right text-[11px]">
                              <span className="text-blue-400 font-bold block">{item.protein}g P</span>
                              <span className="text-gray-500">{item.carbs}g C | {item.fat}g F</span>
                            </div>
                            <button
                              onClick={() => handleDeleteMealItem(item.id)}
                              className="text-gray-500 hover:text-rose-500 p-1.5 transition-colors cursor-pointer"
                              title="Delete food"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* PART 1 & PART 2: COMPLETE TODAY'S NUTRITION BUTTON & LOCK CARD */}
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-4 mt-4">
            {isDayLocked ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#181818] rounded-2xl border border-[#10B981]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>🔒 Today's Nutrition Log is Locked & Saved</span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Permanently saved under {selectedDate}. All transformation engines synced.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowReportModal(true)}
                      className="text-xs font-bold py-2 px-3 text-[#10B981]"
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      View Report
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleUnlockDay}
                      className="text-xs font-bold py-2 px-3 text-amber-400"
                      icon={<Unlock className="w-3.5 h-3.5" />}
                    >
                      Edit Day
                    </Button>
                  </div>
                </div>

                {/* Completion Metrics Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                    <span className="text-[10px] text-gray-400 block">Breakfast</span>
                    <span className="font-bold text-[#10B981]">Logged ✓</span>
                  </div>
                  <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                    <span className="text-[10px] text-gray-400 block">Lunch</span>
                    <span className="font-bold text-[#10B981]">Logged ✓</span>
                  </div>
                  <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                    <span className="text-[10px] text-gray-400 block">Dinner</span>
                    <span className="font-bold text-[#10B981]">Logged ✓</span>
                  </div>
                  <div className="bg-[#181818] p-2.5 rounded-xl border border-[#262626]">
                    <span className="text-[10px] text-gray-400 block">Coach Score</span>
                    <span className="font-bold text-amber-400">{completedRecord?.coachReview?.overallScore || 84}/100</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Complete Today's Transformation Loop</span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Requires Breakfast, Lunch, & Dinner. Automatically updates AI Coach, Workout Planner, & Memory Engine.
                    </p>
                  </div>

                  {/* Meal Logged Badges */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-md border font-bold ${
                        completionCheck.hasBreakfast
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      B: {completionCheck.hasBreakfast ? '✓' : 'Missing'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border font-bold ${
                        completionCheck.hasLunch
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      L: {completionCheck.hasLunch ? '✓' : 'Missing'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border font-bold ${
                        completionCheck.hasDinner
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      D: {completionCheck.hasDinner ? '✓' : 'Missing'}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!completionCheck.canComplete}
                  onClick={handleCompleteTodayNutrition}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    completionCheck.canComplete
                      ? 'bg-gradient-to-r from-[#10B981] to-emerald-600 text-black shadow-lg shadow-[#10B981]/20 hover:scale-[1.01]'
                      : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500 cursor-not-allowed opacity-70'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>✓ Complete Today's Nutrition</span>
                </button>

                {!completionCheck.canComplete && (
                  <p className="text-[11px] text-amber-400/90 text-center font-medium">
                    ⚠️ Please log {completionCheck.missingMeals.join(', ')} to activate Complete Today's Nutrition.
                  </p>
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {/* VIEW TAB 2: END OF DAY AI NUTRITION ANALYSIS */}
      {viewTab === 'analysis' && (
        <div className="space-y-5">
          {!eodAnalysis.hasLoggedMeals ? (
            /* Part 11: Empty State */
            <Card className="bg-[#111111] border-[#222222] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center mx-auto text-[#10B981]">
                <Utensils className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">No Meals Logged Today</h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                No meals logged today. Log your breakfast to begin AI nutrition analysis.
              </p>
              <Button
                variant="primary"
                onClick={() => setViewTab('log')}
                className="text-xs font-bold py-2.5 px-5 mt-2"
                icon={<Plus className="w-4 h-4" />}
              >
                Log Today's First Meal
              </Button>
            </Card>
          ) : (
            <>
              {/* Executive Summary Header */}
              <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#10B981]" />
                    <h2 className="text-base font-bold text-white">End of Day AI Analysis</h2>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    {eodAnalysis.scores.hydrationScore >= 80 ? 'Grade A Protocol' : 'Requires Optimization'}
                  </span>
                </div>

                <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626] space-y-2">
                  <h3 className="text-sm font-black text-white">{eodAnalysis.analysis.overallSummary}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{eodAnalysis.analysis.whySucceededOrFailed}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#222222] text-xs text-[#10B981] font-bold">
                    <ArrowRight className="w-4 h-4" />
                    <span>Tomorrow's Priority: {eodAnalysis.analysis.whatToBeDoneTomorrow}</span>
                  </div>
                </div>

                {/* Part 9: Insight Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Biggest Win</span>
                    </div>
                    <p className="text-xs text-white font-medium">{eodAnalysis.scores.biggestWin}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Biggest Bottleneck</span>
                    </div>
                    <p className="text-xs text-white font-medium">{eodAnalysis.scores.biggestMistake}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Best Protein Ratio</span>
                    </div>
                    <p className="text-xs text-white font-medium">{eodAnalysis.scores.mostEfficientProteinSource}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>Budget Rating</span>
                    </div>
                    <p className="text-xs text-white font-medium">{eodAnalysis.scores.budgetEfficiencyRating}</p>
                  </div>
                </div>

                {/* Score Meters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-[#181818] p-3 rounded-xl border border-[#262626] text-center">
                    <span className="text-[10px] text-gray-400 block">Hydration Score</span>
                    <span className="text-lg font-black text-blue-400">{eodAnalysis.scores.hydrationScore}%</span>
                  </div>
                  <div className="bg-[#181818] p-3 rounded-xl border border-[#262626] text-center">
                    <span className="text-[10px] text-gray-400 block">Recovery Score</span>
                    <span className="text-lg font-black text-[#10B981]">{eodAnalysis.scores.recoveryScore}%</span>
                  </div>
                  <div className="bg-[#181818] p-3 rounded-xl border border-[#262626] text-center">
                    <span className="text-[10px] text-gray-400 block">Macro Balance</span>
                    <span className="text-lg font-black text-amber-400">{eodAnalysis.scores.macroBalanceScore}%</span>
                  </div>
                  <div className="bg-[#181818] p-3 rounded-xl border border-[#262626] text-center">
                    <span className="text-[10px] text-gray-400 block">Meal Timing</span>
                    <span className="text-lg font-black text-purple-400">{eodAnalysis.scores.mealTimingScore}%</span>
                  </div>
                </div>
              </Card>

              {/* Part 2: Intelligent Macro Analysis Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Protein Deep Dive */}
                <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold text-white">Protein & Hypertrophy Analysis</h3>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        eodAnalysis.analysis.proteinAnalysis.status === 'Met Target'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {eodAnalysis.analysis.proteinAnalysis.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {eodAnalysis.analysis.proteinAnalysis.explanation}
                  </p>

                  {eodAnalysis.analysis.proteinAnalysis.missingGrams > 0 && (
                    <div className="bg-[#181818] p-3 rounded-xl border border-[#262626] space-y-2">
                      <span className="text-[11px] font-bold text-blue-400 block">
                        Local Saravanampatti Protein Fillers:
                      </span>
                      <div className="space-y-1.5">
                        {eodAnalysis.analysis.proteinAnalysis.localFoodSuggestions.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs border-b border-[#222222] pb-1">
                            <div>
                              <span className="font-bold text-white block">{item.name}</span>
                              <span className="text-[10px] text-gray-400">{item.whereToBuy}</span>
                            </div>
                            <span className="font-extrabold text-[#10B981]">
                              +{item.protein}g P • ₹{item.costInInr}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Carbohydrates & Glycogen */}
                <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Carbohydrate & Glycogen Fuel</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                      {eodAnalysis.analysis.carbsAnalysis.status} Status
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {eodAnalysis.analysis.carbsAnalysis.workoutImpact}
                  </p>

                  <div className="bg-[#181818] p-3 rounded-xl border border-[#262626] space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 block">Recommended Clean Carb Sources:</span>
                    <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                      {eodAnalysis.analysis.carbsAnalysis.suggestedCarbSources.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </Card>

                {/* Fats & Oil Analysis */}
                <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Apple className="w-4 h-4 text-rose-400" />
                      <h3 className="text-sm font-bold text-white">Dietary Fats & Cooking Oil</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2.5 py-0.5 rounded-full">
                      {eodAnalysis.analysis.fatAnalysis.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {eodAnalysis.analysis.fatAnalysis.explanation}
                  </p>

                  <p className="text-xs text-gray-400 italic">
                    💡 Recommendation: {eodAnalysis.analysis.fatAnalysis.recommendation}
                  </p>
                </Card>

                {/* Part 4: Budget Adherence */}
                <Card className="bg-[#111111] border-[#222222] p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Student Budget Adherence</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                      ₹{eodAnalysis.budgetAdherence.dailyEstimatedCostInr} / ₹{eodAnalysis.budgetAdherence.dailyBudgetCapInr} Day
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Monthly Cap: ₹4500 (~₹150/day). Your estimated food spend today is ₹
                    {eodAnalysis.budgetAdherence.dailyEstimatedCostInr}.
                  </p>

                  <div className="p-3 bg-[#181818] rounded-xl border border-[#262626] text-xs text-[#10B981]">
                    <span>💰 Smart Tip: {eodAnalysis.budgetAdherence.savingTip}</span>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW TAB 3: LOCAL FOODS & SUBSTITUTIONS */}
      {viewTab === 'local' && (
        <div className="space-y-5">
          {/* Header Card */}
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-white">Saravanampatti & SNS Canteen Local Food Guide</h2>
            </div>
            <p className="text-xs text-gray-400">
              Hyper-local, highly available South Indian student foods priced for a ₹4500/month budget. No imported foods!
            </p>
          </Card>

          {/* Part 5: Food Substitution Engine */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#10B981]" />
              <span>Smart Macro Substitution Engine</span>
            </h3>

            {eodAnalysis.substitutions.length === 0 ? (
              <Card className="bg-[#111111] border-[#222222] p-4 text-xs text-gray-400">
                All daily macros are currently balanced! No urgent substitutions required.
              </Card>
            ) : (
              eodAnalysis.substitutions.map((sub, idx) => (
                <Card key={idx} className="bg-[#111111] border-[#222222] p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                    <span className="text-xs font-bold text-white">
                      Needed: {sub.deficitOrExcessAmount}g {sub.targetMacro}
                    </span>
                    <span className="text-[10px] text-gray-400">{sub.reasoning}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {sub.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="bg-[#181818] p-3.5 rounded-2xl border border-[#262626] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{opt.title}</span>
                          <span className="text-xs font-extrabold text-[#10B981]">₹{opt.costInInr}</span>
                        </div>
                        <p className="text-[11px] text-gray-400">{opt.description}</p>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-gray-500">
                          <span>+{opt.proteinGrams}g Protein</span>
                          <span>{opt.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Saravanampatti Top 5 Budget Protein Ranker */}
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Top 5 Saravanampatti Budget Protein Options</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { name: 'Soya Chunks Curry / Bhurji', protein: '52g Protein', cost: '₹25', venue: 'Hostel Mess / Grocery', desc: 'Highest protein per rupee in India.' },
                { name: 'Boiled Eggs (4 Whole Eggs)', protein: '24g Protein', cost: '₹28', venue: 'SNS Canteen / Gate Stall', desc: 'Complete amino acid profile.' },
                { name: 'Curd (200g) + Roasted Chana (50g)', protein: '22g Protein', cost: '₹35', venue: 'Saravanampatti Mini Mart', desc: 'Zero cooking required.' },
                { name: 'Grilled / Boiled Chicken Breast', protein: '45g Protein', cost: '₹85', venue: 'Local Saravanampatti Mess', desc: 'Pure anabolic muscle food.' },
                { name: 'Raw Paneer Cubes / Tikka (100g)', protein: '18g Protein', cost: '₹45', venue: 'A2B / Annapoorna / Dairy', desc: 'Slow-release casein protein.' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#181818] rounded-xl border border-[#262626] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#222222] text-gray-400 font-extrabold flex items-center justify-center text-[11px]">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.venue} • {item.desc}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-blue-400 block">{item.protein}</span>
                    <span className="text-[10px] text-[#10B981] font-bold">{item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* VIEW TAB 4: TOMORROW'S PLAN & SMART GROCERY */}
      {viewTab === 'planner' && (
        <div className="space-y-5">
          {/* Tomorrow's Tailored Plan */}
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Tomorrow's AI Nutrition Protocol</h2>
              </div>
              <span className="text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1 rounded-full">
                Fueling: {eodAnalysis.nextDayPlan.workoutTypeTomorrow}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eodAnalysis.nextDayPlan.meals.map((meal, idx) => (
                <div key={idx} className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                        {meal.time}
                      </span>
                      <span className="text-xs font-bold text-white">{meal.mealType}</span>
                    </div>
                    <span className="text-xs font-extrabold text-white">₹{meal.estimatedCostInr}</span>
                  </div>

                  <p className="text-xs font-medium text-gray-200">{meal.suggestedFood}</p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                    <span>📍 {meal.location}</span>
                    <span className="text-blue-400 font-bold">
                      {meal.protein}g P | {meal.calories} kcal
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Water Schedule */}
            <div className="p-4 bg-[#181818] rounded-2xl border border-[#262626] space-y-2">
              <h3 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                <span>Tomorrow's Hydration Schedule (3.0 Liters)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                {eodAnalysis.nextDayPlan.waterSchedule.map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Part 7: Smart Grocery List */}
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#10B981]" />
                <h2 className="text-base font-bold text-white">Saravanampatti Smart Grocery Assistant</h2>
              </div>
              <span className="text-xs font-extrabold text-[#10B981]">
                Total Basket: ₹
                {eodAnalysis.groceryList.reduce((sum, item) => sum + item.estimatedCostInr, 0)}
              </span>
            </div>

            <div className="space-y-2">
              {eodAnalysis.groceryList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#181818] rounded-2xl border border-[#262626] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.name}</span>
                      <span className="text-[9px] font-bold text-gray-400 bg-[#222222] px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Qty: {item.quantity} • Lasts ~{item.lastsDays} days
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-[#10B981] block">₹{item.estimatedCostInr}</span>
                    <span className="text-[10px] text-blue-400 font-bold">
                      +{item.proteinContributionGrams}g Total Protein
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* VIEW TAB 5: CONVERSATIONAL AI DIETITIAN */}
      {viewTab === 'coach' && (
        <div className="space-y-5">
          <Card className="bg-[#111111] border-[#222222] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#222222] pb-3">
              <MessageSquare className="w-5 h-5 text-[#10B981]" />
              <div>
                <h2 className="text-base font-bold text-white">Conversational AI Dietitian Query Bar</h2>
                <p className="text-xs text-gray-400">
                  Ask real-world questions based on today's remaining macro gaps and local Coimbatore choices!
                </p>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 block">Tap Quick Queries:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {quickCoachQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskCoach(q)}
                    className="px-3 py-1.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#10B981] text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>

            {/* Search / Ask Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Ask anything (e.g. 'I have ₹80 in Saravanampatti, what should I eat?')..."
                value={coachQueryInput}
                onChange={(e) => setCoachQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskCoach(coachQueryInput);
                }}
                className="flex-1 bg-[#181818] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#10B981]"
              />
              <Button
                variant="primary"
                onClick={() => handleAskCoach(coachQueryInput)}
                className="py-2.5 px-4 text-xs font-bold"
                icon={<Send className="w-4 h-4" />}
              >
                Ask Coach
              </Button>
            </div>
          </Card>

          {/* Coach Response Card */}
          {activeCoachResponse && (
            <Card className="bg-[#111111] border-[#10B981]/30 p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#222222] pb-2">
                <Brain className="w-4 h-4 text-[#10B981]" />
                <span>AI Dietitian Advice</span>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {activeCoachResponse.answer}
              </p>

              {activeCoachResponse.suggestedFoods.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#222222]">
                  <span className="text-[11px] font-bold text-[#10B981] block">
                    Recommended Local Meal Matches:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeCoachResponse.suggestedFoods.map((f, i) => (
                      <div key={i} className="bg-[#181818] p-3 rounded-xl border border-[#262626] space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>{f.name}</span>
                          <span className="text-[#10B981]">₹{f.costInr}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>📍 {f.location}</span>
                          <span className="text-blue-400 font-bold">
                            +{f.protein}g Protein ({f.calories} kcal)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* VIEW TAB 6: STATISTICS TAB */}
      {viewTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="bg-[#111111] border-[#222222] p-4 text-center">
              <Flame className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
              <p className="text-[11px] text-gray-400">Avg Daily Calories</p>
              <p className="text-2xl font-black text-white">{weeklyStats.avgCalories} kcal</p>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-4 text-center">
              <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-[11px] text-gray-400">Avg Daily Protein</p>
              <p className="text-2xl font-black text-white">{weeklyStats.avgProtein} g</p>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-4 text-center">
              <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-[11px] text-gray-400">Avg Daily Water</p>
              <p className="text-2xl font-black text-white">{weeklyStats.avgWaterLiters} L</p>
            </Card>
          </div>

          {/* Weekly Calories Chart */}
          <Card className="bg-[#111111] border-[#222222] p-5">
            <h2 className="text-sm font-bold text-white mb-3">Weekly Calorie Consumption</h2>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats.days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="dayLabel" stroke="#666666" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#666666" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181818',
                      borderColor: '#333333',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="calories" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly Protein Chart */}
          <Card className="bg-[#111111] border-[#222222] p-5">
            <h2 className="text-sm font-bold text-white mb-3">Weekly Protein Intake (g)</h2>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats.days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="dayLabel" stroke="#666666" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#666666" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181818',
                      borderColor: '#333333',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="protein" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* FOOD SEARCH & ADD MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#111111] border border-[#222222] w-full max-w-xl rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-base font-bold text-white">
                  Add to {activeMealType}
                </h3>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search 150+ Indian foods (e.g. Idli, Biryani, Dosa, Paneer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#181818] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#10B981]"
                autoFocus
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#10B981] text-black'
                      : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {filteredFoods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-xs">No matching food found.</p>
                  <button
                    onClick={() => setShowCustomFoodForm(true)}
                    className="mt-2 text-xs text-[#10B981] underline font-bold cursor-pointer"
                  >
                    + Create Custom Food
                  </button>
                </div>
              ) : (
                filteredFoods.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFoodItem(food)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#10B981]/15 border-[#10B981] text-white'
                          : 'bg-[#181818] border-[#262626] text-gray-300 hover:border-[#333333]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{food.name}</span>
                          <span className="text-[9px] font-bold text-gray-400 bg-[#222222] px-2 py-0.5 rounded">
                            {food.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {food.servingSize} • {food.calories} kcal
                        </p>
                      </div>

                      <div className="text-right text-[11px]">
                        <span className="font-extrabold text-blue-400 block">{food.protein}g P</span>
                        <span className="text-gray-500 text-[10px]">
                          {food.carbs}g C | {food.fat}g F
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quantity Selector & Confirm Footer */}
            {selectedFood && (
              <div className="border-t border-[#222222] pt-3 space-y-3 bg-[#111111]">
                <div className="flex items-center justify-between bg-[#181818] p-3 rounded-xl border border-[#262626]">
                  <div>
                    <span className="text-xs font-bold text-white block">{selectedFood.name}</span>
                    <span className="text-[11px] text-[#10B981] font-bold">
                      Calculated: {Math.round(selectedFood.calories * quantity)} kcal |{' '}
                      {+(selectedFood.protein * quantity).toFixed(1)}g Protein
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(0.5, +(q - 0.5).toFixed(1)))}
                      className="w-7 h-7 bg-[#222222] text-white font-bold rounded-lg flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold text-white w-8 text-center">
                      {quantity}x
                    </span>
                    <button
                      onClick={() => setQuantity((q) => +(q + 0.5).toFixed(1))}
                      className="w-7 h-7 bg-[#222222] text-white font-bold rounded-lg flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmAddMeal}
                  variant="primary"
                  fullWidth
                  className="py-2.5 text-xs font-bold"
                  icon={<Check className="w-4 h-4" />}
                >
                  Confirm & Add to {activeMealType}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE CUSTOM FOOD FORM MODAL */}
      {showCustomFoodForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#222222] w-full max-w-md rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <h3 className="text-sm font-bold text-white">Create Custom Food Item</h3>
              <button
                onClick={() => setShowCustomFoodForm(false)}
                className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Food Name</label>
                <input
                  type="text"
                  placeholder="e.g. Homemade Protein Shake"
                  value={cfName}
                  onChange={(e) => setCfName(e.target.value)}
                  required
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={cfCalories}
                    onChange={(e) => setCfCalories(e.target.value)}
                    required
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25"
                    value={cfProtein}
                    onChange={(e) => setCfProtein(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={cfCarbs}
                    onChange={(e) => setCfCarbs(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5"
                    value={cfFat}
                    onChange={(e) => setCfFat(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Serving Size</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Glass (250ml)"
                  value={cfServing}
                  onChange={(e) => setCfServing(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <Button type="submit" variant="primary" fullWidth className="py-2.5 text-xs font-bold">
                Save Custom Food
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Daily Transformation Report Modal */}
      <DailyTransformationReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        record={completedRecord}
        onUnlockEdit={handleUnlockDay}
      />

      {/* Daily Timeline Modal */}
      <DailyTimelineModal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        onSelectRecord={(rec) => {
          setCompletedRecord(rec);
          setShowTimelineModal(false);
          setShowReportModal(true);
        }}
      />
    </div>
  );
};
