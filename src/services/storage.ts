import {
  UserProfile,
  SadhanaPractice,
  PracticeSession,
  Task,
  TaskEvent,
  Subject,
  Chapter,
  Topic,
  ReviewEvent,
  MistakeEntry,
  MockTest,
  Challenge,
  ChallengeMembership,
  SharedPost,
  DevotionalResource,
  Announcement,
  DailyReflection,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'sanjivani_profile',
  PRACTICES: 'sanjivani_practices',
  SESSIONS: 'sanjivani_sessions',
  TASKS: 'sanjivani_tasks',
  TASK_EVENTS: 'sanjivani_task_events',
  SUBJECTS: 'sanjivani_subjects',
  CHAPTERS: 'sanjivani_chapters',
  TOPICS: 'sanjivani_topics',
  REVIEW_EVENTS: 'sanjivani_review_events',
  MISTAKES: 'sanjivani_mistakes',
  TESTS: 'sanjivani_tests',
  CHALLENGES: 'sanjivani_challenges',
  CHALLENGE_MEMBERSHIPS: 'sanjivani_challenge_memberships',
  SHARED_POSTS: 'sanjivani_shared_posts',
  RESOURCES: 'sanjivani_resources',
  ANNOUNCEMENTS: 'sanjivani_announcements',
  REFLECTIONS: 'sanjivani_reflections',
  ONBOARDED: 'sanjivani_onboarded',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read key ${key} from storage:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save key ${key} to storage:`, e);
  }
}

export const StorageService = {
  isOnboarded(): boolean {
    return getItem(STORAGE_KEYS.ONBOARDED, false);
  },

  setOnboarded(value: boolean): void {
    setItem(STORAGE_KEYS.ONBOARDED, value);
  },

  getProfile(): UserProfile {
    const defaultProfile: UserProfile = {
      id: 'usr_default',
      displayName: 'Sadhak Arjun',
      email: 'sadhak@sanjivani.local',
      role: 'member',
      lifeStage: 'student',
      language: 'en',
      theme: 'devotional',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      dailyAvailableHours: 6,
      primaryGoals: ['Exam Excellence with Deep Understanding', 'Steady Daily Sadhana', 'Mental Composure & Focus'],
      importantResponsibilities: ['Preparation for Upcoming Examination', 'Family Care & Respectful Living', 'Physical Well-being'],
      preferredPlanningStyle: 'structured',
      notificationsEnabled: true,
      privacyLevel: 'strict_private',
      soundEnabled: true,
      createdAt: new Date().toISOString(),
    };
    return getItem(STORAGE_KEYS.PROFILE, defaultProfile);
  },

  saveProfile(profile: UserProfile): void {
    setItem(STORAGE_KEYS.PROFILE, profile);
  },

  // Tasks
  getTasks(): Task[] {
    const defaultTasks: Task[] = [
      {
        id: 'tsk_1',
        userId: 'usr_default',
        title: 'Complete Integration by Parts & Trigonometric Substitution problems',
        description: 'Solve 15 active recall problems from standard question bank without checking solutions first.',
        purpose: 'Master core exam question formats and eliminate sign errors.',
        category: 'study',
        priority: 'urgent_important',
        estimatedMinutes: 60,
        deadline: new Date().toISOString().split('T')[0],
        subtasks: [
          { id: 'sub_1', title: 'Solve Q1-Q5 independently', completed: true },
          { id: 'sub_2', title: 'Solve Q6-Q10 under 20-min timed constraint', completed: false },
          { id: 'sub_3', title: 'Log any conceptual slip-ups into Mistake Notebook', completed: false },
        ],
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tsk_2',
        userId: 'usr_default',
        title: 'Revise Operating Systems: Banker\'s Algorithm & Deadlock Prevention',
        description: 'Simulate safety algorithm matrices on paper to test independent reproduction.',
        purpose: 'Core computer science foundational topic with high examination weightage.',
        category: 'study',
        priority: 'important',
        estimatedMinutes: 45,
        deadline: new Date().toISOString().split('T')[0],
        subtasks: [],
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tsk_3',
        userId: 'usr_default',
        title: 'Morning Household Seva & Assist Elders',
        description: 'Ensure family morning duties are taken care of sincerely before settling into study blocks.',
        purpose: 'Kartavya fulfillment: sincere duty toward family and home.',
        category: 'family',
        priority: 'important',
        estimatedMinutes: 30,
        subtasks: [],
        status: 'completed',
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tsk_4',
        userId: 'usr_default',
        title: '30-Minute Brisk Walk & Pranayama Breathing',
        description: 'Physical renewal to support mental stamina and calm nervous system.',
        purpose: 'Maintain physical instrument for long-term study and spiritual stability.',
        category: 'health',
        priority: 'routine',
        estimatedMinutes: 30,
        subtasks: [],
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return getItem(STORAGE_KEYS.TASKS, defaultTasks);
  },

  saveTask(task: Task): void {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      list[idx] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...task, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setItem(STORAGE_KEYS.TASKS, list);
  },

  deleteTask(taskId: string): void {
    const list = this.getTasks().filter(t => t.id !== taskId);
    setItem(STORAGE_KEYS.TASKS, list);
  },

  // Sadhana Practices
  getPractices(): SadhanaPractice[] {
    const defaultPractices: SadhanaPractice[] = [
      {
        id: 'prac_1',
        userId: 'usr_default',
        name: 'Shri Radha Naam Jap',
        type: 'naam_jap',
        intention: 'Deepening remembrance, inner purity, and quiet heart focus.',
        targetCount: 108,
        targetDurationMinutes: 15,
        preferredSchedule: 'brahma_muhurta',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prac_2',
        userId: 'usr_default',
        name: 'Sandhya Vandana & Sincere Reflection',
        type: 'prayer',
        intention: 'Reviewing the day with humility, offering all actions to the Divine.',
        targetDurationMinutes: 15,
        preferredSchedule: 'evening',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'prac_3',
        userId: 'usr_default',
        name: 'Devotional Listening (Satsang / Kirtan)',
        type: 'naam_sankirtan',
        intention: 'Absorbing teachings of selfless duty and divine love.',
        targetDurationMinutes: 20,
        preferredSchedule: 'morning',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    return getItem(STORAGE_KEYS.PRACTICES, defaultPractices);
  },

  savePractice(practice: SadhanaPractice): void {
    const list = this.getPractices();
    const idx = list.findIndex(p => p.id === practice.id);
    if (idx >= 0) {
      list[idx] = practice;
    } else {
      list.push(practice);
    }
    setItem(STORAGE_KEYS.PRACTICES, list);
  },

  // Practice Sessions (Private by default)
  getSessions(): PracticeSession[] {
    const defaultSessions: PracticeSession[] = [
      {
        id: 'sess_1',
        practiceId: 'prac_1',
        practiceName: 'Shri Radha Naam Jap',
        userId: 'usr_default',
        startTime: new Date(Date.now() - 3600000 * 24).toISOString(),
        durationMinutes: 16,
        count: 108,
        notes: 'Peaceful morning stillness. Focused on pure sound vibration.',
        status: 'completed',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'sess_2',
        practiceId: 'prac_2',
        practiceName: 'Sandhya Vandana & Sincere Reflection',
        userId: 'usr_default',
        startTime: new Date(Date.now() - 3600000 * 14).toISOString(),
        durationMinutes: 12,
        notes: 'Surrendered today’s anxieties and rested with gratitude.',
        status: 'completed',
        createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
      },
    ];
    return getItem(STORAGE_KEYS.SESSIONS, defaultSessions);
  },

  saveSession(session: PracticeSession): void {
    const list = this.getSessions();
    list.unshift(session);
    setItem(STORAGE_KEYS.SESSIONS, list);
  },

  // Subjects & Topics
  getSubjects(): Subject[] {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const defaultSubjects: Subject[] = [
      {
        id: 'sub_math',
        userId: 'usr_default',
        name: 'Mathematics & Analytical Reasoning',
        description: 'Advanced calculus, probability, differential equations, and linear algebra.',
        examDate: futureDate.toISOString().split('T')[0],
        importance: 'high',
        syllabusCoveragePercent: 65,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sub_cs',
        userId: 'usr_default',
        name: 'Core Systems & General Studies',
        description: 'Operating systems, algorithms, constitutional framework, and ethics in governance.',
        examDate: futureDate.toISOString().split('T')[0],
        importance: 'high',
        syllabusCoveragePercent: 52,
        createdAt: new Date().toISOString(),
      },
    ];
    return getItem(STORAGE_KEYS.SUBJECTS, defaultSubjects);
  },

  saveSubject(subject: Subject): void {
    const list = this.getSubjects();
    const idx = list.findIndex(s => s.id === subject.id);
    if (idx >= 0) list[idx] = subject;
    else list.push(subject);
    setItem(STORAGE_KEYS.SUBJECTS, list);
  },

  getChapters(): Chapter[] {
    const defaultChapters: Chapter[] = [
      { id: 'ch_calc', subjectId: 'sub_math', name: 'Integral Calculus', order: 1, status: 'in_progress' },
      { id: 'ch_prob', subjectId: 'sub_math', name: 'Probability & Distributions', order: 2, status: 'not_started' },
      { id: 'ch_os', subjectId: 'sub_cs', name: 'Operating Systems & Concurrency', order: 1, status: 'in_progress' },
      { id: 'ch_ethics', subjectId: 'sub_cs', name: 'Ethics, Integrity & Public Duty', order: 2, status: 'completed' },
    ];
    return getItem(STORAGE_KEYS.CHAPTERS, defaultChapters);
  },

  saveChapter(chapter: Chapter): void {
    const list = this.getChapters();
    const idx = list.findIndex(c => c.id === chapter.id);
    if (idx >= 0) list[idx] = chapter;
    else list.push(chapter);
    setItem(STORAGE_KEYS.CHAPTERS, list);
  },

  getTopics(): Topic[] {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultTopics: Topic[] = [
      {
        id: 'top_1',
        subjectId: 'sub_math',
        chapterId: 'ch_calc',
        name: 'Integration by Parts & Tabular Method',
        importance: 'high',
        difficulty: 'moderate',
        learningStatus: 'reviewing',
        referenceNotes: 'Formula: integral(u v dx) = u integral(v dx) - integral(u\' (integral v dx) dx). Use ILATE priority rule.',
        lastReviewedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        nextReviewDate: todayStr, // Due today!
        intervalDays: 2,
        repetitionCount: 2,
        easeFactor: 2.5,
        independentSolvedCount: 5,
        totalReviewCount: 3,
        accuracyHistory: [80, 85, 90],
      },
      {
        id: 'top_2',
        subjectId: 'sub_math',
        chapterId: 'ch_calc',
        name: 'Definite Integrals & King\'s Property',
        importance: 'high',
        difficulty: 'challenging',
        learningStatus: 'learning',
        referenceNotes: 'Integral from a to b of f(x)dx = Integral from a to b of f(a+b-x)dx. Crucial symmetry shortcut.',
        lastReviewedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        nextReviewDate: todayStr, // Due today!
        intervalDays: 1,
        repetitionCount: 1,
        easeFactor: 2.2,
        independentSolvedCount: 2,
        totalReviewCount: 2,
        accuracyHistory: [60, 70],
      },
      {
        id: 'top_3',
        subjectId: 'sub_cs',
        chapterId: 'ch_os',
        name: 'Deadlock Conditions & Banker\'s Algorithm',
        importance: 'high',
        difficulty: 'moderate',
        learningStatus: 'reviewing',
        referenceNotes: 'Four necessary Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
        lastReviewedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
        nextReviewDate: todayStr,
        intervalDays: 4,
        repetitionCount: 3,
        easeFactor: 2.6,
        independentSolvedCount: 6,
        totalReviewCount: 4,
        accuracyHistory: [85, 90, 95],
      },
      {
        id: 'top_4',
        subjectId: 'sub_cs',
        chapterId: 'ch_ethics',
        name: 'Nishkama Karma in Administrative Service',
        importance: 'medium',
        difficulty: 'easy',
        learningStatus: 'mastered',
        referenceNotes: 'Performing duty without attachment to fruit; moral fortitude in conflict of interest scenarios.',
        lastReviewedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
        nextReviewDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
        intervalDays: 12,
        repetitionCount: 4,
        easeFactor: 2.7,
        independentSolvedCount: 8,
        totalReviewCount: 5,
        accuracyHistory: [90, 95, 100],
      },
    ];
    return getItem(STORAGE_KEYS.TOPICS, defaultTopics);
  },

  saveTopic(topic: Topic): void {
    const list = this.getTopics();
    const idx = list.findIndex(t => t.id === topic.id);
    if (idx >= 0) list[idx] = topic;
    else list.push(topic);
    setItem(STORAGE_KEYS.TOPICS, list);
  },

  // Review Events
  getReviewEvents(): ReviewEvent[] {
    return getItem(STORAGE_KEYS.REVIEW_EVENTS, []);
  },

  saveReviewEvent(event: ReviewEvent): void {
    const list = this.getReviewEvents();
    list.unshift(event);
    setItem(STORAGE_KEYS.REVIEW_EVENTS, list);
  },

  // Mistake Notebook
  getMistakes(): MistakeEntry[] {
    const defaultMistakes: MistakeEntry[] = [
      {
        id: 'mstk_1',
        userId: 'usr_default',
        topicId: 'top_2',
        topicName: 'Definite Integrals & King\'s Property',
        subjectName: 'Mathematics',
        problemDescription: 'Evaluate Integral from 0 to pi/2 of (sin x)^2024 / ((sin x)^2024 + (cos x)^2024) dx',
        category: 'conceptual',
        userAttemptDescription: 'Tried standard substitution u = sin x, resulting in intractable algebraic power terms.',
        whyFailedReason: 'Did not recognize the f(x) + f(a+b-x) complementary symmetry where numerator and denominator sum to 1.',
        correctMethod: 'Apply King\'s property: let I = integral. Then 2I = integral from 0 to pi/2 of 1 dx = pi/2, so I = pi/4.',
        followUpAction: 'Solve 3 additional trigonometric symmetry integrals.',
        retestStatus: 'pending',
        nextRetestDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'mstk_2',
        userId: 'usr_default',
        topicId: 'top_1',
        topicName: 'Integration by Parts',
        subjectName: 'Mathematics',
        problemDescription: 'Integral of x * e^(2x) dx',
        category: 'calculation',
        userAttemptDescription: 'Correctly chose u = x and dv = e^(2x)dx, but wrote antiderivative of e^(2x) as 2e^(2x) instead of (1/2)e^(2x).',
        whyFailedReason: 'Careless sign/coefficient slip under time pressure.',
        correctMethod: 'Antiderivative of e^(kx) is (1/k)e^(kx). Result: (1/2)x e^(2x) - (1/4)e^(2x) + C.',
        retestStatus: 'passed',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
    return getItem(STORAGE_KEYS.MISTAKES, defaultMistakes);
  },

  saveMistake(entry: MistakeEntry): void {
    const list = this.getMistakes();
    const idx = list.findIndex(m => m.id === entry.id);
    if (idx >= 0) list[idx] = entry;
    else list.unshift(entry);
    setItem(STORAGE_KEYS.MISTAKES, list);
  },

  // Mock Tests
  getTests(): MockTest[] {
    const defaultTests: MockTest[] = [
      {
        id: 'test_1',
        userId: 'usr_default',
        subjectName: 'Mathematics & Analytical Reasoning',
        testName: 'Sectional Mock Exam 1: Advanced Calculus & Algebra',
        date: new Date(Date.now() - 3600000 * 24 * 3).toISOString().split('T')[0],
        maxMarks: 100,
        obtainedMarks: 76,
        durationMinutes: 90,
        topicBreakdowns: [
          { topicName: 'Calculus', score: 38, maxScore: 50 },
          { topicName: 'Algebra & Matrices', score: 38, maxScore: 50 },
        ],
        reflection: 'Solid conceptual retention. Lost 14 marks solely due to calculation slips in the last 15 minutes.',
      },
    ];
    return getItem(STORAGE_KEYS.TESTS, defaultTests);
  },

  saveTest(test: MockTest): void {
    const list = this.getTests();
    list.unshift(test);
    setItem(STORAGE_KEYS.TESTS, list);
  },

  // Reflections
  getReflections(): DailyReflection[] {
    const defaultReflections: DailyReflection[] = [
      {
        id: 'refl_yesterday',
        userId: 'usr_default',
        date: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0],
        sankalpa: 'To perform every study session with complete absorption and no phone checks.',
        wentWell: 'Maintained 3 uninterrupted study blocks and finished morning Sadhana before sunrise.',
        dutyFulfilledSincerely: 'Helped family with afternoon tasks and resolved calculus doubts without shortcuts.',
        attentionInterruptedBy: 'Checked social media notifications around 4 PM for 20 minutes.',
        whatLearned: 'Consistent revision early in the morning prevents afternoon fatigue.',
        changeTomorrow: 'Keep smartphone in another room during the first two focus blocks.',
        aiInsight: 'A sincere day of duty. Acknowledging distractions without guilt is the foundation of lasting mastery.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
    return getItem(STORAGE_KEYS.REFLECTIONS, defaultReflections);
  },

  saveReflection(reflection: DailyReflection): void {
    const list = this.getReflections();
    const idx = list.findIndex(r => r.date === reflection.date);
    if (idx >= 0) list[idx] = reflection;
    else list.unshift(reflection);
    setItem(STORAGE_KEYS.REFLECTIONS, list);
  },

  // Community Challenges
  getChallenges(): Challenge[] {
    const defaultChallenges: Challenge[] = [
      {
        id: 'chal_1',
        title: '21-Day Sincere Dawn & Focus Challenge',
        description: 'Wake with tranquility, complete your chosen personal Sadhana (Naam Jap/Prayer), and execute 1 high-priority duty before midday.',
        purpose: 'Cultivating spiritual grounding, emotional calm, and unshakable daytime focus.',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 3600000 * 24 * 21).toISOString().split('T')[0],
        rules: [
          'Choose your personal Sadhana practice (e.g., 108 Radha Naam, prayer, or quiet reflection).',
          'Tackle your most demanding study or professional duty with zero distractions.',
          'Log your daily sincerity check-in. Private counts remain private.',
        ],
        suggestedDailyActivity: 'Morning Sadhana + 90-Minute Uninterrupted Focus Block',
        participantCount: 148,
        isPublished: true,
        category: 'sadhana',
      },
      {
        id: 'chal_2',
        title: 'Active Recall & Zero-Cramming Sprint',
        description: 'Eliminate passive re-reading. Review your spaced repetition queue daily and record every error in your Mistake Notebook.',
        purpose: 'Transforming study habits into verifiable, long-term mastery.',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 3600000 * 24 * 14).toISOString().split('T')[0],
        rules: [
          'Test yourself on due topics before looking at your textbook or notes.',
          'Log all misconceptions honestly in the Mistake Notebook.',
          'Retest previous errors after 48 hours.',
        ],
        suggestedDailyActivity: 'Clear 3 due spaced repetition topics + 1 retest',
        participantCount: 92,
        isPublished: true,
        category: 'adhyayan',
      },
      {
        id: 'chal_3',
        title: 'Kartavya Seva & Digital Fast Week',
        description: 'A 7-day commitment to fulfill family responsibilities joyfully and restrict recreational phone screen time to 30 mins/day.',
        purpose: 'Deepening human connection and clearing mental noise.',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
        rules: [
          'Perform at least 1 conscious act of seva for family or community daily.',
          'No social media feeds or reels for 7 continuous days.',
        ],
        suggestedDailyActivity: '30 min active family assistance + quiet evening reflection',
        participantCount: 76,
        isPublished: true,
        category: 'kartavya',
      },
    ];
    return getItem(STORAGE_KEYS.CHALLENGES, defaultChallenges);
  },

  getChallengeMemberships(): ChallengeMembership[] {
    const defaultMemberships: ChallengeMembership[] = [
      {
        id: 'mem_1',
        challengeId: 'chal_1',
        userId: 'usr_default',
        joinedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        completedDays: [
          new Date(Date.now() - 3600000 * 48).toISOString().split('T')[0],
          new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0],
        ],
        personalGoal: 'Begin study at 7:30 AM every morning with clear heart.',
        isPublicMilestone: true,
        status: 'active',
      },
    ];
    return getItem(STORAGE_KEYS.CHALLENGE_MEMBERSHIPS, defaultMemberships);
  },

  joinChallenge(challengeId: string, personalGoal?: string): void {
    const list = this.getChallengeMemberships();
    if (list.some(m => m.challengeId === challengeId)) return;
    list.push({
      id: `mem_${Date.now()}`,
      challengeId,
      userId: 'usr_default',
      joinedAt: new Date().toISOString(),
      completedDays: [],
      personalGoal,
      isPublicMilestone: false,
      status: 'active',
    });
    setItem(STORAGE_KEYS.CHALLENGE_MEMBERSHIPS, list);
  },

  toggleChallengeDay(challengeId: string, dateStr: string): void {
    const list = this.getChallengeMemberships();
    const mem = list.find(m => m.challengeId === challengeId);
    if (!mem) return;
    if (mem.completedDays.includes(dateStr)) {
      mem.completedDays = mem.completedDays.filter(d => d !== dateStr);
    } else {
      mem.completedDays.push(dateStr);
    }
    setItem(STORAGE_KEYS.CHALLENGE_MEMBERSHIPS, list);
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    const defaultAnnouncements: Announcement[] = [
      {
        id: 'ann_1',
        title: 'Welcome to the Sanjivani Community Platform',
        content: 'Sanjivani integrates your sacred devotional intentions, everyday responsibilities, academic learning, and Sangha support. Your personal practice data is 100% private by default.',
        publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        isUrgent: false,
        authorName: 'Sanjivani Sevak Team',
      },
      {
        id: 'ann_2',
        title: 'New Study Cohort: Active Recall & Spaced Repetition',
        content: 'Join fellow students and professionals in the Adhyayan section to replace passive reading with active testing and mistake classification.',
        publishedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        isUrgent: false,
        authorName: 'Adhyayan Margadarshak',
      },
    ];
    return getItem(STORAGE_KEYS.ANNOUNCEMENTS, defaultAnnouncements);
  },

  // Approved Devotional & Wisdom Resources
  getApprovedResources(): DevotionalResource[] {
    const defaultResources: DevotionalResource[] = [
      {
        id: 'res_1',
        title: 'The Inestimable Jewel of Radha Naam',
        description: 'Teachings on the sweetness, shelter, and transformative power of remembering Shri Radha’s name in every circumstance.',
        resourceType: 'verse',
        attribution: 'Radha Vallabh Devotional Heritage',
        contentOrUrl: '“राधा नाम परम सुखदाई। भज मन निरंतर, मेट सकल कठिनाई॥” Through the holy name, the heart dissolves all burden and rests in unconditional grace.',
        category: 'radha_vallabh',
        permissionStatus: 'approved',
        tags: ['Naam Mahima', 'Grace', 'Vrindavan Bhava'],
      },
      {
        id: 'res_2',
        title: 'Karmanye Vadhikaraste: The Art of Sincere Action',
        description: 'Guidance on performing duties without anxiety for the fruit, transforming everyday study and work into sacred offering.',
        resourceType: 'teaching',
        attribution: 'Bhagavad Gita 2.47 & Sanjivani Kartavya Guidelines',
        contentOrUrl: 'You have right only to the work, never to its fruit. Do not let fruits be your motive, nor let there be in you any attachment to inaction. Fulfill your duty with complete presence of mind.',
        category: 'learning_wisdom',
        permissionStatus: 'approved',
        tags: ['Kartavya', 'Focus', 'Equanimity'],
      },
      {
        id: 'res_3',
        title: 'The Science of Active Recall & Deep Retention',
        description: 'Why testing yourself before checking solutions builds lasting neural pathways and eliminates examination anxiety.',
        resourceType: 'article',
        attribution: 'Cognitive Science & Sanjivani Adhyayan Protocol',
        contentOrUrl: 'Passive review creates the illusion of competence. Only the struggle of active retrieval strengthens the memory trace and exposes true misconceptions.',
        category: 'learning_wisdom',
        permissionStatus: 'approved',
        tags: ['Adhyayan', 'Spaced Repetition', 'Mastery'],
      },
    ];
    return getItem(STORAGE_KEYS.RESOURCES, defaultResources);
  },

  // Community Shared Posts
  getSharedPosts(): SharedPost[] {
    const defaultPosts: SharedPost[] = [
      {
        id: 'post_1',
        userId: 'usr_devotee1',
        authorName: 'Kalyani S.',
        authorRole: 'Student & Devotee',
        title: 'How quiet morning Jap transformed my study stamina',
        content: 'Earlier I used to dive directly into books with anxious energy. Starting with 15 minutes of peaceful Radha Naam Jap centered my breath and eliminated my mid-morning panic. Duty feels lighter now.',
        challengeTitle: '21-Day Sincere Dawn & Focus Challenge',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        isModerated: true,
        likes: 24,
      },
      {
        id: 'post_2',
        userId: 'usr_prof1',
        authorName: 'Vikram R.',
        authorRole: 'Software Engineer',
        title: 'The Mistake Notebook is a game changer for technical review',
        content: 'Categorizing my errors into "Conceptual" vs "Careless" revealed that 70% of my bugs were from rushing the design phase. Sincerity in small steps makes all the difference.',
        challengeTitle: 'Active Recall & Zero-Cramming Sprint',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        isModerated: true,
        likes: 19,
      },
    ];
    return getItem(STORAGE_KEYS.SHARED_POSTS, defaultPosts);
  },

  saveSharedPost(post: SharedPost): void {
    const list = this.getSharedPosts();
    list.unshift(post);
    setItem(STORAGE_KEYS.SHARED_POSTS, list);
  },

  // Export & Reset
  exportAllData(): string {
    const bundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      practices: this.getPractices(),
      sessions: this.getSessions(),
      tasks: this.getTasks(),
      subjects: this.getSubjects(),
      chapters: this.getChapters(),
      topics: this.getTopics(),
      reviewEvents: this.getReviewEvents(),
      mistakes: this.getMistakes(),
      tests: this.getTests(),
      reflections: this.getReflections(),
      challengeMemberships: this.getChallengeMemberships(),
    };
    return JSON.stringify(bundle, null, 2);
  },

  resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },
};
