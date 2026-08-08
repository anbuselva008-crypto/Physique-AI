export interface AdherencePattern {
  category: 'workout' | 'nutrition' | 'recovery' | 'habit';
  score: number; // 0 to 100
  recentTrend: 'improving' | 'stable' | 'declining';
  notes: string;
}

export interface ConversationMemoryEntry {
  id: string;
  key: string;
  value: string;
  category:
    | 'frequent_question'
    | 'common_struggle'
    | 'workout_adherence'
    | 'nutrition_adherence'
    | 'recovery_habit'
    | 'recurring_mistake'
    | 'skipped_habit';
  timestamp: string;
  occurrenceCount: number;
}

export class ConversationMemoryManager {
  private memories: ConversationMemoryEntry[] = [];
  private adherence: Record<string, AdherencePattern> = {
    workout: {
      category: 'workout',
      score: 88,
      recentTrend: 'improving',
      notes: 'Consistently completes chest and back sessions; tends to skip leg day warmup.',
    },
    nutrition: {
      category: 'nutrition',
      score: 82,
      recentTrend: 'stable',
      notes: 'Averages 155g protein out of 165g target. Often short on protein at lunch during college lectures.',
    },
    recovery: {
      category: 'recovery',
      score: 75,
      recentTrend: 'declining',
      notes: 'Sleep averages 6.2 hours on exam/project nights. High caffeine consumption post 5 PM.',
    },
  };

  constructor() {
    this.seedInitialMemories();
  }

  private seedInitialMemories(): void {
    this.memories = [
      {
        id: 'mem_1',
        key: 'frequent_question_leg_day',
        value: 'Asks whether to squat after sleeping less than 6 hours.',
        category: 'frequent_question',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        occurrenceCount: 4,
      },
      {
        id: 'mem_2',
        key: 'common_struggle_college_lunch',
        value: 'Hostel mess lunch lacks high protein options.',
        category: 'common_struggle',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        occurrenceCount: 6,
      },
      {
        id: 'mem_3',
        key: 'recurring_mistake_late_caffeine',
        value: 'Takes pre-workout or coffee at 7 PM causing 1 AM sleep latency.',
        category: 'recurring_mistake',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        occurrenceCount: 3,
      },
      {
        id: 'mem_4',
        key: 'skipped_habit_water_intake',
        value: 'Frequently forgets hydration tracking during 9 AM to 2 PM lectures.',
        category: 'skipped_habit',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        occurrenceCount: 5,
      },
    ];
  }

  public recordObservation(
    category: ConversationMemoryEntry['category'],
    key: string,
    value: string
  ): void {
    const existing = this.memories.find((m) => m.key === key);
    if (existing) {
      existing.occurrenceCount += 1;
      existing.value = value;
      existing.timestamp = new Date().toISOString();
    } else {
      this.memories.push({
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        key,
        value,
        category,
        timestamp: new Date().toISOString(),
        occurrenceCount: 1,
      });
    }
  }

  public getMemoriesByCategory(
    category: ConversationMemoryEntry['category']
  ): ConversationMemoryEntry[] {
    return this.memories.filter((m) => m.category === category);
  }

  public getAllMemories(): ConversationMemoryEntry[] {
    return [...this.memories];
  }

  public getAdherence(): Record<string, AdherencePattern> {
    return { ...this.adherence };
  }

  public updateAdherence(
    category: 'workout' | 'nutrition' | 'recovery',
    scoreDelta: number,
    note?: string
  ): void {
    if (this.adherence[category]) {
      this.adherence[category].score = Math.min(
        100,
        Math.max(0, this.adherence[category].score + scoreDelta)
      );
      if (note) {
        this.adherence[category].notes = note;
      }
    }
  }

  public summarizeForCoach(): string {
    const struggles = this.getMemoriesByCategory('common_struggle')
      .map((m) => m.value)
      .join('; ');
    const mistakes = this.getMemoriesByCategory('recurring_mistake')
      .map((m) => m.value)
      .join('; ');
    const skipped = this.getMemoriesByCategory('skipped_habit')
      .map((m) => m.value)
      .join('; ');

    return `[Coach Memory Context]
- Workout Adherence: ${this.adherence.workout.score}% (${this.adherence.workout.notes})
- Nutrition Adherence: ${this.adherence.nutrition.score}% (${this.adherence.nutrition.notes})
- Recovery Adherence: ${this.adherence.recovery.score}% (${this.adherence.recovery.notes})
- Known Struggles: ${struggles || 'None logged'}
- Recurring Patterns/Mistakes: ${mistakes || 'None logged'}
- Frequently Skipped Habits: ${skipped || 'None logged'}`;
  }
}

export const conversationMemory = new ConversationMemoryManager();
