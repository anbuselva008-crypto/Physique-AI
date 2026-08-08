import React, { useState, useMemo } from 'react';
import {
  EXERCISE_DATABASE,
  FOOD_KNOWLEDGE_BASE,
  TRAINING_SCIENCE_DATABASE,
  RECOVERY_KNOWLEDGE_DATABASE,
  SUPPLEMENT_KNOWLEDGE_DATABASE,
  MOTIVATION_KNOWLEDGE_DATABASE,
} from '../../knowledge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Search,
  Dumbbell,
  Utensils,
  BookOpen,
  HeartPulse,
  Pill,
  Flame,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  DollarSign,
  Zap,
  Info,
  Filter,
} from 'lucide-react';

type KnowledgeTab = 'exercises' | 'foods' | 'science' | 'recovery' | 'supplements' | 'motivation';

export const KnowledgeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('exercises');
  const [searchQuery, setSearchQuery] = useState('');

  // Exercise filters
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Food filters
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Egg' | 'Chicken'>('All');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string>('All');

  // Motivation filter
  const [motivationCategory, setMotivationCategory] = useState<string>('All');

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMuscle =
        selectedMuscle === 'All' ||
        ex.primaryMuscles.some((m) => m.toLowerCase().includes(selectedMuscle.toLowerCase()));

      const matchesDifficulty =
        selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;

      return matchesSearch && matchesMuscle && matchesDifficulty;
    });
  }, [searchQuery, selectedMuscle, selectedDifficulty]);

  // Filter foods
  const filteredFoods = useMemo(() => {
    return FOOD_KNOWLEDGE_BASE.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.mealCategory.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDiet = true;
      if (dietFilter === 'Veg') matchesDiet = food.isVegetarian;
      if (dietFilter === 'Egg') matchesDiet = food.containsEgg || food.isVegetarian;
      if (dietFilter === 'Chicken') matchesDiet = food.isChicken;

      const matchesCategory =
        foodCategoryFilter === 'All' || food.mealCategory === foodCategoryFilter;

      return matchesSearch && matchesDiet && matchesCategory;
    });
  }, [searchQuery, dietFilter, foodCategoryFilter]);

  // Filter science
  const filteredScience = useMemo(() => {
    return TRAINING_SCIENCE_DATABASE.filter(
      (concept) =>
        concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter recovery
  const filteredRecovery = useMemo(() => {
    return RECOVERY_KNOWLEDGE_DATABASE.filter(
      (topic) =>
        topic.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter supplements
  const filteredSupplements = useMemo(() => {
    return SUPPLEMENT_KNOWLEDGE_DATABASE.filter(
      (supp) =>
        supp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supp.scientificMechanism.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter motivation
  const filteredMotivation = useMemo(() => {
    return MOTIVATION_KNOWLEDGE_DATABASE.filter((mot) => {
      const matchesSearch =
        mot.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mot.authorOrMindset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mot.actionableAdvice.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        motivationCategory === 'All' || mot.category === motivationCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, motivationCategory]);

  return (
    <div className="space-y-6 pb-32 px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111111] via-[#161616] to-[#111111] border border-[#222222] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fitness & Nutrition Science Library</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Knowledge Hub 📚
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Master exercise biomechanics, Indian nutrition stats, hypertrophy training principles, recovery science, and supplementation.
            </p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises, Indian dishes, science principles, supplements..."
          className="w-full bg-[#111111] border border-[#222222] rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white bg-[#222] px-2 py-1 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Primary Category Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#222222]">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'exercises'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'
              : 'bg-[#111111] text-gray-400 hover:text-white border border-[#222222]'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Exercises ({EXERCISE_DATABASE.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'foods'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'
              : 'bg-[#111111] text-gray-400 hover:text-white border border-[#222222]'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Indian Foods ({FOOD_KNOWLEDGE_BASE.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('science')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'science'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'
              : 'bg-[#111111] text-gray-400 hover:text-white border border-[#222222]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Training Science ({TRAINING_SCIENCE_DATABASE.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'recovery'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'
              : 'bg-[#111111] text-gray-400 hover:text-white border border-[#222222]'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Recovery ({RECOVERY_KNOWLEDGE_DATABASE.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supplements')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'supplements'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'
              : 'bg-[#111111] text-gray-400 hover:text-white border border-[#222222]'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Supplements ({SUPPLEMENT_KNOWLEDGE_DATABASE.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('motivation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'motivation'
              ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'
              : 'bg-[#111111] text-gray-400 hover:text-white border border-[#222222]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Mindset ({MOTIVATION_KNOWLEDGE_DATABASE.length})</span>
        </button>
      </div>

      {/* ----------------- TAB 1: EXERCISES ----------------- */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] border border-[#222222] p-3.5 rounded-xl text-xs">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <span className="text-gray-400 font-bold uppercase flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#10B981]" /> Muscle:
              </span>
              {['All', 'Chest', 'Lats', 'Back', 'Anterior Deltoids', 'Lateral Deltoids', 'Rear Delts', 'Biceps', 'Brachialis', 'Forearms'].map(
                (muscle) => (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                      selectedMuscle === muscle
                        ? 'bg-[#10B981] text-black font-bold'
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                    }`}
                  >
                    {muscle}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-gray-400 font-bold uppercase">Difficulty:</span>
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((ex) => {
              const isExpanded = expandedExerciseId === ex.id;

              return (
                <Card
                  key={ex.id}
                  className={`bg-[#111111] border-[#222222] transition-all ${
                    isExpanded ? 'border-[#10B981]/50 bg-[#141414]' : 'hover:border-gray-700'
                  }`}
                >
                  <div
                    onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                    className="cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 mr-2">
                          {ex.exerciseType}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-[#222] px-2 py-0.5 rounded">
                          {ex.equipment}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{ex.name}</h3>
                      </div>

                      <button className="text-gray-400 hover:text-white p-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-white font-medium">Target:</span>
                      <span className="text-[#10B981] font-semibold">{ex.primaryMuscles.join(', ')}</span>
                      <span>•</span>
                      <span className="text-gray-400">{ex.difficulty}</span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                      {ex.description}
                    </p>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#222222] space-y-3 text-xs text-gray-300 animate-fadeIn">
                      <div>
                        <h4 className="font-bold text-[#10B981] flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-4 h-4" /> Execution Tips:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 pl-1">
                          {ex.tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="w-4 h-4" /> Common Mistakes:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-400 pl-1">
                          {ex.commonMistakes.map((mistake, idx) => (
                            <li key={idx}>{mistake}</li>
                          ))}
                        </ul>
                      </div>

                      {ex.alternatives.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-400 mb-1">Alternatives:</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {ex.alternatives.map((alt, idx) => (
                              <span
                                key={idx}
                                className="bg-[#1e1e1e] border border-[#2e2e2e] text-gray-300 px-2 py-0.5 rounded text-[11px]"
                              >
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-[#111111] rounded-2xl border border-[#222]">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No exercises match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: INDIAN FOODS ----------------- */}
      {activeTab === 'foods' && (
        <div className="space-y-4">
          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] border border-[#222222] p-3.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase">Diet:</span>
              {(['All', 'Veg', 'Egg', 'Chicken'] as const).map((diet) => (
                <button
                  key={diet}
                  onClick={() => setDietFilter(diet)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    dietFilter === diet
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <span className="text-gray-400 font-bold uppercase shrink-0">Category:</span>
              {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFoodCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                    foodCategoryFilter === cat
                      ? 'bg-[#10B981] text-black font-bold'
                      : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <Card
                key={food.id}
                className="bg-[#111111] border-[#222222] hover:border-[#10B981]/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{food.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        food.isVegetarian
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : food.containsEgg
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {food.isVegetarian ? 'VEG' : food.containsEgg ? 'EGG' : 'NON-VEG'}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400">Serving: {food.servingSize}</p>

                  <div className="grid grid-cols-4 gap-1 bg-[#161616] p-2 rounded-lg text-center text-xs my-2 border border-[#222]">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Calories</p>
                      <p className="font-extrabold text-white">{food.calories}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Protein</p>
                      <p className="font-extrabold text-[#10B981]">{food.protein}g</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Carbs</p>
                      <p className="font-bold text-gray-300">{food.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Fat</p>
                      <p className="font-bold text-gray-300">{food.fat}g</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e1e1e] flex items-center justify-between text-[11px] text-gray-400 mt-2">
                  <div className="flex items-center gap-1 text-amber-400 font-medium">
                    <Award className="w-3.5 h-3.5" />
                    <span>Muscle: {food.muscleGainScore}/5</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#10B981] font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Budget: {food.budgetScore}/5</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredFoods.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-[#111111] rounded-2xl border border-[#222]">
              <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No Indian foods found matching your filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 3: TRAINING SCIENCE ----------------- */}
      {activeTab === 'science' && (
        <div className="space-y-4">
          {filteredScience.map((concept) => (
            <Card key={concept.id} className="bg-[#111111] border-[#222222] space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-lg font-bold text-white">{concept.title}</h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#161616] p-3 rounded-xl border border-[#222]">
                {concept.summary}
              </p>

              <div>
                <h4 className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Core Principles:
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {concept.keyPrinciples.map((prin, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#10B981] font-bold">•</span>
                      <span>{prin}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#10B981]/10 border border-[#10B981]/20 p-3 rounded-xl">
                <h4 className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">
                  Practical Application:
                </h4>
                <p className="text-xs text-gray-200">{concept.practicalApplication}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Common Misconceptions:
                </h4>
                <ul className="space-y-1 text-xs text-gray-400 pl-2">
                  {concept.commonMisconceptions.map((misc, idx) => (
                    <li key={idx} className="list-disc list-inside">
                      {misc}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ----------------- TAB 4: RECOVERY ----------------- */}
      {activeTab === 'recovery' && (
        <div className="space-y-4">
          {filteredRecovery.map((topic) => (
            <Card key={topic.id} className="bg-[#111111] border-[#222222] space-y-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-lg font-bold text-white">{topic.topic}</h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#161616] p-3 rounded-xl border border-[#222]">
                {topic.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#141414] p-3 rounded-xl border border-[#222]">
                  <h4 className="text-xs font-bold text-[#10B981] uppercase mb-2">Key Benefits</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {topic.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#141414] p-3 rounded-xl border border-[#222]">
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Recommended Protocol</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {topic.protocol.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#1e1e1e] border border-[#2e2e2e] p-3 rounded-xl">
                <h4 className="text-xs font-bold text-amber-400 uppercase mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Actionable Tips:
                </h4>
                <ul className="space-y-1 text-xs text-gray-300 pl-1">
                  {topic.actionableTips.map((tip, i) => (
                    <li key={i} className="list-disc list-inside">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ----------------- TAB 5: SUPPLEMENTS ----------------- */}
      {activeTab === 'supplements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSupplements.map((supp) => (
            <Card key={supp.id} className="bg-[#111111] border-[#222222] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#10B981]" />
                    {supp.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    Evidence: {supp.evidenceLevel}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-gray-300 bg-[#161616] p-2.5 rounded-lg border border-[#222]">
                  <p><span className="text-gray-500 font-bold uppercase">Dosage:</span> {supp.recommendedDosage}</p>
                  <p><span className="text-gray-500 font-bold uppercase">Timing:</span> {supp.timing}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#10B981] uppercase mb-1">Primary Benefits:</h4>
                  <ul className="space-y-1 text-xs text-gray-300 pl-1">
                    {supp.primaryBenefits.map((ben, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-gray-400">
                  <span className="font-bold text-gray-300">Mechanism: </span>
                  {supp.scientificMechanism}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e1e1e] flex items-center justify-between text-xs text-gray-400 mt-2">
                <span>Budget: <strong className="text-white">{supp.budgetRating}</strong></span>
                <span className="text-[11px] text-gray-500">Safe & Researched</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ----------------- TAB 6: MOTIVATION & MINDSET ----------------- */}
      {activeTab === 'motivation' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#111111] p-3 rounded-xl border border-[#222] text-xs">
            <span className="text-gray-400 font-bold uppercase shrink-0">Mindset State:</span>
            {['All', 'Beginner', 'Plateau', 'Missed Workout', 'Consistency', 'Discipline'].map((cat) => (
              <button
                key={cat}
                onClick={() => setMotivationCategory(cat)}
                className={`px-3 py-1 rounded-lg shrink-0 transition-colors ${
                  motivationCategory === cat
                    ? 'bg-[#10B981] text-black font-bold'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMotivation.map((mot) => (
              <Card key={mot.id} className="bg-[#111111] border-[#222222] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#222] text-[#10B981]">
                      {mot.category}
                    </span>
                    <span className="text-xs text-gray-500 italic">— {mot.authorOrMindset}</span>
                  </div>

                  <blockquote className="text-sm font-semibold text-white italic border-l-2 border-[#10B981] pl-3 py-1">
                    "{mot.quote}"
                  </blockquote>

                  <div className="bg-[#161616] p-2.5 rounded-lg border border-[#222] text-xs text-gray-300">
                    <span className="font-bold text-[#10B981] block mb-0.5">Actionable Advice:</span>
                    {mot.actionableAdvice}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
