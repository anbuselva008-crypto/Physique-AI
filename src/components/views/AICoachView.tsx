import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  RefreshCw,
  Zap,
  Sparkles,
  AlertTriangle,
  Clock,
  Cpu,
  Trash2,
  Flame,
  Dumbbell,
  Apple,
  HeartPulse,
  TrendingUp,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import {
  buildAIContext,
  analyzeAIContext,
  memoryEngine,
  planAIExecution,
  buildAIPrompt,
  executeUnifiedAITask,
  UnifiedAIResponse,
} from '../../ai';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  status: 'sending' | 'success' | 'error';
  metadata?: {
    provider?: string;
    model?: string;
    latencyMs?: number;
    tokens?: number;
    taskType?: string;
    reason?: string;
    error?: string;
  };
  lastUserPrompt?: string; // Stored for retries
}

const SUGGESTED_QUESTIONS = [
  {
    icon: Dumbbell,
    label: 'Should I workout today?',
    prompt: 'Should I workout today?',
    category: 'Workout',
  },
  {
    icon: Apple,
    label: 'How much protein do I still need?',
    prompt: 'How much protein do I still need today?',
    category: 'Nutrition',
  },
  {
    icon: TrendingUp,
    label: 'Review my progress.',
    prompt: 'Review my overall fitness and body progress.',
    category: 'Analysis',
  },
  {
    icon: HeartPulse,
    label: 'Suggest dinner.',
    prompt: 'Suggest a healthy dinner based on my remaining calorie and protein goals.',
    category: 'Nutrition',
  },
  {
    icon: Flame,
    label: 'Motivate me.',
    prompt: 'I need motivation to stay consistent with my gym and nutrition goals today.',
    category: 'Mindset',
  },
];

export const AICoachView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome_msg',
      sender: 'assistant',
      text: `Hello! I am your **Physique AI Coach**.

I synthesize your real-time **sleep**, **energy**, **soreness**, **workout logs**, and **nutrition macros** through our deterministic **Decision Engine** and **Groq Llama-3.3 70B** ultra-fast reasoning model.

How can I help optimize your training or diet today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'success',
      metadata: {
        provider: 'Rule Engine + Groq',
        model: 'llama-3.3-70b-versatile',
        latencyMs: 12,
        tokens: 150,
        taskType: 'general_chat',
        reason: 'System initialization greeting.',
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMemorySummary, setActiveMemorySummary] = useState(() => memoryEngine.summarize());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (promptTextText?: string) => {
    const textToSend = (promptTextText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsgId = `msg_user_${Date.now()}`;
    const assistantMsgId = `msg_ai_${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: timestampStr,
      status: 'success',
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!promptTextText) setInput('');
    setIsLoading(true);

    await processAIPipeline(textToSend, assistantMsgId);
  };

  const processAIPipeline = async (userPromptText: string, assistantMsgId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      // 1. AIContextBuilder: Assemble real-time unified context
      const context = buildAIContext();

      // 2. DecisionEngine: Run deterministic rule evaluations
      const decisionReport = analyzeAIContext(context);

      // 3. MemoryEngine: Learn long-term patterns & preferences
      memoryEngine.learn(context, decisionReport, {
        key: 'recent_user_query',
        value: userPromptText,
        category: 'user_feedback',
      });
      setActiveMemorySummary(memoryEngine.summarize());

      // 4. AIOrchestrator: Compute execution strategy & provider routing
      const plan = planAIExecution(context, decisionReport, userPromptText);

      // 5. PromptBuilder: Construct structured prompt package
      const promptPackage = buildAIPrompt(context, decisionReport, { prompt: userPromptText }, plan);

      // 6. AIProviderManager: Execute task via Groq or Gemini with automatic fallback
      const aiResult: UnifiedAIResponse = await executeUnifiedAITask({
        plan,
        context,
        decisionReport,
        promptPackage,
        userRequest: userPromptText,
      });

      if (aiResult.success) {
        const providerName =
          aiResult.provider === 'rule_engine'
            ? 'Rule Engine'
            : aiResult.provider === 'knowledge_base'
            ? 'Knowledge Base'
            : aiResult.provider === 'gemini'
            ? 'Gemini 2.5'
            : 'Groq Llama-3.3';

        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          sender: 'assistant',
          text: aiResult.content,
          timestamp: timestampStr,
          status: 'success',
          metadata: {
            provider: aiResult.fallbackUsed ? `${providerName} (Fallback)` : providerName,
            model: aiResult.model,
            latencyMs: aiResult.latencyMs,
            tokens: aiResult.totalTokens || plan.estimatedTokens,
            taskType: plan.taskType,
            reason: plan.reason,
          },
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: assistantMsgId,
          sender: 'assistant',
          text: aiResult.error || 'Failed to generate AI response.',
          timestamp: timestampStr,
          status: 'error',
          lastUserPrompt: userPromptText,
          metadata: {
            provider: aiResult.provider.toUpperCase(),
            model: aiResult.model,
            latencyMs: aiResult.latencyMs,
            error: aiResult.error,
            taskType: plan.taskType,
          },
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const fatalErrorMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: `Error processing request: ${errorMessage}`,
        timestamp: timestampStr,
        status: 'error',
        lastUserPrompt: userPromptText,
        metadata: {
          provider: 'Groq',
          error: errorMessage,
        },
      };
      setMessages((prev) => [...prev, fatalErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (msg: ChatMessage) => {
    if (!msg.lastUserPrompt || isLoading) return;

    // Remove the error message from history before retrying
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    setIsLoading(true);

    const newAssistantMsgId = `msg_ai_retry_${Date.now()}`;
    await processAIPipeline(msg.lastUserPrompt, newAssistantMsgId);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_msg_reset',
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you right now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'success',
        metadata: {
          provider: 'Physique AI System',
          latencyMs: 1,
        },
      },
    ]);
  };

  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-emerald-400 mt-2 mb-1">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base font-bold text-emerald-300 mt-2 mb-1">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-lg font-extrabold text-white mt-2 mb-1">
            {trimmed.replace('# ', '')}
          </h1>
        );
      }

      // Process bold formatting **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-emerald-200">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-zinc-200 my-0.5">
            {renderedParts.slice(1)}
          </li>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={idx} className="flex gap-2 my-1 text-zinc-200">
            <span className="font-bold text-emerald-400">{trimmed.split(' ')[0]}</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-zinc-200 leading-relaxed my-0.5">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto px-3 sm:px-6 py-2">
      {/* Top Header Card */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-3.5 mb-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121212] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">Physique AI Coach</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Groq Llama-3.3 70B
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Context-Aware Decision Engine • {activeMemorySummary.totalMemories} Long-term Memories Learned
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          title="Clear Chat History"
          className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Questions Carousel / Quick Actions */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Suggested Prompts
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {SUGGESTED_QUESTIONS.map((sq, idx) => {
            const IconComponent = sq.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(sq.prompt)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 whitespace-nowrap transition-all hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50"
              >
                <IconComponent className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{sq.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isError = msg.status === 'error';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-md ${
                  isUser
                    ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-50 rounded-tr-none'
                    : isError
                    ? 'bg-red-950/40 border border-red-500/40 text-red-100 rounded-tl-none'
                    : 'bg-[#121212] border border-zinc-800 text-zinc-100 rounded-tl-none'
                }`}
              >
                {/* Error Banner */}
                {isError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-2 pb-2 border-b border-red-500/30">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Inference Error</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="text-sm leading-relaxed space-y-1">
                  {isUser ? <p>{msg.text}</p> : renderFormattedMarkdown(msg.text)}
                </div>

                {/* Retry Button on Error */}
                {isError && msg.lastUserPrompt && (
                  <div className="mt-3 pt-2 border-t border-red-500/20 flex items-center justify-between">
                    <span className="text-xs text-red-300/80">Check GROQ_API_KEY or connection</span>
                    <button
                      onClick={() => handleRetry(msg)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Assistant Metadata Footer (Latency, Tokens, Provider) */}
                {!isUser && !isError && msg.metadata && (
                  <div className="mt-3 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 font-mono">
                    {msg.metadata.provider && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Cpu className="w-3 h-3" />
                        {msg.metadata.provider}
                      </span>
                    )}

                    {msg.metadata.latencyMs !== undefined && (
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {msg.metadata.latencyMs}ms
                      </span>
                    )}

                    {msg.metadata.tokens !== undefined && (
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        ~{msg.metadata.tokens} tokens
                      </span>
                    )}

                    {msg.metadata.taskType && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {msg.metadata.taskType}
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1 text-right ${
                    isUser ? 'text-emerald-300/60' : 'text-zinc-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-[#121212] border border-zinc-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse delay-150" />
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                Evaluating Decision Engine & Generating Groq Response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="mt-3 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Physique AI Coach anything about your workout, nutrition, recovery..."
            disabled={isLoading}
            className="w-full bg-[#121212] border border-zinc-800 focus:border-emerald-500 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all disabled:opacity-30 disabled:hover:bg-emerald-500"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
