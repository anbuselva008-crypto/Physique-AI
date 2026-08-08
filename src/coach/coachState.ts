import { PhotoPose } from '../types';

export interface CoachUserContextSnapshot {
  personaGoal: string;
  recoveryScore: number;
  remainingProteinGrams: number;
  remainingCalories: number;
  currentWorkoutTitle: string;
  currentStage: string;
  collegeTimings?: string;
  dailyBudgetINR?: number;
  lastPhotoAnalysisDate?: string;
}

export interface UnfinishedTopic {
  id: string;
  topic: string;
  category: string;
  askedAt: string;
  contextSnippet: string;
  resolved: boolean;
}

export interface CoachState {
  sessionId: string;
  startedAt: string;
  lastActiveAt: string;
  turnCount: number;
  activeCategory: string;
  unfinishedTopics: UnfinishedTopic[];
  recentDiscussionTopics: string[];
  conversationGoals: string[];
  lastContextSnapshot?: CoachUserContextSnapshot;
}

export class CoachStateManager {
  private state: CoachState;

  constructor() {
    this.state = this.initDefaultState();
  }

  private initDefaultState(): CoachState {
    return {
      sessionId: `session_${Date.now()}`,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      turnCount: 0,
      activeCategory: 'General Chat',
      unfinishedTopics: [],
      recentDiscussionTopics: [],
      conversationGoals: ['Optimize daily adherence', 'Body recomposition progress'],
    };
  }

  public getState(): CoachState {
    return { ...this.state };
  }

  public incrementTurn(category: string): void {
    this.state.turnCount += 1;
    this.state.lastActiveAt = new Date().toISOString();
    this.state.activeCategory = category;

    if (!this.state.recentDiscussionTopics.includes(category)) {
      this.state.recentDiscussionTopics.unshift(category);
      if (this.state.recentDiscussionTopics.length > 5) {
        this.state.recentDiscussionTopics.pop();
      }
    }
  }

  public addUnfinishedTopic(topic: string, category: string, contextSnippet: string): void {
    this.state.unfinishedTopics.push({
      id: `topic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      topic,
      category,
      askedAt: new Date().toISOString(),
      contextSnippet,
      resolved: false,
    });
  }

  public resolveUnfinishedTopic(topicId: string): void {
    const found = this.state.unfinishedTopics.find((t) => t.id === topicId);
    if (found) {
      found.resolved = true;
    }
  }

  public getUnresolvedTopics(): UnfinishedTopic[] {
    return this.state.unfinishedTopics.filter((t) => !t.resolved);
  }

  public updateSnapshot(snapshot: CoachUserContextSnapshot): void {
    this.state.lastContextSnapshot = snapshot;
  }

  public resetSession(): void {
    this.state = this.initDefaultState();
  }
}

export const coachStateManager = new CoachStateManager();
