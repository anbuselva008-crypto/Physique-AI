import { coachStateManager } from './coachState';
import { conversationMemory } from './conversationMemory';

export interface SavedMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export class ConversationManager {
  private history: SavedMessage[] = [];

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory(): void {
    this.history = [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: `Hello! I'm your **Physique AI Coach**. I have full awareness of your college schedule, daily recovery, workout plan, nutrition macro targets, and monthly vision progress.\n\nHow can I help optimize your training or diet today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'General Chat',
      },
    ];
  }

  public addMessage(
    sender: 'user' | 'assistant',
    text: string,
    category?: string,
    metadata?: Record<string, unknown>
  ): SavedMessage {
    const msg: SavedMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category,
      metadata,
    };

    this.history.push(msg);

    // Track state and memory
    if (sender === 'user') {
      coachStateManager.incrementTurn(category || 'General Chat');

      // Detect unfinished topics / follow-up cues (e.g. "I slept 5 hours")
      if (/(slept|sleep|tired|fatigue|exam|sore|pain|skipped)/i.test(text)) {
        coachStateManager.addUnfinishedTopic(
          text,
          category || 'Recovery',
          `User mentioned: "${text}"`
        );
      }
    } else if (sender === 'assistant') {
      // Mark unresolved topics as addressed if relevant
      const unresolved = coachStateManager.getUnresolvedTopics();
      if (unresolved.length > 0) {
        unresolved.forEach((u) => coachStateManager.resolveUnfinishedTopic(u.id));
      }
    }

    return msg;
  }

  public getHistory(limit: number = 20): SavedMessage[] {
    return this.history.slice(-limit);
  }

  public getRecentUserContextSnippet(): string {
    const userMessages = this.history
      .filter((m) => m.sender === 'user')
      .slice(-3)
      .map((m) => `"${m.text}"`);

    const unresolved = coachStateManager.getUnresolvedTopics();
    const unresolvedSnippet = unresolved
      .map((u) => `[Unfinished Topic]: ${u.topic} (${u.category})`)
      .join('; ');

    return `Recent User Cues: ${userMessages.join(' | ')}${unresolvedSnippet ? ` | ${unresolvedSnippet}` : ''}`;
  }

  public clearHistory(): void {
    this.history = [];
    coachStateManager.resetSession();
    this.seedInitialHistory();
  }
}

export const conversationManager = new ConversationManager();
