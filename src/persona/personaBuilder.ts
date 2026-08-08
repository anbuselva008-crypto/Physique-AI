import { UserPersonalDetails, UserBodyDetails } from './userPersona';
import { FitnessPersonaDetails } from './fitnessPersona';
import { LifestylePersonaDetails } from './lifestylePersona';
import { DietPersonaDetails } from './dietPersona';
import { CollegePersonaDetails } from './collegePersona';
import { PersonaConstraintsDetails } from './constraints';
import { PersonaGoalsDetails } from './goals';
import { PersonaPreferencesDetails } from './preferences';

import { profileService } from '../services/profileService';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';
import { workoutService } from '../services/workoutService';
import { progressService } from '../services/progressService';
import { memoryEngine } from '../ai/memoryEngine';

export interface UnifiedUserPersona {
  personal: UserPersonalDetails;
  body: UserBodyDetails;
  fitness: FitnessPersonaDetails;
  lifestyle: LifestylePersonaDetails;
  diet: DietPersonaDetails;
  college: CollegePersonaDetails;
  constraints: PersonaConstraintsDetails;
  goals: PersonaGoalsDetails;
  preferences: PersonaPreferencesDetails;
  lastUpdatedAt: string;
}

const PERSONA_STORAGE_KEY = 'physique_ai_unified_persona';

export class PersonaEngineManager {
  private currentPersona: UnifiedUserPersona | null = null;

  /**
   * Synthesizes profile, check-in, nutrition, workout, progress services,
   * and long-term memory engine insights into a single UnifiedUserPersona object.
   */
  public buildPersona(): UnifiedUserPersona {
    // Gather data from all core services
    const profile = profileService.load();
    const todayCheckIn = checkInService.load();
    const checkInStats = checkInService.statistics();
    const nutritionData = nutritionService.load();
    const workoutData = workoutService.load();
    const progressData = progressService.load();
    const memorySummary = memoryEngine.summarize();

    // Check if stored overrides exist in localStorage
    let storedOverrides: Partial<UnifiedUserPersona> = {};
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(PERSONA_STORAGE_KEY);
        if (raw) {
          storedOverrides = JSON.parse(raw);
        }
      } catch (e) {
        console.error('Error reading persona overrides from storage', e);
      }
    }

    // 1. Personal
    const personal: UserPersonalDetails = {
      name: profile.name || 'Student Athlete',
      age: profile.age || 21,
      gender: storedOverrides.personal?.gender || 'Male',
      city: profile.city || 'Chennai',
      state: storedOverrides.personal?.state || 'Tamil Nadu',
      college: storedOverrides.personal?.college || (memorySummary.collegeOrWorkRoutine ? 'Engineering College' : 'SRM Institute of Science & Tech'),
      occupation: storedOverrides.personal?.occupation || 'Student & Fitness Enthusiast',
    };

    // 2. Body
    const body: UserBodyDetails = {
      height: profile.heightCm || 175,
      weight: profile.currentWeightKg || 70,
      estimatedBodyFat: storedOverrides.body?.estimatedBodyFat || 16.5,
      goalBodyFat: storedOverrides.body?.goalBodyFat || 12.0,
      bodyType: storedOverrides.body?.bodyType || 'Mesomorph / Athletic',
      weakAreas: storedOverrides.body?.weakAreas || ['Upper Chest', 'Rear Delts', 'Calves'],
      strongAreas: storedOverrides.body?.strongAreas || ['Lats / Back', 'Quads', 'Triceps'],
    };

    // 3. Fitness
    const fitness: FitnessPersonaDetails = {
      goal: profile.fitnessGoal || memorySummary.activeGoal || 'Build Lean Muscle & Lose Body Fat',
      trainingLevel: profile.trainingExperience || 'Intermediate',
      preferredWorkoutTime: memorySummary.preferredWorkoutTime || '06:30 AM',
      preferredWorkoutDays: storedOverrides.fitness?.preferredWorkoutDays || ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
      availableEquipment: storedOverrides.fitness?.availableEquipment || [
        'Barbell',
        'Dumbbells',
        'Cable Crossover',
        'Pull-up Bar',
        'Incline Bench',
        'Squat Rack',
      ],
    };

    // 4. Lifestyle
    const lifestyle: LifestylePersonaDetails = {
      wakeTime: storedOverrides.lifestyle?.wakeTime || '06:00 AM',
      sleepTime: storedOverrides.lifestyle?.sleepTime || '11:15 PM',
      collegeSchedule: memorySummary.collegeOrWorkRoutine || 'Lectures & Labs 08:30 AM - 04:00 PM',
      examRoutine: storedOverrides.lifestyle?.examRoutine || 'Mid-term exams upcoming; study sessions 08:00 PM - 11:00 PM',
      averageSleep: todayCheckIn?.sleepHours || memorySummary.typicalSleepHours || 7.5,
      averageStress: checkInStats.todayEnergyLevel ? Math.max(1, 10 - checkInStats.todayEnergyLevel) : 4,
      averageSteps: storedOverrides.lifestyle?.averageSteps || 8500,
    };

    // 5. Diet
    const diet: DietPersonaDetails = {
      foodBudget: memorySummary.budgetPreference || 'Student Friendly (₹3,500/month)',
      dietaryPreferences: storedOverrides.diet?.dietaryPreferences || [profile.diet || 'High Protein Non-Veg'],
      foodsLiked: memorySummary.favoriteFoods.length > 0 ? memorySummary.favoriteFoods : ['Chicken Breast', 'Eggs', 'Oats', 'Peanut Butter', 'Bananas', 'Paneer'],
      foodsAvoided: storedOverrides.diet?.foodsAvoided || ['Ultra-processed Junk', 'Excessive Deep Fried Snacks'],
      cookingAbility: storedOverrides.diet?.cookingAbility || 'Basic Hostel Meal Prep & Canteen Customization',
      hydration: storedOverrides.diet?.hydration || `${((nutritionData.waterLog?.targetMl || 3500) / 1000).toFixed(1)} Liters / day`,
    };

    // 6. College
    const college: CollegePersonaDetails = {
      collegeName: personal.college,
      department: storedOverrides.college?.department || 'Computer Science & Engineering',
      academicYear: storedOverrides.college?.academicYear || '3rd Year',
      canteenOptions: storedOverrides.college?.canteenOptions || ['Egg Roll / Omelette Stall', 'Boiled Eggs & Juice Corner', 'South Indian Thali'],
      hostelStatus: storedOverrides.college?.hostelStatus || 'Hostel Resident',
      scheduleFlexibility: storedOverrides.college?.scheduleFlexibility || 'Moderate (High flexibility on weekends, rigid on lab days)',
    };

    // 7. Constraints
    const constraints: PersonaConstraintsDetails = {
      availableTime: storedOverrides.constraints?.availableTime || '60 to 75 minutes for workouts',
      recoveryLimits: storedOverrides.constraints?.recoveryLimits || 'Occasional shoulder fatigue after heavy pressing',
      budgetLimits: storedOverrides.constraints?.budgetLimits || '₹200 / day maximum food budget',
      collegeConstraints: storedOverrides.constraints?.collegeConstraints || [
        '75% minimum class attendance requirement',
        'Limited cooking appliances in hostel room',
        'Fixed mess timings (Breakfast 7:30-8:30 AM, Dinner 7:30-9:00 PM)',
      ],
    };

    // 8. Goals
    const goals: PersonaGoalsDetails = {
      oneMonth: storedOverrides.goals?.oneMonth || `Add 1.0kg lean muscle, maintain ${fitness.goal}`,
      threeMonths: storedOverrides.goals?.threeMonths || `Reach ${body.goalBodyFat}% body fat and hit 140g daily protein consistently`,
      sixMonths: storedOverrides.goals?.sixMonths || 'Visible 6-pack abs, 100kg bench press, full athletic physique',
      twelveMonths: storedOverrides.goals?.twelveMonths || `Complete aesthetic transformation at ${profile.targetWeightKg || 72}kg bodyweight`,
    };

    // 9. Preferences
    const preferences: PersonaPreferencesDetails = {
      coachingStyle: storedOverrides.preferences?.coachingStyle || 'Direct, evidence-based, data-driven, highly encouraging',
      reminderPreferences: storedOverrides.preferences?.reminderPreferences || [
        'Morning check-in reminder at 07:00 AM',
        'Pre-workout energy prompt 30 mins before gym',
        'Evening macro deficit alert at 08:30 PM',
      ],
      photoAnalysisEnabled: storedOverrides.preferences?.photoAnalysisEnabled ?? true,
      monthlyReviewEnabled: storedOverrides.preferences?.monthlyReviewEnabled ?? true,
      adaptiveWorkoutEnabled: storedOverrides.preferences?.adaptiveWorkoutEnabled ?? true,
      adaptiveNutritionEnabled: storedOverrides.preferences?.adaptiveNutritionEnabled ?? true,
    };

    const unifiedPersona: UnifiedUserPersona = {
      personal,
      body,
      fitness,
      lifestyle,
      diet,
      college,
      constraints,
      goals,
      preferences,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.currentPersona = unifiedPersona;
    this.persistPersona(unifiedPersona);
    return unifiedPersona;
  }

  /**
   * Returns the currently loaded persona, or builds a fresh one if null.
   */
  public getPersona(): UnifiedUserPersona {
    if (!this.currentPersona) {
      return this.buildPersona();
    }
    return this.currentPersona;
  }

  /**
   * Dynamically updates fields in the unified persona and saves to persistent storage.
   */
  public updatePersona(partial: Partial<UnifiedUserPersona>): UnifiedUserPersona {
    const existing = this.getPersona();

    const updated: UnifiedUserPersona = {
      personal: { ...existing.personal, ...(partial.personal || {}) },
      body: { ...existing.body, ...(partial.body || {}) },
      fitness: { ...existing.fitness, ...(partial.fitness || {}) },
      lifestyle: { ...existing.lifestyle, ...(partial.lifestyle || {}) },
      diet: { ...existing.diet, ...(partial.diet || {}) },
      college: { ...existing.college, ...(partial.college || {}) },
      constraints: { ...existing.constraints, ...(partial.constraints || {}) },
      goals: { ...existing.goals, ...(partial.goals || {}) },
      preferences: { ...existing.preferences, ...(partial.preferences || {}) },
      lastUpdatedAt: new Date().toISOString(),
    };

    this.currentPersona = updated;
    this.persistPersona(updated);
    return updated;
  }

  /**
   * Generates a complete human-readable profile describing the user's current situation,
   * goals, strengths, limitations, and coaching preferences.
   */
  public summarizePersona(): string {
    const p = this.getPersona();

    return `=== UNIFIED USER PERSONA SUMMARY ===

👤 PERSONAL PROFILE
- Name: ${p.personal.name} (${p.personal.age} y/o, ${p.personal.gender})
- Location: ${p.personal.city}, ${p.personal.state}
- Education / Occupation: ${p.personal.occupation} at ${p.personal.college}

📐 BODY & COMPOSITION
- Height: ${p.body.height} cm | Weight: ${p.body.weight} kg
- Estimated Body Fat: ${p.body.estimatedBodyFat}% (Goal: ${p.body.goalBodyFat}%)
- Body Type: ${p.body.bodyType}
- Strong Muscle Groups: ${p.body.strongAreas.join(', ')}
- Target Development Areas: ${p.body.weakAreas.join(', ')}

🏋️ FITNESS & TRAINING
- Primary Goal: ${p.fitness.goal}
- Experience Level: ${p.fitness.trainingLevel}
- Preferred Workout Schedule: ${p.fitness.preferredWorkoutTime} (${p.fitness.preferredWorkoutDays.join(', ')})
- Equipment Access: ${p.fitness.availableEquipment.join(', ')}

🌙 LIFESTYLE & ROUTINE
- Sleep Schedule: ${p.lifestyle.wakeTime} wake / ${p.lifestyle.sleepTime} sleep (~${p.lifestyle.averageSleep} hrs avg)
- Daily Steps Target: ~${p.lifestyle.averageSteps}
- Academic Schedule: ${p.lifestyle.collegeSchedule}
- Exam Stress Level: ${p.lifestyle.examRoutine} (Current Stress: ${p.lifestyle.averageStress}/10)

🥗 DIET & NUTRITION
- Budget: ${p.diet.foodBudget}
- Preferences: ${p.diet.dietaryPreferences.join(', ')}
- Favorite Foods: ${p.diet.foodsLiked.join(', ')}
- Avoided Foods: ${p.diet.foodsAvoided.join(', ')}
- Cooking Setup: ${p.diet.cookingAbility} | Hydration: ${p.diet.hydration}

🎓 COLLEGE & HOSTEL ENVIRONMENT
- College: ${p.college.collegeName} (${p.college.department}, ${p.college.academicYear})
- Living Situation: ${p.college.hostelStatus}
- Local Food Options: ${p.college.canteenOptions.join(', ')}
- Schedule Flexibility: ${p.college.scheduleFlexibility}

⚠️ CONSTRAINTS & LIMITATIONS
- Time Available: ${p.constraints.availableTime}
- Recovery / Physical Limits: ${p.constraints.recoveryLimits}
- Budget Cap: ${p.constraints.budgetLimits}
- Academic Constraints: ${p.constraints.collegeConstraints.join('; ')}

🎯 TIMELINE GOALS
- 1 Month: ${p.goals.oneMonth}
- 3 Months: ${p.goals.threeMonths}
- 6 Months: ${p.goals.sixMonths}
- 12 Months: ${p.goals.twelveMonths}

🤖 COACHING PREFERENCES
- Coaching Style: ${p.preferences.coachingStyle}
- Reminders: ${p.preferences.reminderPreferences.join('; ')}
- Features Enabled: Photo Analysis (${p.preferences.photoAnalysisEnabled ? 'Yes' : 'No'}), Monthly Reviews (${p.preferences.monthlyReviewEnabled ? 'Yes' : 'No'}), Adaptive Workouts (${p.preferences.adaptiveWorkoutEnabled ? 'Yes' : 'No'}), Adaptive Nutrition (${p.preferences.adaptiveNutritionEnabled ? 'Yes' : 'No'})
===================================`;
  }

  private persistPersona(persona: UnifiedUserPersona): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PERSONA_STORAGE_KEY, JSON.stringify(persona));
      } catch (e) {
        console.error('Failed to persist persona to localStorage', e);
      }
    }
  }
}

export const personaEngineManager = new PersonaEngineManager();

export const buildPersona = () => personaEngineManager.buildPersona();
export const getPersona = () => personaEngineManager.getPersona();
export const updatePersona = (partial: Partial<UnifiedUserPersona>) => personaEngineManager.updatePersona(partial);
export const summarizePersona = () => personaEngineManager.summarizePersona();
