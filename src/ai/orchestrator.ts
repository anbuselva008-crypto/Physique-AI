import {
  AIContext,
  DecisionReport,
  UserRequest,
  AIExecutionPlan,
  AIExecutionProvider,
  AITaskType,
} from './types';
import { TaskManager } from './tasks';

/**
 * AI Orchestrator
 * Evaluates incoming user requests alongside the AIContext and DecisionReport
 * to build an optimal AIExecutionPlan WITHOUT calling external LLM APIs directly.
 */
export class AIOrchestrator {
  /**
   * Generates a complete AIExecutionPlan for a given UserRequest.
   */
  public plan(
    context: AIContext,
    decisionReport: DecisionReport,
    request: UserRequest | string
  ): AIExecutionPlan {
    const userReq: UserRequest =
      typeof request === 'string' ? { prompt: request } : request;

    const taskType = TaskManager.classifyTask(userReq);
    const contextRequired = TaskManager.getRequiredContext(taskType);
    const estimatedTokens = TaskManager.estimateTokens(taskType, userReq.prompt.length);

    // 1. Check if Rule Engine can answer directly
    const ruleAnswer = this.checkRuleEngineCapability(userReq, decisionReport);
    const canAnswerByRuleEngine = !!ruleAnswer;

    // 2. Check if Knowledge Base can answer directly
    const knowledgeAnswer = TaskManager.searchKnowledgeBase(userReq.prompt);
    const canAnswerByKnowledgeBase = !!knowledgeAnswer;

    // 3. Determine if LLM calls are needed and which provider to route to
    let provider: AIExecutionProvider = 'groq';
    let shouldCallGroq = false;
    let shouldCallGemini = false;
    let directResponse: string | undefined = undefined;
    let reason = '';

    if (userReq.imageUrl || taskType === 'photo_analysis') {
      provider = 'gemini';
      shouldCallGemini = true;
      reason = 'Photo attachment detected. Routed to Gemini for multimodal vision analysis.';
    } else if (taskType === 'monthly_review') {
      provider = 'gemini';
      shouldCallGemini = true;
      reason = 'Monthly comprehensive review requires Gemini deep long-context reasoning.';
    } else if (canAnswerByRuleEngine) {
      provider = 'rule_engine';
      directResponse = ruleAnswer;
      reason = 'Deterministic Rule Engine satisfied query directly without LLM API overhead.';
    } else if (canAnswerByKnowledgeBase) {
      provider = 'knowledge_base';
      directResponse = knowledgeAnswer;
      reason = 'Verified match in internal Fitness & Nutrition Knowledge Base.';
    } else {
      // Default to Groq for fast, ultra-low latency response
      provider = 'groq';
      shouldCallGroq = true;
      reason = `Task classified as "${taskType}". Standard text reasoning routed to Groq for fast response.`;
    }

    // Determine Priority
    const priority = this.determinePriority(taskType, decisionReport);

    return {
      taskType,
      provider,
      reason,
      contextRequired,
      estimatedTokens,
      priority,
      canAnswerByRuleEngine,
      canAnswerByKnowledgeBase,
      shouldCallGroq,
      shouldCallGemini,
      directResponse,
    };
  }

  /**
   * Checks if simple status/rule queries can be directly fulfilled by the DecisionReport.
   */
  private checkRuleEngineCapability(
    request: UserRequest,
    report: DecisionReport
  ): string | null {
    const p = request.prompt.toLowerCase().trim();

    // Query: Should I workout today?
    if (
      p.includes('should i workout') ||
      p.includes('workout today') ||
      p.includes('can i train today')
    ) {
      const rec = report.workout;
      return `Workout Recommendation: ${rec.recommendation.toUpperCase()}. ${rec.reasoning.join(
        ' '
      )}`;
    }

    // Query: Recovery score / How is my recovery?
    if (
      p.includes('recovery score') ||
      p.includes('how is my recovery') ||
      p.includes('recovery status')
    ) {
      const rec = report.recovery;
      return `Your current Recovery Score is ${rec.score}/100 (${rec.status.toUpperCase()}). Factors: ${rec.factors.join(
        ', '
      )}.`;
    }

    // Query: Protein / Calories remaining
    if (
      p.includes('how much protein') ||
      p.includes('protein remaining') ||
      p.includes('calories left')
    ) {
      const nut = report.nutrition;
      return `Nutrition Status: You have ${nut.proteinRemaining}g protein remaining and ${nut.caloriesRemaining} kcal remaining today.`;
    }

    // Query: Streaks
    if (p.includes('my streak') || p.includes('streak count')) {
      const con = report.consistency;
      return `Check-in Streak: ${con.checkInStreakDays} days. Workout Streak: ${con.workoutStreakDays} days. Consistency Score: ${con.consistencyScore}/100.`;
    }

    return null;
  }

  /**
   * Computes priority rating based on risk factors and task type.
   */
  private determinePriority(
    taskType: AITaskType,
    report: DecisionReport
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (report.risk.injuryRiskHigh || report.recovery.status === 'critical') {
      return 'critical';
    }

    if (
      report.risk.activeRisks.length > 0 ||
      report.workout.recommendation === 'deload' ||
      taskType === 'photo_analysis'
    ) {
      return 'high';
    }

    if (
      taskType === 'weekly_review' ||
      taskType === 'monthly_review' ||
      taskType === 'workout_advice' ||
      taskType === 'nutrition_advice'
    ) {
      return 'medium';
    }

    return 'low';
  }
}

export const orchestrator = new AIOrchestrator();

export const planAIExecution = (
  context: AIContext,
  decisionReport: DecisionReport,
  request: UserRequest | string
): AIExecutionPlan => {
  return orchestrator.plan(context, decisionReport, request);
};
