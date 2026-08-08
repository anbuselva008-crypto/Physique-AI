import { PersonalizedRecommendation } from './recommendationEngine';
import { CoachQuestionCategory } from './questionClassifier';

export interface ComposedResponseOptions {
  category: CoachQuestionCategory;
  userPrompt: string;
  rawAIAnswer?: string;
  recommendation?: PersonalizedRecommendation;
  currentSituationSummary?: string;
  smartFollowUps?: string[];
}

export interface ComposedCoachResponse {
  formattedText: string;
  smartFollowUps: string[];
  category: CoachQuestionCategory;
  timestamp: string;
}

export class ResponseComposer {
  public compose(options: ComposedResponseOptions): ComposedCoachResponse {
    const {
      category,
      userPrompt,
      rawAIAnswer,
      recommendation,
      currentSituationSummary,
    } = options;

    let responseBody = '';

    if (rawAIAnswer && rawAIAnswer.length > 50) {
      // If AI model returned a comprehensive answer, refine formatting cleanly
      responseBody = rawAIAnswer;
    } else if (recommendation) {
      // Construct structured framework
      const situation = currentSituationSummary || `Assessing your query regarding **${category}** in relation to your current daily stats.`;

      responseBody = `### 📊 Current Situation
${situation}

### 🧠 Reasoning
${recommendation.rationale}

### 🎯 Recommendation
${recommendation.recommendationText}

### ⚡ Action Steps
${recommendation.actionableSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

### 🚀 Expected Benefit
${recommendation.expectedBenefit}

${recommendation.collegeContextNote ? `\n> **🎓 Schedule & College Note:** ${recommendation.collegeContextNote}` : ''}
${recommendation.budgetContextNote ? `\n> **💡 Budget Tip:** ${recommendation.budgetContextNote}` : ''}`;
    } else {
      responseBody = rawAIAnswer || `Here is your customized coach guidance based on your real-time data and goals.`;
    }

    // Generate contextually relevant smart follow-ups
    const smartFollowUps = options.smartFollowUps || this.generateSmartFollowUps(category, userPrompt);

    return {
      formattedText: responseBody,
      smartFollowUps,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  public generateSmartFollowUps(category: CoachQuestionCategory, prompt: string): string[] {
    const p = prompt.toLowerCase();

    if (category === 'Recovery' || p.includes('sleep') || p.includes('tired')) {
      return [
        'Would you like me to adjust tomorrow’s workout based on today’s recovery?',
        'Should we modify your evening supplement timing for better sleep depth?',
        'Would you like a light mobility routine to ease soreness before bed?',
      ];
    }

    if (category === 'Nutrition' || category === 'Meal Planning' || p.includes('protein')) {
      return [
        'Would you like a hostel-friendly dinner plan that hits your remaining protein target?',
        'Shall I calculate your exact weekly meal budget based on local food prices?',
        'Would you like high-protein snack options you can carry to college lectures?',
      ];
    }

    if (category === 'Workout' || category === 'Body Analysis') {
      return [
        'Would you like technique cues for your heavy compound movements today?',
        'Shall I check your latest vision analysis report for muscle symmetry progress?',
        'Would you like me to swap any exercise to better match available gym equipment?',
      ];
    }

    if (category === 'Exam Period' || category === 'College Schedule') {
      return [
        'Would you like a 30-minute compressed workout for exam days?',
        'Shall I adjust your meal timing around your afternoon lectures?',
        'Would you like a caffeine timing protocol to stay focused without ruining sleep?',
      ];
    }

    return [
      'Would you like me to review your weekly progress summary?',
      'Shall I check if your nutrition adherence is on track for your 90-day goal?',
      'Would you like recommendations tailored to tomorrow’s schedule?',
    ];
  }
}

export const responseComposer = new ResponseComposer();
