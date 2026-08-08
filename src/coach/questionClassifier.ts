export type CoachQuestionCategory =
  | 'Workout'
  | 'Nutrition'
  | 'Recovery'
  | 'Motivation'
  | 'Body Analysis'
  | 'Progress Review'
  | 'Meal Planning'
  | 'Supplement'
  | 'Lifestyle'
  | 'General Chat'
  | 'Photo Analysis'
  | 'College Schedule'
  | 'Exam Period'
  | 'Shopping'
  | 'Budget';

export interface RequiredContextFields {
  persona: boolean;
  recovery: boolean;
  workoutPlan: boolean;
  nutritionPlan: boolean;
  transformationStage: boolean;
  visionAnalysis: boolean;
  monthlyProgress: boolean;
  roadmap: boolean;
  goalTracker: boolean;
  coachReport: boolean;
  confidenceReport: boolean;
  knowledgeBase: boolean;
  conversationHistory: boolean;
}

export interface ClassificationResult {
  category: CoachQuestionCategory;
  secondaryCategories: CoachQuestionCategory[];
  intent: string;
  urgency: 'low' | 'medium' | 'high';
  isFollowUp: boolean;
  requiresPhotoAnalysis: boolean;
  requiredContext: RequiredContextFields;
}

/**
 * QuestionClassifier
 * Automatically classifies user queries to selectively retrieve context
 * and avoid unnecessary token consumption.
 */
export class QuestionClassifier {
  public classify(userPrompt: string, hasRecentUnresolvedTopic: boolean = false): ClassificationResult {
    const text = userPrompt.toLowerCase().trim();

    const isFollowUp =
      hasRecentUnresolvedTopic ||
      /^(should i|and what about|how about|what if|also|then|can i still|later|does that mean)/i.test(
        text
      ) ||
      text.split(' ').length <= 4;

    let primaryCategory: CoachQuestionCategory = 'General Chat';
    const secondaryCategories: CoachQuestionCategory[] = [];

    // Classification keyword rules
    if (/(photo|picture|front pose|side pose|physique image|camera|look at me|scan)/i.test(text)) {
      primaryCategory = 'Photo Analysis';
    } else if (/(college|class|lecture|attendance|timetable|campus|hostel|mess)/i.test(text)) {
      primaryCategory = 'College Schedule';
    } else if (/(exam|test|study|midterm|semester|finals|revision|stress)/i.test(text)) {
      primaryCategory = 'Exam Period';
    } else if (/(budget|rupees|inr|cost|expensive|cheap|money|afford|price)/i.test(text)) {
      primaryCategory = 'Budget';
    } else if (/(buy|shopping|grocery|market|store|supermarket|list)/i.test(text)) {
      primaryCategory = 'Shopping';
    } else if (/(creatine|whey|protein powder|multivitamin|fish oil|zinc|ashwagandha|supplement)/i.test(text)) {
      primaryCategory = 'Supplement';
    } else if (/(recipe|meal plan|cook|breakfast|lunch|dinner|snack|cook|prepare|what to eat)/i.test(text)) {
      primaryCategory = 'Meal Planning';
    } else if (/(body fat|chest|abs|biceps|muscle mass|posture|delts|waist|symmetry)/i.test(text)) {
      primaryCategory = 'Body Analysis';
    } else if (/(progress|roadmap|month|stage|transformation|result|recomp|weight loss|gain)/i.test(text)) {
      primaryCategory = 'Progress Review';
    } else if (/(sleep|soreness|fatigue|rest|recovery|hrv|energy|tired|slept)/i.test(text)) {
      primaryCategory = 'Recovery';
    } else if (/(workout|train|gym|exercise|sets|reps|squat|bench|deadlift|push|pull|legs)/i.test(text)) {
      primaryCategory = 'Workout';
    } else if (/(protein|calories|macros|carbs|fat|hydration|water|diet)/i.test(text)) {
      primaryCategory = 'Nutrition';
    } else if (/(lazy|motivate|give up|hard|stuck|consistency|mindset|focus)/i.test(text)) {
      primaryCategory = 'Motivation';
    } else if (/(routine|habit|sleep time|lifestyle|work|daily)/i.test(text)) {
      primaryCategory = 'Lifestyle';
    }

    // Secondary categories detection
    if (primaryCategory !== 'Workout' && /(workout|gym|train)/i.test(text)) secondaryCategories.push('Workout');
    if (primaryCategory !== 'Nutrition' && /(protein|calories|diet)/i.test(text)) secondaryCategories.push('Nutrition');
    if (primaryCategory !== 'Recovery' && /(sleep|tired|fatigue|sore)/i.test(text)) secondaryCategories.push('Recovery');
    if (primaryCategory !== 'Budget' && /(budget|inr|cost|money)/i.test(text)) secondaryCategories.push('Budget');

    const urgency: 'low' | 'medium' | 'high' =
      /(injury|pain|dizzy|exhausted|exam tomorrow|slept 3 hours|slept 4 hours)/i.test(text)
        ? 'high'
        : /(should i train|skip|sore|failed)/i.test(text)
        ? 'medium'
        : 'low';

    const requiresPhotoAnalysis = primaryCategory === 'Photo Analysis' || primaryCategory === 'Body Analysis';

    // Map necessary context fields based on category
    const requiredContext: RequiredContextFields = {
      persona: true,
      recovery: ['Recovery', 'Workout', 'Exam Period', 'College Schedule', 'Motivation'].includes(primaryCategory),
      workoutPlan: ['Workout', 'Progress Review', 'Recovery', 'College Schedule'].includes(primaryCategory),
      nutritionPlan: ['Nutrition', 'Meal Planning', 'Supplement', 'Shopping', 'Budget'].includes(primaryCategory),
      transformationStage: ['Progress Review', 'Body Analysis', 'Photo Analysis'].includes(primaryCategory),
      visionAnalysis: requiresPhotoAnalysis || primaryCategory === 'Progress Review',
      monthlyProgress: ['Progress Review', 'Body Analysis', 'Roadmap'].includes(primaryCategory),
      roadmap: ['Progress Review', 'Roadmap', 'College Schedule'].includes(primaryCategory),
      goalTracker: ['Progress Review', 'Motivation'].includes(primaryCategory),
      coachReport: true,
      confidenceReport: ['Progress Review', 'Motivation'].includes(primaryCategory),
      knowledgeBase: ['Workout', 'Nutrition', 'Supplement', 'Meal Planning', 'Shopping'].includes(primaryCategory),
      conversationHistory: true,
    };

    return {
      category: primaryCategory,
      secondaryCategories,
      intent: `User is asking about ${primaryCategory.toLowerCase()} with focus on '${text.slice(0, 40)}...'`,
      urgency,
      isFollowUp,
      requiresPhotoAnalysis,
      requiredContext,
    };
  }
}

export const questionClassifier = new QuestionClassifier();
