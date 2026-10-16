export interface PlanResponse {
  summary: string;
  assumptions?: string[];
  priorities: string[];
  proposed_actions: { time: string; action: string; durationMinutes: number; category: string }[];
  estimated_duration: string;
  rationale: string;
  deferred_items: string[];
  warnings: string[];
  requires_user_approval: boolean;
  source: 'gemini' | 'heuristic';
}

export interface RecoveryResponse {
  diagnosis: string;
  immediateAction: string;
  essentialKeep: string[];
  suggestedDefer: { title: string; reason: string }[];
  breakdownSuggestions: string[];
  source: 'gemini' | 'heuristic';
}

export interface RevisionAssistResponse {
  topic: string;
  summaryConcept?: string;
  questions: { prompt: string; hint: string; sampleAnswer: string }[];
  keyTakeaways: string[];
  source: 'gemini' | 'heuristic';
}

export interface ReflectionResponse {
  insight: string;
  encouragement: string;
  actionableSuggestion: string;
  source: 'gemini' | 'heuristic';
}

export async function checkAiHealth(): Promise<{ online: boolean; geminiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { online: false, geminiConfigured: false };
    const data = await res.json();
    return { online: true, geminiConfigured: !!data.geminiConfigured };
  } catch {
    return { online: false, geminiConfigured: false };
  }
}

export async function requestDailyPlan(params: {
  availableHours: number;
  tasks: any[];
  practices: any[];
  revisionTopics: any[];
  fixedCommitments?: string[];
  energyLevel?: string;
}): Promise<PlanResponse> {
  try {
    const res = await fetch('/api/gemini/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('AI Planning endpoint unavailable, using deterministic fallback', e);
    return {
      summary: `Deterministic Schedule for ${params.availableHours}h Available Time`,
      priorities: params.tasks.slice(0, 3).map(t => t.title),
      proposed_actions: [
        { time: 'Morning', action: 'Daily Centering & Chosen Sadhana', durationMinutes: 30, category: 'sadhana' },
        { time: 'Focus Block 1', action: params.tasks[0]?.title || 'Highest Priority Responsibility', durationMinutes: 90, category: 'kartavya' },
        { time: 'Midday', action: params.revisionTopics[0]?.name ? `Revision: ${params.revisionTopics[0].name}` : 'Core Revision', durationMinutes: 45, category: 'learning' },
        { time: 'Focus Block 2', action: params.tasks[1]?.title || 'Secondary Responsibility', durationMinutes: 60, category: 'kartavya' },
        { time: 'Evening', action: 'Evening Sincere Reflection', durationMinutes: 15, category: 'reflection' },
      ],
      estimated_duration: `${Math.min(params.availableHours, 4)} hours focused effort`,
      rationale: 'Balanced distribution between Sadhana, urgent responsibilities, and memory retention.',
      deferred_items: params.tasks.slice(3).map(t => t.title),
      warnings: params.tasks.length > 5 ? ['Workload exceeds healthy daily focus limit; non-urgent tasks deferred.'] : [],
      requires_user_approval: true,
      source: 'heuristic',
    };
  }
}

export async function requestBacklogRecovery(params: {
  overdueTasks: any[];
  upcomingDeadlines: any[];
  dailyAvailableHours: number;
  daysToRecover: number;
}): Promise<RecoveryResponse> {
  try {
    const res = await fetch('/api/gemini/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('AI Recovery endpoint unavailable, using deterministic recovery', e);
    const top = params.overdueTasks.slice(0, 2);
    const defer = params.overdueTasks.slice(2);
    return {
      diagnosis: `Identified ${params.overdueTasks.length} pending obligations. Regain control by focusing on the single most critical duty today.`,
      immediateAction: top[0]?.title || 'Complete urgent deadline responsibility',
      essentialKeep: top.map(t => t.title),
      suggestedDefer: defer.map(t => ({ title: t.title, reason: 'Lower urgency; defer to avoid cognitive overload' })),
      breakdownSuggestions: ['Decompose large tasks into 25-minute Pomodoro sessions.'],
      source: 'heuristic',
    };
  }
}

export async function requestRevisionAssist(params: {
  subjectName: string;
  topicName: string;
  difficulty?: string;
  notes?: string;
}): Promise<RevisionAssistResponse> {
  try {
    const res = await fetch('/api/gemini/revision-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return {
      topic: params.topicName,
      questions: [
        {
          prompt: `Define the core principle of ${params.topicName} in your own words before looking at notes.`,
          hint: 'Think of the fundamental reason this theorem/process exists.',
          sampleAnswer: `Core definition and application of ${params.topicName}.`,
        },
        {
          prompt: `What are 2 typical examination problem variations or common pitfalls for ${params.topicName}?`,
          hint: 'Focus on boundary cases or formula sign conventions.',
          sampleAnswer: 'Sign errors, wrong initial conditions, or misidentified assumptions.',
        },
      ],
      keyTakeaways: ['Active retrieval before checking reference sheets solidifies memory consolidation.'],
      source: 'heuristic',
    };
  }
}

export async function requestReflectionInsight(params: {
  reflectionText: string;
  completedTasksCount: number;
  sadhanaCount: number;
  primaryObstacle?: string;
}): Promise<ReflectionResponse> {
  try {
    const res = await fetch('/api/gemini/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return {
      insight: 'Sincerity in duty is true worship. Whatever was accomplished today was enough for today.',
      encouragement: 'Every honest effort lays the foundation for clarity and inner peace.',
      actionableSuggestion: 'Start tomorrow with 10 minutes of quiet mindfulness before looking at notifications.',
      source: 'heuristic',
    };
  }
}
