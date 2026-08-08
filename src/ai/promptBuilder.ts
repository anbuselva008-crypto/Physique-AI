import {
  AIContext,
  DecisionReport,
  UserRequest,
  AIExecutionPlan,
  BuiltPrompt,
  AIPromptType,
  AITaskType,
} from './types';
import { TaskManager } from './tasks';

/**
 * AI Prompt Builder
 * Assembles highly structured, contextual prompts for Groq and Gemini models.
 * Purely deterministic string manipulation with zero API calls or side effects.
 */
export class AIPromptBuilder {
  /**
   * Main entry point to build an optimized BuiltPrompt.
   */
  public buildPrompt(
    context: AIContext,
    decisionReport: DecisionReport,
    userRequest: UserRequest,
    plan: AIExecutionPlan,
    overridePromptType?: AIPromptType
  ): BuiltPrompt {
    const promptType = overridePromptType || this.mapTaskToPromptType(plan.taskType);
    const provider = plan.shouldCallGemini
      ? 'gemini'
      : plan.shouldCallGroq
      ? 'groq'
      : 'universal';

    const systemPrompt = this.buildSystemPrompt(promptType, provider);
    const formattedContext = this.formatContext(context, plan.contextRequired);
    const decisionSummary = this.formatDecisionReport(decisionReport);
    const relevantKnowledge = this.getRelevantKnowledge(userRequest.prompt, promptType);
    const userPromptText = userRequest.prompt || 'Provide personalized coaching advice.';
    const outputFormat = this.buildOutputFormat(promptType, provider);

    const fullFormattedPrompt = this.assembleFullPrompt({
      systemPrompt,
      context: formattedContext,
      decisionSummary,
      relevantKnowledge,
      userRequest: userPromptText,
      outputFormat,
      provider,
    });

    return {
      promptType,
      provider,
      systemPrompt,
      context: formattedContext,
      decisionSummary,
      relevantKnowledge,
      userRequest: userPromptText,
      outputFormat,
      fullFormattedPrompt,
      metadata: {
        taskType: plan.taskType,
        estimatedTokens: plan.estimatedTokens,
        priority: plan.priority,
        hasImage: !!userRequest.imageUrl,
      },
    };
  }

  /**
   * Maps an AITaskType to an AIPromptType.
   */
  private mapTaskToPromptType(taskType: AITaskType): AIPromptType {
    switch (taskType) {
      case 'workout_advice':
        return 'workout_coach';
      case 'nutrition_advice':
        return 'nutrition_coach';
      case 'recovery':
        return 'recovery_coach';
      case 'motivation':
        return 'motivation';
      case 'weekly_review':
        return 'weekly_review';
      case 'monthly_review':
        return 'monthly_review';
      case 'photo_analysis':
        return 'photo_analysis';
      case 'progress_analysis':
      case 'question_answering':
      case 'general_chat':
      default:
        return 'daily_coach';
    }
  }

  /**
   * Builds the system prompt tailored to the prompt type and provider strengths.
   */
  private buildSystemPrompt(promptType: AIPromptType, provider: 'groq' | 'gemini' | 'universal'): string {
    const baseIdentity =
      'You are Physique AI, an elite, evidence-based strength & hypertrophy coach and clinical sports nutritionist.';

    let roleDescription = '';

    switch (promptType) {
      case 'daily_coach':
        roleDescription =
          'Your role is to analyze the user daily check-in, recovery metrics, and schedule to provide direct, actionable daily coaching guidance.';
        break;
      case 'workout_coach':
        roleDescription =
          'Your role is to optimize exercise selection, volume, intensity (RIR/RPE), progressive overload, and technique cues for hypertrophy and strength gains.';
        break;
      case 'nutrition_coach':
        roleDescription =
          'Your role is to advise on caloric targets, protein distribution, meal timing, hydration, and flexible dieting strategies tailored to the user body recomposition goal.';
        break;
      case 'recovery_coach':
        roleDescription =
          'Your role is to evaluate fatigue, sleep hygiene, DOMS, and joint stress to recommend optimal active recovery, deload protocols, or rest day strategies.';
        break;
      case 'motivation':
        roleDescription =
          'Your role is to inspire discipline, reinforce streak consistency, reframe psychological fatigue, and cultivate long-term commitment.';
        break;
      case 'weekly_review':
        roleDescription =
          'Your role is to conduct a comprehensive weekly progress audit, highlighting volume adherence, weight trends, strength gains, and key adjustments for next week.';
        break;
      case 'monthly_review':
        roleDescription =
          'Your role is to provide a high-level monthly body transformation synthesis, evaluating body composition trends, macro consistency, and macrocycle adjustments.';
        break;
      case 'photo_analysis':
        roleDescription =
          'Your role is to perform objective, supportive physique assessment, estimating muscle symmetry, body composition markers, and structural posture.';
        break;
      case 'general_chat':
      default:
        roleDescription =
          'Your role is to answer fitness, nutrition, and wellness questions with concise, science-backed clarity.';
        break;
    }

    let providerModifier = '';
    if (provider === 'groq') {
      providerModifier =
        ' OPTIMIZATION DIRECTIVE (Groq Ultra-Fast Execution): Be extremely concise, punchy, and direct. Deliver actionable answers immediately in bullet points without preamble or conversational filler.';
    } else if (provider === 'gemini') {
      providerModifier =
        ' OPTIMIZATION DIRECTIVE (Gemini Deep Reasoning): Conduct a thorough step-by-step synthesis of all user data, structural context, and risk flags before rendering your final structured recommendation.';
    }

    return `${baseIdentity} ${roleDescription}${providerModifier}`;
  }

  /**
   * Formats required AIContext fields into a readable Markdown block.
   */
  private formatContext(context: AIContext, contextRequired: string[]): string {
    const lines: string[] = ['### User Profile & Current Context'];

    const prof = context.profile;
    const stats = prof.stats;
    lines.push(`- **User**: ${stats.name} (${stats.age}y/o)`);
    lines.push(`- **Primary Goal**: ${stats.fitnessGoal} (Target Weight: ${stats.targetWeightKg}kg)`);
    lines.push(`- **Experience Level**: ${stats.experience}`);
    lines.push(`- **Current Weight**: ${stats.currentWeightKg}kg`);

    if (prof.rawProfile.schedule) {
      const s = prof.rawProfile.schedule;
      lines.push(`- **Schedule**: Wake ${s.wakeUpTime} | College/Work ${s.collegeStart}-${s.collegeEnd} | Preferred Gym Time ${s.gymTime}`);
    }

    if (contextRequired.includes('todayCheckIn')) {
      const chk = context.todayCheckIn;
      lines.push('\n### Today Check-In');
      lines.push(`- Has Checked In Today: ${chk.hasCheckedInToday ? 'YES' : 'NO'}`);
      if (chk.summary.sleepHours !== null) lines.push(`- Sleep: ${chk.summary.sleepHours} hrs`);
      if (chk.summary.energyLevel !== null) lines.push(`- Energy Level: ${chk.summary.energyLevel}/5`);
      if (chk.summary.soreness) lines.push(`- Soreness: ${chk.summary.soreness}`);
      if (chk.summary.painNotes) lines.push(`- Pain Flag: ${chk.summary.painNotes}`);
    }

    if (contextRequired.includes('workout')) {
      const w = context.workout;
      lines.push('\n### Workout Status');
      lines.push(`- Completed Today: ${w.isWorkoutCompleted ? 'YES' : 'NO'}`);
      lines.push(`- Scheduled Session: "${w.statistics.workoutTitle}"`);
      lines.push(`- Exercises Planned: ${w.statistics.totalExercises}`);
      lines.push(`- Sets Completed: ${w.statistics.completedSets} / ${w.statistics.totalSets} (${w.statistics.completionPercentage}%)`);
    }

    if (contextRequired.includes('nutrition')) {
      const n = context.nutrition;
      lines.push('\n### Nutrition & Macros');
      lines.push(`- Caloric Goal: ${n.consumed.calories} / ${n.goals.targetCalories} kcal (Remaining: ${n.remaining.calories} kcal)`);
      lines.push(`- Protein Goal: ${n.consumed.protein} / ${n.goals.targetProtein} g (Remaining: ${n.remaining.protein} g)`);
      lines.push(`- Water Intake: ${n.todayWater.ml} / ${n.goals.targetWaterMl} ml`);
    }

    if (contextRequired.includes('streaks')) {
      const str = context.streaks;
      lines.push('\n### Consistency & Streaks');
      lines.push(`- Check-In Streak: ${str.checkInStreakDays} days`);
      lines.push(`- Workout Streak: ${str.workoutStreakDays} days`);
      lines.push(`- Weekly Adherence: ${str.weeklyWorkoutAdherence}%`);
    }

    return lines.join('\n');
  }

  /**
   * Formats the DecisionReport output into a concise summary block.
   */
  private formatDecisionReport(report: DecisionReport): string {
    const lines: string[] = ['### Deterministic Rule Engine Report'];

    lines.push(`- **Recovery Score**: ${report.recovery.score}/100 (${report.recovery.status.toUpperCase()})`);
    lines.push(`- **Workout Recommendation**: ${report.workout.recommendation.toUpperCase()} (Intensity Target: ${report.workout.intensityAdjustmentPercentage}%)`);
    lines.push(`- **Summary**: ${report.summary}`);

    if (report.triggeredRules.length > 0) {
      lines.push('\n**Triggered Rule Flags:**');
      for (const rule of report.triggeredRules) {
        lines.push(`- [${rule.severity.toUpperCase()}] ${rule.title}: ${rule.description}`);
      }
    }

    if (report.prioritizedActions.length > 0) {
      lines.push('\n**Prioritized Rule Recommendations:**');
      for (const act of report.prioritizedActions) {
        lines.push(`${act.priority}. **${act.title}**: ${act.actionItem}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Searches knowledge base or returns task-specific science principles.
   */
  private getRelevantKnowledge(prompt: string, promptType: AIPromptType): string {
    const matched = TaskManager.searchKnowledgeBase(prompt);
    if (matched) {
      return `### Verified Knowledge Match\n${matched}`;
    }

    // Default science principle by prompt type
    switch (promptType) {
      case 'workout_coach':
        return '### Science Principle: Progressive Overload & RIR\nTrain within 1-3 Reps in Reserve (RIR) on compound lifts. Hypertrophy occurs optimally between 10-20 direct working sets per muscle group weekly.';
      case 'nutrition_coach':
        return '### Science Principle: Protein Distribution & Thermogenesis\nAim for 1.6 - 2.2g of protein per kg of body weight distributed across 3-5 meals. Protein has a 20-30% thermic effect of food (TEF).';
      case 'recovery_coach':
        return '### Science Principle: CNS Recovery & Sleep Hygiene\nGrowth hormone pulse peaks during slow-wave sleep. Muscle protein synthesis drops significantly with < 6 hours of sleep.';
      default:
        return '### Science Principle: Consistency & Recomposition\nFat loss and muscle retention depend primarily on energy balance adherence and daily habit streak momentum.';
    }
  }

  /**
   * Defines required output structure based on prompt type and provider.
   */
  private buildOutputFormat(promptType: AIPromptType, provider: 'groq' | 'gemini' | 'universal'): string {
    if (provider === 'groq') {
      return `### REQUIRED OUTPUT FORMAT (Groq Optimized)
1. **Direct Answer / Recommendation** (2-3 punchy sentences)
2. **Action Plan** (3 bullet points max)
3. **Key Safety / Recovery Note** (1 line)`;
    }

    switch (promptType) {
      case 'weekly_review':
      case 'monthly_review':
        return `### REQUIRED OUTPUT FORMAT (Review Mode)
1. **Executive Summary**: Key wins and adherence score.
2. **Data & Trend Analysis**: Volume, body weight, macro consistency breakdown.
3. **Identified Bottlenecks**: Recovery, sleep, or nutrition leaks.
4. **Action Plan for Next Phase**: 3 clear, prioritized adjustments.`;

      case 'photo_analysis':
        return `### REQUIRED OUTPUT FORMAT (Physique Vision Analysis)
1. **Visual Assessment**: Muscle symmetry, posture, visible conditioning markers.
2. **Observed Strengths**: Well-developed muscle groups.
3. **Focus Areas**: Muscular balance and recomposition priorities.
4. **Action Item**: Training/nutrition adjustment.`;

      default:
        return `### REQUIRED OUTPUT FORMAT
1. **Coach Brief**: Clear, encouraging, evidence-based statement.
2. **Today Plan**: Specific exercise / macro / recovery adjustments.
3. **Pro-Tip**: Science-backed tip tailored to current context.`;
    }
  }

  /**
   * Assembles the 6 required core sections into a full formatted string.
   */
  private assembleFullPrompt(parts: {
    systemPrompt: string;
    context: string;
    decisionSummary: string;
    relevantKnowledge: string;
    userRequest: string;
    outputFormat: string;
    provider: string;
  }): string {
    return `====================================================
SYSTEM PROMPT
====================================================
${parts.systemPrompt}

====================================================
USER CONTEXT
====================================================
${parts.context}

====================================================
DECISION ENGINE SUMMARY
====================================================
${parts.decisionSummary}

====================================================
RELEVANT KNOWLEDGE BASE
====================================================
${parts.relevantKnowledge}

====================================================
USER REQUEST
====================================================
${parts.userRequest}

====================================================
OUTPUT FORMAT INSTRUCTIONS
====================================================
${parts.outputFormat}
`;
  }
}

export const promptBuilder = new AIPromptBuilder();

export const buildAIPrompt = (
  context: AIContext,
  decisionReport: DecisionReport,
  userRequest: UserRequest,
  plan: AIExecutionPlan,
  overridePromptType?: AIPromptType
): BuiltPrompt => {
  return promptBuilder.buildPrompt(context, decisionReport, userRequest, plan, overridePromptType);
};
