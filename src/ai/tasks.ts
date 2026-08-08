import { AITaskType, UserRequest } from './types';
import {
  EXERCISE_DATABASE,
  FOOD_KNOWLEDGE_BASE,
  TRAINING_SCIENCE_DATABASE,
  RECOVERY_KNOWLEDGE_DATABASE,
  SUPPLEMENT_KNOWLEDGE_DATABASE,
  MOTIVATION_KNOWLEDGE_DATABASE,
} from '../knowledge';

/**
 * AI Task Classifier & Knowledge Matcher
 * Maps user prompts to specific AI task types and determines context requirements & knowledge base hits.
 */

export class TaskManager {
  /**
   * Classifies the task type based on request prompt, intent override, and attachments.
   */
  public static classifyTask(request: UserRequest): AITaskType {
    if (request.intent) {
      return request.intent;
    }

    if (request.imageUrl) {
      return 'photo_analysis';
    }

    const p = request.prompt.toLowerCase();

    // 1. Monthly Review
    if (
      p.includes('monthly review') ||
      p.includes('month summary') ||
      p.includes('past 30 days') ||
      p.includes('this month')
    ) {
      return 'monthly_review';
    }

    // 2. Weekly Review
    if (
      p.includes('weekly review') ||
      p.includes('week summary') ||
      p.includes('past 7 days') ||
      p.includes('this week')
    ) {
      return 'weekly_review';
    }

    // 3. Recovery
    if (
      p.includes('sleep') ||
      p.includes('sore') ||
      p.includes('soreness') ||
      p.includes('fatigue') ||
      p.includes('pain') ||
      p.includes('recovery') ||
      p.includes('rest day') ||
      p.includes('nap')
    ) {
      return 'recovery';
    }

    // 4. Workout Advice
    if (
      p.includes('workout') ||
      p.includes('exercise') ||
      p.includes('sets') ||
      p.includes('reps') ||
      p.includes('bench') ||
      p.includes('squat') ||
      p.includes('deadlift') ||
      p.includes('gym') ||
      p.includes('split') ||
      p.includes('training')
    ) {
      return 'workout_advice';
    }

    // 5. Nutrition Advice
    if (
      p.includes('protein') ||
      p.includes('calorie') ||
      p.includes('diet') ||
      p.includes('macro') ||
      p.includes('food') ||
      p.includes('meal') ||
      p.includes('chicken') ||
      p.includes('paneer') ||
      p.includes('roti') ||
      p.includes('water') ||
      p.includes('drink')
    ) {
      return 'nutrition_advice';
    }

    // 6. Motivation
    if (
      p.includes('motivation') ||
      p.includes('mindset') ||
      p.includes('quote') ||
      p.includes('discouraged') ||
      p.includes('give up') ||
      p.includes('feeling lazy') ||
      p.includes('consistency')
    ) {
      return 'motivation';
    }

    // 7. Progress Analysis
    if (
      p.includes('weight') ||
      p.includes('progress') ||
      p.includes('pr') ||
      p.includes('personal record') ||
      p.includes('measurement') ||
      p.includes('trend') ||
      p.includes('streak')
    ) {
      return 'progress_analysis';
    }

    // 8. Question Answering
    if (
      p.includes('what is') ||
      p.includes('how to') ||
      p.includes('explain') ||
      p.includes('creatine') ||
      p.includes('hypertrophy') ||
      p.includes('progressive overload') ||
      p.includes('why')
    ) {
      return 'question_answering';
    }

    return 'general_chat';
  }

  /**
   * Returns required context keys based on task type.
   */
  public static getRequiredContext(taskType: AITaskType): string[] {
    switch (taskType) {
      case 'workout_advice':
        return ['profile', 'todayCheckIn', 'workout', 'goals'];
      case 'nutrition_advice':
        return ['profile', 'nutrition', 'goals'];
      case 'recovery':
        return ['profile', 'todayCheckIn', 'workout', 'streaks'];
      case 'motivation':
        return ['profile', 'streaks', 'todayCheckIn'];
      case 'progress_analysis':
        return ['profile', 'progress', 'streaks', 'goals'];
      case 'weekly_review':
        return ['profile', 'workout', 'nutrition', 'progress', 'streaks', 'todayCheckIn', 'goals'];
      case 'monthly_review':
        return ['profile', 'workout', 'nutrition', 'progress', 'streaks', 'todayCheckIn', 'goals'];
      case 'photo_analysis':
        return ['profile', 'progress'];
      case 'question_answering':
        return ['profile'];
      case 'general_chat':
      default:
        return ['profile', 'todayCheckIn'];
    }
  }

  /**
   * Estimates token requirements for LLM prompt + completion.
   */
  public static estimateTokens(taskType: AITaskType, promptLength: number): number {
    const basePromptTokens = Math.ceil(promptLength / 4);
    let contextTokens = 500;

    switch (taskType) {
      case 'weekly_review':
      case 'monthly_review':
        contextTokens = 2500;
        break;
      case 'workout_advice':
      case 'nutrition_advice':
      case 'progress_analysis':
        contextTokens = 1200;
        break;
      case 'photo_analysis':
        contextTokens = 1800;
        break;
      default:
        contextTokens = 600;
        break;
    }

    return basePromptTokens + contextTokens + 400; // 400 generation buffer
  }

  /**
   * Queries internal static Knowledge Base for exact matches.
   */
  public static searchKnowledgeBase(query: string): string | null {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 3) return null;

    // Exercise match
    const exercise = EXERCISE_DATABASE.find(
      (e) => e.name.toLowerCase() === q || e.name.toLowerCase().includes(q)
    );
    if (exercise) {
      return `Exercise: ${exercise.name}\nTarget: ${exercise.primaryMuscles.join(
        ', '
      )}\nEquipment: ${exercise.equipment}\nDifficulty: ${exercise.difficulty}\nTips: ${exercise.tips.join(
        ' '
      )}`;
    }

    // Food match
    const food = FOOD_KNOWLEDGE_BASE.find(
      (f) => f.name.toLowerCase() === q || f.name.toLowerCase().includes(q)
    );
    if (food) {
      return `Food: ${food.name}\nCategory: ${food.mealCategory} (${food.servingSize})\nCalories: ${food.calories} kcal, Protein: ${food.protein}g, Carbs: ${food.carbs}g, Fat: ${food.fat}g.`;
    }

    // Supplement match
    const supp = SUPPLEMENT_KNOWLEDGE_DATABASE.find(
      (s) => s.name.toLowerCase() === q || s.name.toLowerCase().includes(q)
    );
    if (supp) {
      return `Supplement: ${supp.name}\nRecommended Dosage: ${supp.recommendedDosage}\nTiming: ${supp.timing}\nBenefits: ${supp.primaryBenefits.join(
        ', '
      )}`;
    }

    // Science match
    const science = TRAINING_SCIENCE_DATABASE.find(
      (s) => s.title.toLowerCase().includes(q) || q.includes(s.title.toLowerCase())
    );
    if (science) {
      return `Principle: ${science.title}\nSummary: ${science.summary}\nApplication: ${science.practicalApplication}`;
    }

    // Recovery match
    const recovery = RECOVERY_KNOWLEDGE_DATABASE.find(
      (r) => r.topic.toLowerCase().includes(q) || q.includes(r.topic.toLowerCase())
    );
    if (recovery) {
      return `Recovery Topic: ${recovery.topic}\nDescription: ${recovery.description}\nProtocol: ${recovery.protocol.join(
        ' '
      )}`;
    }

    return null;
  }
}
