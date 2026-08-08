import { AIContext, DecisionReport } from './types';
import {
  MemoryCategory,
  MemoryImportance,
  MemoryItem,
  MemoryQueryOptions,
  MemorySummary,
} from './memoryTypes';

/**
 * Long-Term AI Memory Engine
 * Learns, updates, retains, and recalls persistent behavioral patterns, preferences,
 * macro averages, schedule dynamics, and physical milestones without API calls or UI dependencies.
 */
export class AIMemoryEngine {
  private memories: Map<string, MemoryItem> = new Map();
  private lastLearnedAt: string = new Date().toISOString();

  constructor(initialMemories?: MemoryItem[]) {
    if (initialMemories) {
      for (const item of initialMemories) {
        this.memories.set(item.key, item);
      }
    }
  }

  /**
   * Learns and updates memories from AIContext, DecisionReport, or explicit observations.
   */
  public learn(
    context?: AIContext,
    decisionReport?: DecisionReport,
    explicitInsight?: {
      key: string;
      value: string | number | boolean | Record<string, unknown> | Array<unknown>;
      category?: MemoryCategory;
      importance?: MemoryImportance;
      confidence?: number;
    }
  ): void {
    const now = new Date().toISOString();
    this.lastLearnedAt = now;

    // 1. Process explicit insight if provided
    if (explicitInsight) {
      this.upsertMemory({
        id: `mem_${explicitInsight.key}`,
        key: explicitInsight.key,
        value: explicitInsight.value,
        category: explicitInsight.category || 'general',
        importance: explicitInsight.importance || 'medium',
        confidence: explicitInsight.confidence ?? 0.95,
        source: 'user_explicit',
        firstObservedAt: now,
        lastUpdatedAt: now,
        accessCount: 0,
      });
    }

    if (!context) return;

    // 2. Learn from User Profile
    const profile = context.profile;
    const stats = profile.stats;
    const sched = profile.rawProfile.schedule;

    if (stats.fitnessGoal) {
      this.upsertMemory({
        id: 'mem_active_goal',
        key: 'active_goal',
        value: stats.fitnessGoal,
        category: 'goal_milestone',
        importance: 'high',
        confidence: 1.0,
        source: 'auto_learned',
        firstObservedAt: now,
        lastUpdatedAt: now,
        accessCount: 0,
      });
    }

    if (sched) {
      if (sched.gymTime) {
        this.upsertMemory({
          id: 'mem_preferred_workout_time',
          key: 'preferred_workout_time',
          value: sched.gymTime,
          category: 'workout_preference',
          importance: 'high',
          confidence: 0.9,
          source: 'auto_learned',
          firstObservedAt: now,
          lastUpdatedAt: now,
          accessCount: 0,
        });
      }

      if (sched.collegeStart && sched.collegeEnd) {
        this.upsertMemory({
          id: 'mem_college_routine',
          key: 'college_routine',
          value: `College/Work timing from ${sched.collegeStart} to ${sched.collegeEnd}`,
          category: 'lifestyle_routine',
          importance: 'medium',
          confidence: 0.85,
          source: 'auto_learned',
          firstObservedAt: now,
          lastUpdatedAt: now,
          accessCount: 0,
        });
      }
    }

    if (profile.rawProfile.diet) {
      this.upsertMemory({
        id: 'mem_dietary_type',
        key: 'dietary_type',
        value: profile.rawProfile.diet,
        category: 'nutrition_habit',
        importance: 'high',
        confidence: 0.95,
        source: 'auto_learned',
        firstObservedAt: now,
        lastUpdatedAt: now,
        accessCount: 0,
      });
    }

    if (profile.rawProfile.monthlyBudget) {
      this.upsertMemory({
        id: 'mem_budget_preference',
        key: 'budget_preference',
        value: profile.rawProfile.monthlyBudget,
        category: 'lifestyle_routine',
        importance: 'medium',
        confidence: 0.9,
        source: 'auto_learned',
        firstObservedAt: now,
        lastUpdatedAt: now,
        accessCount: 0,
      });
    }


    // 3. Learn from Nutrition Context
    const nutrition = context.nutrition;
    if (nutrition.goals.targetCalories > 0) {
      this.upsertMemory({
        id: 'mem_typical_calories',
        key: 'typical_calories',
        value: nutrition.goals.targetCalories,
        category: 'nutrition_habit',
        importance: 'medium',
        confidence: 0.85,
        source: 'auto_learned',
        firstObservedAt: now,
        lastUpdatedAt: now,
        accessCount: 0,
      });
    }

    if (nutrition.goals.targetProtein > 0) {
      this.upsertMemory({
        id: 'mem_typical_protein',
        key: 'typical_protein',
        value: nutrition.goals.targetProtein,
        category: 'nutrition_habit',
        importance: 'high',
        confidence: 0.9,
        source: 'auto_learned',
        firstObservedAt: now,
        lastUpdatedAt: now,
        accessCount: 0,
      });
    }

    // 4. Learn from Check-In & Recovery Context
    const checkIn = context.todayCheckIn.summary;
    if (checkIn.sleepHours !== null && checkIn.sleepHours > 0) {
      const existingSleep = this.memories.get('typical_sleep');
      let avgSleep = checkIn.sleepHours;
      if (existingSleep && typeof existingSleep.value === 'number') {
        avgSleep = Math.round(((existingSleep.value + checkIn.sleepHours) / 2) * 10) / 10;
      }

      this.upsertMemory({
        id: 'mem_typical_sleep',
        key: 'typical_sleep',
        value: avgSleep,
        category: 'recovery_pattern',
        importance: 'high',
        confidence: 0.85,
        source: 'auto_learned',
        firstObservedAt: existingSleep ? existingSleep.firstObservedAt : now,
        lastUpdatedAt: now,
        accessCount: existingSleep ? existingSleep.accessCount : 0,
      });
    }

    // 5. Learn from Decision Engine
    if (decisionReport) {
      this.upsertMemory({
        id: 'mem_average_recovery_score',
        key: 'average_recovery_score',
        value: decisionReport.recovery.score,
        category: 'recovery_pattern',
        importance: 'medium',
        confidence: 0.9,
        source: 'decision_engine',
        firstObservedAt: now,
        lastUpdatedAt: now,
        accessCount: 0,
      });

      if (decisionReport.risk.activeRisks.length > 0) {
        this.upsertMemory({
          id: 'mem_recent_risk_flags',
          key: 'recent_risk_flags',
          value: decisionReport.risk.activeRisks,
          category: 'recovery_pattern',
          importance: 'high',
          confidence: 0.95,
          source: 'decision_engine',
          firstObservedAt: now,
          lastUpdatedAt: now,
          accessCount: 0,
        });
      }
    }
  }

  /**
   * Recalls a memory item by exact key or ID.
   */
  public recall(keyOrId: string): MemoryItem | null {
    let item = this.memories.get(keyOrId);

    if (!item) {
      for (const m of this.memories.values()) {
        if (m.id === keyOrId) {
          item = m;
          break;
        }
      }
    }

    if (item) {
      item.accessCount += 1;
      return { ...item };
    }

    return null;
  }

  /**
   * Removes a specific memory by key or ID.
   */
  public forget(keyOrId: string): boolean {
    if (this.memories.has(keyOrId)) {
      this.memories.delete(keyOrId);
      return true;
    }

    for (const [k, v] of this.memories.entries()) {
      if (v.id === keyOrId) {
        this.memories.delete(k);
        return true;
      }
    }

    return false;
  }

  /**
   * Returns a structured executive summary of long-term memories.
   */
  public summarize(): MemorySummary {
    const workoutTime = this.memories.get('preferred_workout_time')?.value as string || null;
    const favExercises = (this.memories.get('favorite_exercises')?.value as string[]) || [];
    const skipExercises = (this.memories.get('skipped_exercises')?.value as string[]) || [];
    const favFoods = (this.memories.get('favorite_foods')?.value as string[]) || [];
    const typicalProtein = (this.memories.get('typical_protein')?.value as number) || null;
    const typicalCalories = (this.memories.get('typical_calories')?.value as number) || null;
    const typicalSleep = (this.memories.get('typical_sleep')?.value as number) || null;
    const avgRecovery = (this.memories.get('average_recovery_score')?.value as number) || null;
    const collegeRoutine = (this.memories.get('college_routine')?.value as string) || null;
    const budgetPref = (this.memories.get('budget_preference')?.value as string) || null;
    const activeGoal = (this.memories.get('active_goal')?.value as string) || null;

    const keyInsights: string[] = [];
    if (activeGoal) keyInsights.push(`Primary Goal: ${activeGoal}`);
    if (workoutTime) keyInsights.push(`Preferred Gym Window: ${workoutTime}`);
    if (typicalSleep) keyInsights.push(`Average Sleep: ${typicalSleep} hrs/night`);
    if (typicalProtein) keyInsights.push(`Protein Target: ${typicalProtein}g/day`);
    if (collegeRoutine) keyInsights.push(`Routine: ${collegeRoutine}`);

    return {
      totalMemories: this.memories.size,
      preferredWorkoutTime: workoutTime,
      favoriteExercises: favExercises,
      skippedExercises: skipExercises,
      favoriteFoods: favFoods,
      typicalProteinIntakeG: typicalProtein,
      typicalCalorieIntakeKcal: typicalCalories,
      typicalSleepHours: typicalSleep,
      averageRecoveryScore: avgRecovery,
      collegeOrWorkRoutine: collegeRoutine,
      budgetPreference: budgetPref,
      activeGoal,
      keyInsights,
      lastLearnedAt: this.lastLearnedAt,
    };
  }

  /**
   * Returns relevant memories matching search terms or categories for LLM prompts.
   */
  public getRelevantMemories(
    query?: string,
    category?: MemoryCategory,
    limit: number = 5
  ): MemoryItem[] {
    let result = Array.from(this.memories.values());

    if (category) {
      result = result.filter((m) => m.category === category);
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.key.toLowerCase().includes(q) ||
          JSON.stringify(m.value).toLowerCase().includes(q)
      );
    }

    // Sort by importance weight & confidence
    const importanceMap: Record<MemoryImportance, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    result.sort((a, b) => {
      const impA = importanceMap[a.importance] * a.confidence;
      const impB = importanceMap[b.importance] * b.confidence;
      return impB - impA;
    });

    return result.slice(0, limit);
  }

  /**
   * Helper to upsert memory items.
   */
  private upsertMemory(item: MemoryItem): void {
    const existing = this.memories.get(item.key);
    if (existing) {
      this.memories.set(item.key, {
        ...existing,
        value: item.value,
        confidence: item.confidence,
        lastUpdatedAt: item.lastUpdatedAt,
        importance: item.importance,
      });
    } else {
      this.memories.set(item.key, item);
    }
  }

  /**
   * Export all memories for external persistence if needed.
   */
  public exportMemories(): MemoryItem[] {
    return Array.from(this.memories.values());
  }
}

export const memoryEngine = new AIMemoryEngine();
