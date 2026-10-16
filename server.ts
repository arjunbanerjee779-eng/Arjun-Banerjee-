import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK securely server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

const SANJIVANI_SYSTEM_PROMPT = `You are the Sanjivani Personal Planning and Learning Assistant.
Your role is to help users integrate their personally chosen Sadhana, daily responsibilities, learning, and community participation into a realistic and sustainable routine.
Respect the user's devotional tradition and personal choices. Never claim to speak for a guru, lineage, or religious organization. Never invent quotations or attribute unverified teachings.
Encourage sincerity, responsibility, clarity, sustainable effort, and compassionate recovery after setbacks.
Use only authorized records supplied by the application. Never invent completed activities, test results, user history, or mastery evidence. Clearly distinguish facts, calculations, estimates, and recommendations.
Consider fixed commitments, available time, deadlines, importance, revision urgency, and realistic task durations.
Do not create an impossible schedule. When the user's workload exceeds available time, explain the conflict and suggest what can be deferred.
Treat spiritual practice as personal, not a competition. Never rank or score spiritual worth.
Do not shame users for missed practices, unfinished tasks, or poor test results.
Provide concise, specific, practical recommendations. Explain important trade-offs.`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// AI Daily Planning Assistant
app.post('/api/gemini/plan', async (req, res) => {
  try {
    const { availableHours, tasks, practices, revisionTopics, fixedCommitments, energyLevel } = req.body;

    if (!ai) {
      return res.status(200).json({
        summary: `Deterministic plan for ${availableHours || 6}h available time with ${energyLevel || 'balanced'} focus.`,
        priorities: tasks?.slice(0, 3)?.map((t: any) => t.title) || ['Priority Duty', 'Core Sadhana', 'Target Revision'],
        proposed_actions: [
          { time: 'Morning', action: 'Chosen Sadhana & Centering', durationMinutes: 30, category: 'sadhana' },
          { time: 'Focus Block 1', action: tasks?.[0]?.title || 'Highest Priority Responsibility', durationMinutes: 90, category: 'kartavya' },
          { time: 'Midday', action: revisionTopics?.[0]?.title ? `Revision: ${revisionTopics[0].title}` : 'Target Revision Session', durationMinutes: 45, category: 'learning' },
          { time: 'Focus Block 2', action: tasks?.[1]?.title || 'Secondary Responsibility', durationMinutes: 60, category: 'kartavya' },
          { time: 'Evening', action: 'Reflection & Peaceful Closure', durationMinutes: 15, category: 'reflection' },
        ],
        estimated_duration: `${Math.min(availableHours || 6, 4)} hours scheduled`,
        rationale: 'Deterministic fallback: balanced Sadhana, deep work on top task, and focused revision with 20% buffer.',
        deferred_items: tasks?.slice(3)?.map((t: any) => t.title) || [],
        warnings: (tasks?.length || 0) > 4 ? ['Workload is high; recommend deferring non-urgent items to protect quality.'] : [],
        requires_user_approval: true,
        source: 'heuristic',
      });
    }

    const prompt = `Based on the user's input:
- Available Hours: ${availableHours || 6} hours
- Focus/Energy: ${energyLevel || 'normal'}
- Fixed Commitments: ${JSON.stringify(fixedCommitments || [])}
- Pending Tasks: ${JSON.stringify(tasks || [])}
- Sadhana Preferences: ${JSON.stringify(practices || [])}
- Revision Topics Due: ${JSON.stringify(revisionTopics || [])}

Create a realistic daily plan. Return valid JSON only with keys:
"summary": string,
"assumptions": string[],
"priorities": string[],
"proposed_actions": array of objects { time: string, action: string, durationMinutes: number, category: string },
"estimated_duration": string,
"rationale": string,
"deferred_items": string[],
"warnings": string[],
"requires_user_approval": boolean (true)`;

    let parsed;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SANJIVANI_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });
      parsed = JSON.parse(response.text || '{}');
      return res.json({ ...parsed, source: 'gemini' });
    } catch (genError: any) {
      console.warn('Gemini generateContent error, falling back to deterministic plan:', genError?.message);
      return res.json({
        summary: `Deterministic Schedule for ${availableHours || 6}h Available Time`,
        priorities: tasks?.slice(0, 3)?.map((t: any) => t.title) || ['Priority Duty', 'Core Sadhana', 'Target Revision'],
        proposed_actions: [
          { time: 'Morning', action: 'Daily Centering & Chosen Sadhana', durationMinutes: 30, category: 'sadhana' },
          { time: 'Focus Block 1', action: tasks?.[0]?.title || 'Highest Priority Responsibility', durationMinutes: 90, category: 'kartavya' },
          { time: 'Midday', action: revisionTopics?.[0]?.name || revisionTopics?.[0]?.title ? `Revision: ${revisionTopics[0].name || revisionTopics[0].title}` : 'Core Revision Session', durationMinutes: 45, category: 'learning' },
          { time: 'Focus Block 2', action: tasks?.[1]?.title || 'Secondary Responsibility', durationMinutes: 60, category: 'kartavya' },
          { time: 'Evening', action: 'Evening Sincere Reflection', durationMinutes: 15, category: 'reflection' },
        ],
        estimated_duration: `${Math.min(availableHours || 6, 4)} hours focused effort`,
        rationale: 'Deterministic algorithm: balanced distribution of Sadhana, deep duty block, and active recall with buffer.',
        deferred_items: tasks?.slice(3)?.map((t: any) => t.title) || [],
        warnings: (tasks?.length || 0) > 4 ? ['Workload is high; non-urgent tasks deferred to preserve cognitive quality.'] : [],
        requires_user_approval: true,
        source: 'heuristic',
        upstreamNote: 'AI assistant currently high traffic; calculated by deterministic scheduler.',
      });
    }
  } catch (err: any) {
    console.error('Error generating plan:', err);
    res.status(500).json({ error: 'Failed to generate plan', message: err?.message });
  }
});

// AI Backlog Recovery Assistant
app.post('/api/gemini/recovery', async (req, res) => {
  try {
    const { overdueTasks, upcomingDeadlines, dailyAvailableHours, daysToRecover } = req.body;

    if (!ai) {
      const topTriage = (overdueTasks || []).slice(0, 2);
      const deferList = (overdueTasks || []).slice(2);
      return res.json({
        diagnosis: `You have ${overdueTasks?.length || 0} tasks needing attention. Be kind to yourself: a reset is an opportunity for renewed clarity.`,
        immediateAction: topTriage[0]?.title || 'Complete the most time-critical duty today',
        essentialKeep: topTriage.map((t: any) => t.title),
        suggestedDefer: deferList.map((t: any) => ({ title: t.title, reason: 'Non-urgent; reschedule to next week to clear mental load' })),
        breakdownSuggestions: [
          'Break large multi-hour duties into 25-minute concrete milestones.',
          'Protect 15 minutes of quiet Sadhana as an anchor, not an obstacle.',
        ],
        source: 'heuristic',
      });
    }

    const prompt = `The user has fallen behind and needs compassionate backlog recovery.
- Overdue Tasks: ${JSON.stringify(overdueTasks || [])}
- Upcoming Deadlines: ${JSON.stringify(upcomingDeadlines || [])}
- Available Hours Per Day: ${dailyAvailableHours || 4}
- Target Recovery Days: ${daysToRecover || 3}

Recommend:
1. Diagnosis without guilt or shaming
2. Immediate single next action
3. Essential tasks to keep
4. Non-essential tasks to defer, shorten, or archive
5. Breakdown suggestions for overwhelming items

Return valid JSON with keys:
"diagnosis": string,
"immediateAction": string,
"essentialKeep": string[],
"suggestedDefer": array of { title: string, reason: string },
"breakdownSuggestions": string[]`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SANJIVANI_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ ...parsed, source: 'gemini' });
    } catch (genError: any) {
      console.warn('Gemini recovery error, falling back:', genError?.message);
      const topTriage = (overdueTasks || []).slice(0, 2);
      const deferList = (overdueTasks || []).slice(2);
      return res.json({
        diagnosis: `You have ${overdueTasks?.length || 0} tasks needing attention. Be kind to yourself: a reset is an opportunity for renewed clarity.`,
        immediateAction: topTriage[0]?.title || 'Complete the most time-critical duty today',
        essentialKeep: topTriage.map((t: any) => t.title),
        suggestedDefer: deferList.map((t: any) => ({ title: t.title, reason: 'Non-urgent; reschedule to next week to clear mental load' })),
        breakdownSuggestions: [
          'Break large multi-hour duties into 25-minute concrete milestones.',
          'Protect 15 minutes of quiet Sadhana as an anchor, not an obstacle.',
        ],
        source: 'heuristic',
      });
    }
  } catch (err: any) {
    console.error('Error generating backlog recovery:', err);
    res.status(500).json({ error: 'Failed to generate recovery recommendations', message: err?.message });
  }
});

// AI Revision Assistant & Active Recall Question Generator
app.post('/api/gemini/revision-assist', async (req, res) => {
  try {
    const { subjectName, topicName, difficulty, notes, mode } = req.body;

    if (!ai) {
      return res.json({
        topic: topicName,
        questions: [
          {
            prompt: `Without checking notes, state the fundamental definition and 2 core principles of ${topicName}.`,
            sampleAnswer: `Key foundational concepts of ${topicName} in ${subjectName}.`,
            hint: 'Focus on first principles and why this concept exists.',
          },
          {
            prompt: `What common misconceptions or edge cases arise when solving problems in ${topicName}?`,
            sampleAnswer: 'Common pitfalls include sign errors, formula misapplication, or missing assumptions.',
            hint: 'Think of where students typically lose marks.',
          },
        ],
        keyTakeaways: [
          'Attempt recall actively before reading solutions.',
          'Rate your confidence honestly: genuine recall builds deep myelin pathways.',
        ],
        source: 'heuristic',
      });
    }

    const prompt = `Generate an active recall revision session for:
Subject: ${subjectName}
Topic: ${topicName}
Difficulty: ${difficulty || 'Moderate'}
User Notes or Context: ${notes || 'General standard syllabus'}
Mode: ${mode || 'active-recall'}

Generate 3 progressive active-recall prompts:
1. Conceptual retrieval (core idea)
2. Application or problem scenario
3. Synthesis or boundary condition / common pitfall

Return valid JSON with:
"topic": string,
"summaryConcept": string,
"questions": array of objects { prompt: string, hint: string, sampleAnswer: string },
"keyTakeaways": string[]`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SANJIVANI_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ ...parsed, source: 'gemini' });
    } catch (genError: any) {
      console.warn('Gemini revision assist error, falling back:', genError?.message);
      return res.json({
        topic: topicName,
        questions: [
          {
            prompt: `Without checking notes, state the fundamental definition and 2 core principles of ${topicName}.`,
            sampleAnswer: `Key foundational concepts of ${topicName} in ${subjectName}.`,
            hint: 'Focus on first principles and why this concept exists.',
          },
          {
            prompt: `What common misconceptions or edge cases arise when solving problems in ${topicName}?`,
            sampleAnswer: 'Common pitfalls include sign errors, formula misapplication, or missing assumptions.',
            hint: 'Think of where students typically lose marks.',
          },
        ],
        keyTakeaways: [
          'Attempt recall actively before reading solutions.',
          'Rate your confidence honestly: genuine recall builds deep myelin pathways.',
        ],
        source: 'heuristic',
      });
    }
  } catch (err: any) {
    console.error('Error in revision assist:', err);
    res.status(500).json({ error: 'Failed to assist revision', message: err?.message });
  }
});

// AI Evening Reflection Assistant
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    const { reflectionText, completedTasksCount, sadhanaCount, primaryObstacle } = req.body;

    if (!ai) {
      return res.json({
        insight: 'Every sincere effort counts. Rest with a peaceful heart knowing that consistent steps, however humble, build character and capability.',
        encouragement: 'Sincerity in duty is true worship. Whatever was accomplished today was enough for today.',
        actionableSuggestion: 'Tomorrow morning, begin with 10 minutes of centering before picking up digital screens.',
        source: 'heuristic',
      });
    }

    const prompt = `The user completed their evening reflection:
- Reflection thoughts: "${reflectionText || 'Day completed'}"
- Completed duties today: ${completedTasksCount || 0}
- Sadhana completed: ${sadhanaCount || 0}
- Stated obstacle: "${primaryObstacle || 'Distraction / Fatigue'}"

Provide a brief, thoughtful, spiritually grounded synthesis. Do NOT score spiritual worth. Give sincere encouragement and 1 practical recommendation for tomorrow morning.
Return valid JSON with:
"insight": string,
"encouragement": string,
"actionableSuggestion": string`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SANJIVANI_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ ...parsed, source: 'gemini' });
    } catch (genError: any) {
      console.warn('Gemini reflection error, falling back:', genError?.message);
      return res.json({
        insight: 'Every sincere effort counts. Rest with a peaceful heart knowing that consistent steps, however humble, build character and capability.',
        encouragement: 'Sincerity in duty is true worship. Whatever was accomplished today was enough for today.',
        actionableSuggestion: 'Tomorrow morning, begin with 10 minutes of centering before picking up digital screens.',
        source: 'heuristic',
      });
    }
  } catch (err: any) {
    console.error('Error reflecting:', err);
    res.status(500).json({ error: 'Failed to generate reflection insights', message: err?.message });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sanjivani Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
