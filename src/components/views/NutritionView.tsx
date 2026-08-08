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
} from 'lucide-react';

export const NutritionView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(progressService.getFormattedDate(0));
  const [viewTab, setViewTab] = useState<'log' | 'stats'>('log');

  // Data State
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>([]);
  const [waterLog, setWaterLog] = useState<WaterLog>({ date: selectedDate, ml: 0, targetMl: 3000 });
  const [goals, setGoals] = useState<DailyNutritionGoals>(nutritionService.getNutritionGoals());
  const [weeklyStats, setWeeklyStats] = useState(nutritionService.getWeeklyStats());

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

  useEffect(() => {
    refreshData();
  }, [selectedDate]);

  const refreshData = () => {
    setAllFoods(nutritionService.getAllFoods());
    setMealLogs(nutritionService.getMealLogsForDate(selectedDate));
    setWaterLog(nutritionService.getWaterForDate(selectedDate));
    setGoals(nutritionService.getNutritionGoals());
    setWeeklyStats(nutritionService.getWeeklyStats());
  };

  // Water Actions
  const handleAddWater = (ml: number) => {
    const updated = nutritionService.addWaterIntake(selectedDate, ml);
    setWaterLog(updated);
    setWeeklyStats(nutritionService.getWeeklyStats());
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
  };

  const handleDeleteMealItem = (id: string) => {
    nutritionService.deleteMealLog(id);
    refreshData();
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

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pt-2">
      {/* Header Banner */}
      <Card className="bg-[#111111] border-[#222222] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="w-5 h-5 text-[#10B981]" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Nutrition Engine</h1>
            </div>
            <p className="text-xs text-gray-400">
              Track calories, macros, Indian meals, and hydration with local offline storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('log')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                viewTab === 'log'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              Meal Tracker
            </button>
            <button
              onClick={() => setViewTab('stats')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                viewTab === 'stats'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/15'
                  : 'bg-[#181818] border border-[#262626] text-gray-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </Card>

      {viewTab === 'log' ? (
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
        </>
      ) : (
        /* STATISTICS TAB */
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
    </div>
  );
};
